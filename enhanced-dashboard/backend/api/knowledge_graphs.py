"""
Knowledge Graph API Endpoints
Phase 4: Visual Knowledge Graphs & AI Integration

This module provides comprehensive API endpoints for:
- Interactive Knowledge Graph management
- Node and Edge operations
- AI-powered pattern analysis
- LLM assistant integration
- RAG document processing
- Clustering and visualization
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, text
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import asyncio
import json
import uuid
from pathlib import Path
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import hashlib

from ..core.database import get_db
from ..models.user import User
from ..models.organization import Organization
from ..models.knowledge_graph import (
    KnowledgeGraph, KnowledgeNode, KnowledgeEdge, NodeConnectedness,
    AIInsight, LLMSession, LLMQuery, RAGDocument,
    NodeType, EdgeType, calculate_graph_metrics, update_graph_statistics
)
from ..schemas.knowledge_graph import *

router = APIRouter(prefix="/api/graphs", tags=["knowledge-graphs"])


# ===== Graph Management Endpoints =====

@router.post("/", response_model=KnowledgeGraphResponse)
async def create_knowledge_graph(
    graph_data: KnowledgeGraphCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new knowledge graph"""
    
    # Verify user has access to organization
    org = db.query(Organization).filter(
        Organization.id == graph_data.organization_id
    ).first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Create the graph
    graph = KnowledgeGraph(
        name=graph_data.name,
        description=graph_data.description,
        graph_type=graph_data.graph_type,
        layout_config=graph_data.layout_config,
        visualization_settings=graph_data.visualization_settings,
        filtering_rules=graph_data.filtering_rules,
        created_by=current_user.id,
        organization_id=graph_data.organization_id,
        is_public=graph_data.is_public,
        is_template=graph_data.is_template,
        template_category=graph_data.template_category
    )
    
    db.add(graph)
    db.commit()
    db.refresh(graph)
    
    # Calculate initial metrics
    update_graph_statistics(graph)
    db.commit()
    
    return KnowledgeGraphResponse.from_orm(graph)


@router.get("/", response_model=List[KnowledgeGraphResponse])
async def list_knowledge_graphs(
    organization_id: Optional[UUID] = None,
    graph_type: Optional[str] = None,
    is_public: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List knowledge graphs with filtering"""
    
    query = db.query(KnowledgeGraph).options(
        joinedload(KnowledgeGraph.nodes),
        joinedload(KnowledgeGraph.edges)
    )
    
    # Apply filters
    if organization_id:
        query = query.filter(KnowledgeGraph.organization_id == organization_id)
    
    if graph_type:
        query = query.filter(KnowledgeGraph.graph_type == graph_type)
    
    if is_public is not None:
        query = query.filter(KnowledgeGraph.is_public == is_public)
    
    # Filter by access permissions
    query = query.filter(
        or_(
            KnowledgeGraph.is_public == True,
            KnowledgeGraph.created_by == current_user.id,
            KnowledgeGraph.organization_id.in_([org.id for org in current_user.organizations])
        )
    )
    
    graphs = query.offset(offset).limit(limit).all()
    
    return [KnowledgeGraphResponse.from_orm(graph) for graph in graphs]


@router.get("/{graph_id}", response_model=KnowledgeGraphDetailResponse)
async def get_knowledge_graph(
    graph_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed knowledge graph with all nodes and edges"""
    
    graph = db.query(KnowledgeGraph).options(
        joinedload(KnowledgeGraph.nodes),
        joinedload(KnowledgeGraph.edges)
    ).filter(KnowledgeGraph.id == graph_id).first()
    
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    # Check access permissions
    if not graph.is_public and graph.created_by != current_user.id:
        # TODO: Implement organization-based access control
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update last access timestamp for all nodes
    current_time = datetime.utcnow()
    for node in graph.nodes:
        node.last_accessed = current_time
    
    db.commit()
    
    return KnowledgeGraphDetailResponse.from_orm(graph)


@router.put("/{graph_id}", response_model=KnowledgeGraphResponse)
async def update_knowledge_graph(
    graph_id: UUID,
    graph_update: KnowledgeGraphUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update knowledge graph properties"""
    
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    # Check permissions
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Update fields
    update_data = graph_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(graph, field, value)
    
    graph.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(graph)
    
    return KnowledgeGraphResponse.from_orm(graph)


@router.delete("/{graph_id}")
async def delete_knowledge_graph(
    graph_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete knowledge graph and all associated data"""
    
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    # Check permissions
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Delete associated data
    db.query(LLMQuery).filter(LLMQuery.session_id.in_(
        db.query(LLMSession.id).filter(LLMSession.graph_id == graph_id)
    )).delete()
    
    db.query(LLMSession).filter(LLMSession.graph_id == graph_id).delete()
    db.query(AIInsight).filter(AIInsight.graph_id == graph_id).delete()
    db.query(RAGDocument).filter(RAGDocument.graph_id == graph_id).delete()
    db.query(NodeConnectedness).filter(
        NodeConnectedness.node_id.in_(
            db.query(KnowledgeNode.id).filter(KnowledgeNode.graph_id == graph_id)
        )
    ).delete()
    
    db.query(KnowledgeEdge).filter(KnowledgeEdge.graph_id == graph_id).delete()
    db.query(KnowledgeNode).filter(KnowledgeNode.graph_id == graph_id).delete()
    db.delete(graph)
    
    db.commit()
    
    return {"message": "Knowledge graph deleted successfully"}


# ===== Node Management Endpoints =====

@router.post("/{graph_id}/nodes", response_model=KnowledgeNodeResponse)
async def create_knowledge_node(
    graph_id: UUID,
    node_data: KnowledgeNodeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new node in the knowledge graph"""
    
    # Verify graph exists and user has access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Create the node
    node = KnowledgeNode(
        graph_id=graph_id,
        title=node_data.title,
        description=node_data.description,
        node_type=node_data.node_type,
        position_x=node_data.position_x,
        position_y=node_data.position_y,
        position_z=node_data.position_z,
        size=node_data.size,
        color=node_data.color,
        properties=node_data.properties,
        tags=node_data.tags,
        content=node_data.content
    )
    
    db.add(node)
    db.commit()
    db.refresh(node)
    
    # Update graph statistics
    update_graph_statistics(graph)
    db.commit()
    
    return KnowledgeNodeResponse.from_orm(node)


@router.get("/{graph_id}/nodes", response_model=List[KnowledgeNodeResponse])
async def list_knowledge_nodes(
    graph_id: UUID,
    node_type: Optional[NodeType] = None,
    tags: Optional[List[str]] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List nodes in a knowledge graph with filtering"""
    
    # Verify graph access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    query = db.query(KnowledgeNode).filter(KnowledgeNode.graph_id == graph_id)
    
    # Apply filters
    if node_type:
        query = query.filter(KnowledgeNode.node_type == node_type)
    
    if tags:
        # Filter nodes that contain all specified tags
        for tag in tags:
            query = query.filter(KnowledgeNode.tags.contains([tag]))
    
    if search:
        query = query.filter(
            or_(
                KnowledgeNode.title.ilike(f"%{search}%"),
                KnowledgeNode.description.ilike(f"%{search}%"),
                KnowledgeNode.content.ilike(f"%{search}%")
            )
        )
    
    nodes = query.offset(offset).limit(limit).all()
    
    return [KnowledgeNodeResponse.from_orm(node) for node in nodes]


@router.put("/{graph_id}/nodes/{node_id}", response_model=KnowledgeNodeResponse)
async def update_knowledge_node(
    graph_id: UUID,
    node_id: UUID,
    node_update: KnowledgeNodeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a knowledge node"""
    
    node = db.query(KnowledgeNode).filter(
        and_(KnowledgeNode.id == node_id, KnowledgeNode.graph_id == graph_id)
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Knowledge node not found")
    
    # Check permissions
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Update fields
    update_data = node_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(node, field, value)
    
    node.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(node)
    
    return KnowledgeNodeResponse.from_orm(node)


@router.delete("/{graph_id}/nodes/{node_id}")
async def delete_knowledge_node(
    graph_id: UUID,
    node_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a knowledge node and all its relationships"""
    
    node = db.query(KnowledgeNode).filter(
        and_(KnowledgeNode.id == node_id, KnowledgeNode.graph_id == graph_id)
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Knowledge node not found")
    
    # Check permissions
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Delete connected edges and relationships
    db.query(KnowledgeEdge).filter(
        or_(
            KnowledgeEdge.source_node_id == node_id,
            KnowledgeEdge.target_node_id == node_id
        )
    ).delete()
    
    db.query(NodeConnectedness).filter(
        or_(
            NodeConnectedness.node_id == node_id,
            NodeConnectedness.connected_node_id == node_id
        )
    ).delete()
    
    db.delete(node)
    
    # Update graph statistics
    update_graph_statistics(graph)
    db.commit()
    
    return {"message": "Knowledge node deleted successfully"}


# ===== Edge Management Endpoints =====

@router.post("/{graph_id}/edges", response_model=KnowledgeEdgeResponse)
async def create_knowledge_edge(
    graph_id: UUID,
    edge_data: KnowledgeEdgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new edge between nodes in the knowledge graph"""
    
    # Verify graph exists and user has access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Verify source and target nodes exist
    source_node = db.query(KnowledgeNode).filter(
        and_(KnowledgeNode.id == edge_data.source_node_id, KnowledgeNode.graph_id == graph_id)
    ).first()
    
    target_node = db.query(KnowledgeNode).filter(
        and_(KnowledgeNode.id == edge_data.target_node_id, KnowledgeNode.graph_id == graph_id)
    ).first()
    
    if not source_node or not target_node:
        raise HTTPException(status_code=404, detail="Source or target node not found")
    
    # Check for duplicate edge
    existing_edge = db.query(KnowledgeEdge).filter(
        and_(
            KnowledgeEdge.graph_id == graph_id,
            KnowledgeEdge.source_node_id == edge_data.source_node_id,
            KnowledgeEdge.target_node_id == edge_data.target_node_id,
            KnowledgeEdge.edge_type == edge_data.edge_type
        )
    ).first()
    
    if existing_edge:
        raise HTTPException(status_code=400, detail="Edge already exists")
    
    # Create the edge
    edge = KnowledgeEdge(
        graph_id=graph_id,
        source_node_id=edge_data.source_node_id,
        target_node_id=edge_data.target_node_id,
        edge_type=edge_data.edge_type,
        label=edge_data.label,
        description=edge_data.description,
        weight=edge_data.weight,
        direction=edge_data.direction,
        color=edge_data.color,
        width=edge_data.width,
        line_style=edge_data.line_style,
        properties=edge_data.properties,
        confidence=edge_data.confidence,
        valid_from=edge_data.valid_from,
        valid_to=edge_data.valid_to
    )
    
    db.add(edge)
    db.commit()
    db.refresh(edge)
    
    # Update connected nodes count
    source_node.connected_nodes_count = source_node.connected_nodes_count + 1
    target_node.connected_nodes_count = target_node.connected_nodes_count + 1
    
    # Update graph statistics
    update_graph_statistics(graph)
    db.commit()
    
    return KnowledgeEdgeResponse.from_orm(edge)


@router.get("/{graph_id}/edges", response_model=List[KnowledgeEdgeResponse])
async def list_knowledge_edges(
    graph_id: UUID,
    edge_type: Optional[EdgeType] = None,
    source_node_id: Optional[UUID] = None,
    target_node_id: Optional[UUID] = None,
    limit: int = 200,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List edges in a knowledge graph with filtering"""
    
    # Verify graph access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    query = db.query(KnowledgeEdge).filter(KnowledgeEdge.graph_id == graph_id)
    
    # Apply filters
    if edge_type:
        query = query.filter(KnowledgeEdge.edge_type == edge_type)
    
    if source_node_id:
        query = query.filter(KnowledgeEdge.source_node_id == source_node_id)
    
    if target_node_id:
        query = query.filter(KnowledgeEdge.target_node_id == target_node_id)
    
    edges = query.offset(offset).limit(limit).all()
    
    return [KnowledgeEdgeResponse.from_orm(edge) for edge in edges]


@router.delete("/{graph_id}/edges/{edge_id}")
async def delete_knowledge_edge(
    graph_id: UUID,
    edge_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a knowledge edge"""
    
    edge = db.query(KnowledgeEdge).filter(
        and_(KnowledgeEdge.id == edge_id, KnowledgeEdge.graph_id == graph_id)
    ).first()
    
    if not edge:
        raise HTTPException(status_code=404, detail="Knowledge edge not found")
    
    # Check permissions
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if graph.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Update connected nodes count
    source_node = db.query(KnowledgeNode).filter(KnowledgeNode.id == edge.source_node_id).first()
    target_node = db.query(KnowledgeNode).filter(KnowledgeNode.id == edge.target_node_id).first()
    
    if source_node and source_node.connected_nodes_count > 0:
        source_node.connected_nodes_count -= 1
    
    if target_node and target_node.connected_nodes_count > 0:
        target_node.connected_nodes_count -= 1
    
    db.delete(edge)
    
    # Update graph statistics
    update_graph_statistics(graph)
    db.commit()
    
    return {"message": "Knowledge edge deleted successfully"}


# ===== Graph Analytics Endpoints =====

@router.get("/{graph_id}/analytics", response_model=GraphAnalyticsResponse)
async def get_graph_analytics(
    graph_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics for a knowledge graph"""
    
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    # Get basic metrics
    metrics = calculate_graph_metrics(graph)
    
    # Get node type distribution
    node_type_counts = db.query(
        KnowledgeNode.node_type,
        func.count(KnowledgeNode.id).label('count')
    ).filter(KnowledgeNode.graph_id == graph_id).group_by(KnowledgeNode.node_type).all()
    
    # Get edge type distribution
    edge_type_counts = db.query(
        KnowledgeEdge.edge_type,
        func.count(KnowledgeEdge.id).label('count')
    ).filter(KnowledgeEdge.graph_id == graph_id).group_by(KnowledgeEdge.edge_type).all()
    
    # Get top nodes by centrality
    top_nodes = db.query(KnowledgeNode).filter(
        KnowledgeNode.graph_id == graph_id
    ).order_by(KnowledgeNode.centrality_score.desc()).limit(10).all()
    
    # Get community information
    communities = db.query(NodeConnectedness).filter(
        NodeConnectedness.community_id.isnot(None)
    ).count()
    
    return GraphAnalyticsResponse(
        basic_metrics=metrics,
        node_type_distribution={nt.node_type: nt.count for nt in node_type_counts},
        edge_type_distribution={et.edge_type: et.count for et in edge_type_counts},
        top_central_nodes=[{
            'node_id': node.id,
            'title': node.title,
            'centrality_score': node.centrality_score,
            'node_type': node.node_type
        } for node in top_nodes],
        community_count=communities
    )


@router.post("/{graph_id}/analyze", response_model=GraphAnalysisResponse)
async def analyze_knowledge_graph(
    graph_id: UUID,
    analysis_type: GraphAnalysisType,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform advanced analysis on a knowledge graph"""
    
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    if analysis_type == GraphAnalysisType.COMMUNITY_DETECTION:
        return await _perform_community_detection(graph, db)
    elif analysis_type == GraphAnalysisType.PATTERN_DETECTION:
        return await _perform_pattern_detection(graph, db)
    elif analysis_type == GraphAnalysisType.CENTRALITY_ANALYSIS:
        return await _perform_centrality_analysis(graph, db)
    elif analysis_type == GraphAnalysisType.PATH_ANALYSIS:
        return await _perform_path_analysis(graph, db)


async def _perform_community_detection(graph: KnowledgeGraph, db: Session) -> GraphAnalysisResponse:
    """Perform community detection using clustering algorithms"""
    
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.graph_id == graph.id).all()
    edges = db.query(KnowledgeEdge).filter(KnowledgeEdge.graph_id == graph.id).all()
    
    if len(nodes) < 2:
        return GraphAnalysisResponse(
            analysis_type=GraphAnalysisType.COMMUNITY_DETECTION,
            results={'error': 'Not enough nodes for community detection'},
            insights=['Need at least 2 nodes for community detection']
        )
    
    # Create adjacency matrix based on edges
    node_ids = [node.id for node in nodes]
    n_nodes = len(nodes)
    adjacency_matrix = np.zeros((n_nodes, n_nodes))
    
    # Build adjacency matrix from edges
    for edge in edges:
        if edge.source_node_id in node_ids and edge.target_node_id in node_ids:
            source_idx = node_ids.index(edge.source_node_id)
            target_idx = node_ids.index(edge.target_node_id)
            weight = edge.weight if edge.weight else 1.0
            
            adjacency_matrix[source_idx, target_idx] = weight
            if not edge.direction:  # Undirected edge
                adjacency_matrix[target_idx, source_idx] = weight
    
    # Perform clustering based on adjacency
    try:
        # Use spectral clustering or k-means based on connectivity
        k_means = KMeans(n_clusters=min(5, max(2, n_nodes // 3)), random_state=42)
        
        if adjacency_matrix.any():
            # Convert to feature matrix for clustering
            features = adjacency_matrix.sum(axis=1).reshape(-1, 1)
            cluster_labels = k_means.fit_predict(features)
        else:
            cluster_labels = [0] * n_nodes  # All nodes in one cluster
        
        # Update database with community assignments
        for i, node in enumerate(nodes):
            # Create new community ID
            community_id = hashlib.md5(f"{graph.id}_{cluster_labels[i]}".encode()).hexdigest()
            
            node_connectedness = db.query(NodeConnectedness).filter(
                and_(
                    NodeConnectedness.node_id == node.id,
                    NodeConnectedness.connected_node_id.in_(node_ids)
                )
            ).all()
            
            for conn in node_connectedness:
                conn.community_id = community_id
                conn.cluster_score = 1.0
        
        db.commit()
        
        # Generate insights
        communities = {}
        for i, label in enumerate(cluster_labels):
            if label not in communities:
                communities[label] = []
            communities[label].append({
                'node_id': node_ids[i],
                'title': nodes[i].title,
                'node_type': nodes[i].node_type
            })
        
        insights = [
            f"Detected {len(communities)} communities in the graph",
            f"Largest community has {max(len(c) for c in communities.values())} nodes"
        ]
        
        return GraphAnalysisResponse(
            analysis_type=GraphAnalysisType.COMMUNITY_DETECTION,
            results={
                'communities': communities,
                'cluster_count': len(communities),
                'largest_community_size': max(len(c) for c in communities.values())
            },
            insights=insights
        )
        
    except Exception as e:
        return GraphAnalysisResponse(
            analysis_type=GraphAnalysisType.COMMUNITY_DETECTION,
            results={'error': str(e)},
            insights=['Community detection failed due to insufficient connectivity']
        )


async def _perform_pattern_detection(graph: KnowledgeGraph, db: Session) -> GraphAnalysisResponse:
    """Detect common patterns in the knowledge graph"""
    
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.graph_id == graph.id).all()
    edges = db.query(KnowledgeEdge).filter(KnowledgeEdge.graph_id == graph.id).all()
    
    patterns = []
    insights = []
    
    # Detect hub nodes (high degree)
    high_degree_nodes = [node for node in nodes if node.connected_nodes_count > 5]
    if high_degree_nodes:
        patterns.append({
            'type': 'hub_nodes',
            'description': 'Nodes with high connectivity',
            'nodes': [{'id': node.id, 'title': node.title, 'degree': node.connected_nodes_count} 
                     for node in high_degree_nodes[:5]],
            'count': len(high_degree_nodes)
        })
        insights.append(f"Found {len(high_degree_nodes)} hub nodes with high connectivity")
    
    # Detect common edge patterns
    edge_type_counts = {}
    for edge in edges:
        edge_type = edge.edge_type.value
        edge_type_counts[edge_type] = edge_type_counts.get(edge_type, 0) + 1
    
    most_common_edge_type = max(edge_type_counts, key=edge_type_counts.get) if edge_type_counts else None
    if most_common_edge_type:
        patterns.append({
            'type': 'dominant_relationship',
            'description': f'Most common relationship type: {most_common_edge_type}',
            'relationship_type': most_common_edge_type,
            'count': edge_type_counts[most_common_edge_type]
        })
        insights.append(f"'{most_common_edge_type}' is the dominant relationship type")
    
    # Detect clustering patterns
    clustered_nodes = db.query(KnowledgeNode).filter(
        and_(
            KnowledgeNode.graph_id == graph.id,
            KnowledgeNode.clustering_coefficient > 0.5
        )
    ).count()
    
    if clustered_nodes > 0:
        patterns.append({
            'type': 'clustered_nodes',
            'description': 'Nodes in highly clustered neighborhoods',
            'count': clustered_nodes,
            'percentage': round((clustered_nodes / len(nodes)) * 100, 2)
        })
        insights.append(f"{clustered_nodes} nodes show high clustering patterns")
    
    return GraphAnalysisResponse(
        analysis_type=GraphAnalysisType.PATTERN_DETECTION,
        results={'patterns': patterns},
        insights=insights
    )


async def _perform_centrality_analysis(graph: KnowledgeGraph, db: Session) -> GraphAnalysisResponse:
    """Calculate and analyze centrality measures"""
    
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.graph_id == graph.id).all()
    edges = db.query(KnowledgeEdge).filter(KnowledgeEdge.graph_id == graph.id).all()
    
    # Calculate basic centrality measures
    node_degrees = {}
    for node in nodes:
        degree = node.connected_nodes_count or 0
        node_degrees[node.id] = {
            'node_id': node.id,
            'title': node.title,
            'degree': degree,
            'normalized_degree': degree / max(1, len(nodes) - 1) if len(nodes) > 1 else 0
        }
    
    # Update centrality scores in database
    max_degree = max((node.connected_nodes_count or 0) for node in nodes) if nodes else 1
    for node in nodes:
        node.centrality_score = (node.connected_nodes_count or 0) / max_degree if max_degree > 0 else 0
    
    db.commit()
    
    # Sort by centrality
    top_central = sorted(
        [(node.id, node.centrality_score) for node in nodes],
        key=lambda x: x[1],
        reverse=True
    )[:10]
    
    insights = [
        f"Most central node has centrality score of {top_central[0][1]:.3f}" if top_central else "No nodes found",
        f"Average centrality score: {sum(n.centrality_score for n in nodes) / len(nodes):.3f}" if nodes else "0.000"
    ]
    
    return GraphAnalysisResponse(
        analysis_type=GraphAnalysisType.CENTRALITY_ANALYSIS,
        results={
            'centrality_scores': [{'node_id': nid, 'score': score} for nid, score in top_central],
            'average_centrality': sum(n.centrality_score for n in nodes) / len(nodes) if nodes else 0,
            'total_nodes_analyzed': len(nodes)
        },
        insights=insights
    )


async def _perform_path_analysis(graph: KnowledgeGraph, db: Session) -> GraphAnalysisResponse:
    """Analyze paths and connectivity in the graph"""
    
    # Simple path analysis - can be extended with more sophisticated algorithms
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.graph_id == graph.id).all()
    edges = db.query(KnowledgeEdge).filter(KnowledgeEdge.graph_id == graph.id).all()
    
    # Find connected components
    node_ids = [node.id for node in nodes]
    adjacency = {nid: set() for nid in node_ids}
    
    for edge in edges:
        adjacency[edge.source_node_id].add(edge.target_node_id)
        if not edge.direction:
            adjacency[edge.target_node_id].add(edge.source_node_id)
    
    visited = set()
    components = []
    
    def dfs(node_id, component):
        if node_id in visited:
            return
        visited.add(node_id)
        component.append(node_id)
        for neighbor in adjacency[node_id]:
            dfs(neighbor, component)
    
    for node_id in node_ids:
        if node_id not in visited:
            component = []
            dfs(node_id, component)
            components.append(component)
    
    connected_components = [comp for comp in components if len(comp) > 1]
    isolated_nodes = [comp[0] for comp in components if len(comp) == 1]
    
    insights = [
        f"Graph has {len(connected_components)} connected components",
        f"{len(isolated_nodes)} nodes are isolated" if isolated_nodes else "All nodes are connected"
    ]
    
    return GraphAnalysisResponse(
        analysis_type=GraphAnalysisType.PATH_ANALYSIS,
        results={
            'connected_components': len(connected_components),
            'isolated_nodes_count': len(isolated_nodes),
            'largest_component_size': max(len(comp) for comp in components) if components else 0,
            'total_components': len(components)
        },
        insights=insights
    )


# ===== AI Insights Endpoints =====

@router.get("/{graph_id}/insights", response_model=List[AIInsightResponse])
async def get_ai_insights(
    graph_id: UUID,
    insight_type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated insights for a knowledge graph"""
    
    # Verify graph access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    query = db.query(AIInsight).filter(AIInsight.graph_id == graph_id)
    
    if insight_type:
        query = query.filter(AIInsight.insight_type == insight_type)
    
    insights = query.order_by(AIInsight.created_at.desc()).offset(offset).limit(limit).all()
    
    return [AIInsightResponse.from_orm(insight) for insight in insights]


@router.post("/{graph_id}/insights/generate", response_model=AIInsightResponse)
async def generate_ai_insights(
    graph_id: UUID,
    insight_request: AIInsightRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate new AI insights for the knowledge graph"""
    
    # Verify graph access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    if not graph.ai_insights_enabled:
        raise HTTPException(status_code=400, detail="AI insights are not enabled for this graph")
    
    # Create insight record
    insight = AIInsight(
        graph_id=graph_id,
        title=insight_request.title,
        description=insight_request.description,
        insight_type=insight_request.insight_type,
        confidence_score=0.0,  # Will be updated by background task
        model_used=insight_request.model_used or "gpt-4",
        insight_data={},
        recommendations=[],
        source_nodes=insight_request.source_nodes or [],
        source_edges=insight_request.source_edges or [],
        citations=insight_request.citations or [],
        evidence_strength=0.0
    )
    
    db.add(insight)
    db.commit()
    db.refresh(insight)
    
    # Add background task for AI processing
    background_tasks.add_task(_process_ai_insight, insight.id, graph_id)
    
    return AIInsightResponse.from_orm(insight)


async def _process_ai_insight(insight_id: UUID, graph_id: UUID):
    """Background task to process AI insight generation"""
    # This would typically call an LLM service
    # For now, we'll simulate the processing
    db = next(get_db())
    
    try:
        insight = db.query(AIInsight).filter(AIInsight.id == insight_id).first()
        if insight:
            # Simulate AI processing
            insight.confidence_score = 0.85
            insight.evidence_strength = 0.7
            insight.status = "active"
            insight.verification_status = "pending"
            insight.insight_data = {
                'algorithm_used': 'pattern_detection',
                'processing_time_ms': 1200,
                'data_points_analyzed': 100
            }
            insight.recommendations = [
                "Focus on nodes with high centrality scores",
                "Investigate common relationship patterns",
                "Consider expanding the knowledge graph with additional data sources"
            ]
            
            db.commit()
    finally:
        db.close()


# ===== LLM Assistant Endpoints =====

@router.post("/{graph_id}/llm/sessions", response_model=LLMSessionResponse)
async def create_llm_session(
    graph_id: UUID,
    session_data: LLMSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new LLM assistant session"""
    
    # Verify graph access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    session = LLMSession(
        graph_id=graph_id,
        user_id=current_user.id,
        session_name=session_data.session_name,
        conversation_context=session_data.conversation_context or {},
        graph_state=session_data.graph_state or {},
        model_name=session_data.model_name or "gpt-4",
        system_prompt=session_data.system_prompt,
        context_window=session_data.context_window or 4000
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return LLMSessionResponse.from_orm(session)


@router.get("/{graph_id}/llm/sessions", response_model=List[LLMSessionResponse])
async def list_llm_sessions(
    graph_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List LLM sessions for the current user and graph"""
    
    sessions = db.query(LLMSession).filter(
        and_(
            LLMSession.graph_id == graph_id,
            LLMSession.user_id == current_user.id
        )
    ).order_by(LLMSession.last_activity.desc()).all()
    
    return [LLMSessionResponse.from_orm(session) for session in sessions]


@router.post("/{graph_id}/llm/queries", response_model=LLMQueryResponse)
async def query_llm_assistant(
    graph_id: UUID,
    query_request: LLMQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a natural language query to the LLM assistant"""
    
    # Verify session and graph access
    session = db.query(LLMSession).filter(
        and_(
            LLMSession.id == query_request.session_id,
            LLMSession.graph_id == graph_id,
            LLMSession.user_id == current_user.id
        )
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="LLM session not found")
    
    # Create query record
    query = LLMQuery(
        session_id=session.id,
        query_text=query_request.query_text,
        query_intent=query_request.query_intent,
        query_entities=query_request.query_entities or [],
        operations_performed=[],
        nodes_affected=[],
        edges_affected=[]
    )
    
    db.add(query)
    db.commit()
    db.refresh(query)
    
    # Simulate LLM processing (in real implementation, this would call the LLM)
    start_time = datetime.utcnow()
    
    # Generate mock response based on query content
    if "find" in query_request.query_text.lower() or "search" in query_request.query_text.lower():
        response_text = "I found several relevant nodes and relationships in the knowledge graph that match your query. The results include nodes related to energy trading, market participants, and regulatory frameworks."
        query.query_intent = "search"
    elif "analyze" in query_request.query_text.lower():
        response_text = "Based on my analysis of the knowledge graph, I can identify several key patterns and insights. The graph shows strong connections between energy assets and market participants."
        query.query_intent = "analyze"
    elif "explain" in query_request.query_text.lower():
        response_text = "Let me explain the relationships in this knowledge graph. The nodes represent different entities like energy assets, market participants, and regulatory bodies, while the edges show how they interact with each other."
        query.query_intent = "explain"
    else:
        response_text = "I've processed your query about the knowledge graph. The system shows various relationships between energy market entities, with different types of connections represented by different edge types."
        query.query_intent = "general"
    
    # Complete query processing
    end_time = datetime.utcnow()
    execution_time = int((end_time - start_time).total_seconds() * 1000)
    
    query.response_text = response_text
    query.execution_time_ms = execution_time
    query.tokens_input = len(query_request.query_text.split()) * 1.3  # Rough token estimate
    query.tokens_output = len(response_text.split()) * 1.3
    query.response_confidence = 0.8
    
    # Update session statistics
    session.message_count += 1
    session.total_tokens += query.tokens_input + query.tokens_output
    session.last_activity = datetime.utcnow()
    session.successful_queries += 1
    
    db.commit()
    
    return LLMQueryResponse.from_orm(query)


@router.get("/{graph_id}/llm/sessions/{session_id}/history", response_model=List[LLMQueryResponse])
async def get_llm_query_history(
    graph_id: UUID,
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get query history for an LLM session"""
    
    # Verify session access
    session = db.query(LLMSession).filter(
        and_(
            LLMSession.id == session_id,
            LLMSession.graph_id == graph_id,
            LLMSession.user_id == current_user.id
        )
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="LLM session not found")
    
    queries = db.query(LLMQuery).filter(
        LLMQuery.session_id == session_id
    ).order_by(LLMQuery.created_at.desc()).all()
    
    return [LLMQueryResponse.from_orm(query) for query in queries]


# ===== RAG Document Management =====

@router.post("/{graph_id}/documents", response_model=RAGDocumentResponse)
async def upload_rag_document(
    graph_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for RAG processing"""
    
    # Verify graph access
    graph = db.query(KnowledgeGraph).filter(KnowledgeGraph.id == graph_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found")
    
    # Read file content
    content = await file.read()
    
    # Create document record
    document = RAGDocument(
        graph_id=graph_id,
        title=file.filename,
        content=content.decode('utf-8', errors='ignore'),
        document_type="uploaded_document",
        source_url=f"upload://{file.filename}",
        processing_status="pending"
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return RAGDocumentResponse.from_orm(document)


# Export all endpoints
__all__ = ["router"]