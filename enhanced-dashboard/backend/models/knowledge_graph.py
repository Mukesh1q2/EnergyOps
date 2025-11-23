"""
Knowledge Graph Models for OptiBid Energy Platform
Phase 4: Visual Knowledge Graphs & AI Integration

This module implements the database models for:
- Interactive Knowledge Graphs
- Node and Edge relationships
- AI-powered pattern analysis
- LLM assistant integration
- RAG (Retrieval-Augmented Generation) pipeline
"""

from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, JSON, Integer, Float, 
    ForeignKey, Table, Index, UniqueConstraint, BigInteger, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid
import enum

Base = declarative_base()

# Association tables for many-to-many relationships
node_relationships = Table(
    'node_relationships',
    Base.metadata,
    Column('source_node_id', UUID(as_uuid=True), ForeignKey('knowledge_nodes.id'), primary_key=True),
    Column('target_node_id', UUID(as_uuid=True), ForeignKey('knowledge_nodes.id'), primary_key=True),
    Column('relationship_type', String(100), primary_key=True),
    Column('strength', Float, default=1.0),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Column('metadata', JSON)  # Additional relationship metadata
)

node_connectedness = Table(
    'node_connectedness',
    Base.metadata,
    Column('node_id', UUID(as_uuid=True), ForeignKey('knowledge_nodes.id'), primary_key=True),
    Column('connected_node_id', UUID(as_uuid=True), ForeignKey('knowledge_nodes.id'), primary_key=True),
    Column('connection_count', Integer, default=1),
    Column('last_connected', DateTime(timezone=True), server_default=func.now()),
    Column('connection_metadata', JSON)
)


class NodeType(enum.Enum):
    """Enumeration of node types in the knowledge graph"""
    PERSON = "person"
    ORGANIZATION = "organization"
    ENERGY_ASSET = "energy_asset"
    MARKET_DATA = "market_data"
    TRANSACTION = "transaction"
    LOCATION = "location"
    REGULATION = "regulation"
    TECHNOLOGY = "technology"
    PROJECT = "project"
    CONCEPT = "concept"
    DOCUMENT = "document"
    TIME_SERIES = "time_series"
    COMMODITY = "commodity"


class EdgeType(enum.Enum):
    """Enumeration of edge types in the knowledge graph"""
    OWNS = "owns"
    TRADES = "trades"
    LOCATED_IN = "located_in"
    REGULATED_BY = "regulated_by"
    SUPPLIES = "supplies"
    CONNECTS_TO = "connects_to"
    DEPENDS_ON = "depends_on"
    INFLUENCES = "influences"
    SIMILAR_TO = "similar_to"
    DERIVED_FROM = "derived_from"
    RELATED_TO = "related_to"
    CONTAINS = "contains"
    BUILDS_ON = "builds_on"
    CONFLICTS_WITH = "conflicts_with"


class KnowledgeNode(Base):
    """
    Represents a node in the knowledge graph
    
    Nodes can represent various entities like:
    - Energy assets (generators, transmission lines, substations)
    - Market participants (traders, utilities, producers)
    - Geographic locations (regions, cities, substations)
    - Documents (reports, regulations, contracts)
    - Concepts (algorithms, methodologies, standards)
    """
    __tablename__ = "knowledge_nodes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    graph_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_graphs.id"), nullable=False)
    
    # Core node properties
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text)
    node_type = Column(Enum(NodeType), nullable=False, index=True)
    
    # Node positioning and visualization
    position_x = Column(Float)  # 2D coordinates for visualization
    position_y = Column(Float)
    position_z = Column(Float)  # For 3D layouts if needed
    size = Column(Float, default=10.0)  # Visual size
    color = Column(String(20), default="#4F46E5")  # Hex color
    
    # Node properties and metadata
    properties = Column(JSON)  # Flexible key-value store
    tags = Column(JSON)  # Array of tags for filtering
    
    # Graph analytics
    centrality_score = Column(Float, default=0.0)
    betweenness_centrality = Column(Float, default=0.0)
    clustering_coefficient = Column(Float, default=0.0)
    page_rank_score = Column(Float, default=0.0)
    
    # Node content and relationships
    content = Column(Text)  # Full text content for RAG
    embedding_vector = Column(JSON)  # Vector embeddings for similarity search
    connected_nodes_count = Column(Integer, default=0)
    
    # Visualization and interaction settings
    is_expanded = Column(Boolean, default=True)
    is_collapsed = Column(Boolean, default=False)
    is_visible = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True))
    
    # Relationships
    graph = relationship("KnowledgeGraph", back_populates="nodes")
    outgoing_relationships = relationship(
        "KnowledgeEdge",
        foreign_keys="[KnowledgeEdge.source_node_id]",
        back_populates="source_node",
        cascade="all, delete-orphan"
    )
    incoming_relationships = relationship(
        "KnowledgeEdge",
        foreign_keys="[KnowledgeEdge.target_node_id]",
        back_populates="target_node",
        cascade="all, delete-orphan"
    )
    connections = relationship(
        "NodeConnectedness",
        foreign_keys="[NodeConnectedness.node_id]",
        back_populates="node",
        cascade="all, delete-orphan"
    )
    
    # Composite indexes for performance
    __table_args__ = (
        Index('idx_node_graph_type', 'graph_id', 'node_type'),
        Index('idx_node_centrality', 'centrality_score'),
        Index('idx_node_tags', 'tags', postgresql_using='gin'),
        Index('idx_node_properties', 'properties', postgresql_using='gin'),
        Index('idx_node_title_search', 'title', postgresql_trgm=True),
    )
    
    def __repr__(self):
        return f"<KnowledgeNode(title='{self.title}', type='{self.node_type}')>"


class KnowledgeEdge(Base):
    """
    Represents an edge/relationship between nodes in the knowledge graph
    
    Edges define how nodes relate to each other and can have:
    - Directionality (undirected, directed)
    - Strength/weight
    - Multiple relationship types
    - Temporal aspects
    """
    __tablename__ = "knowledge_edges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    graph_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_graphs.id"), nullable=False)
    
    # Edge definition
    source_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    target_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    edge_type = Column(Enum(EdgeType), nullable=False, index=True)
    
    # Edge properties
    label = Column(String(200))  # Human-readable label
    description = Column(Text)
    weight = Column(Float, default=1.0)  # Relationship strength
    direction = Column(Boolean, default=True)  # True for directed, False for undirected
    
    # Edge visualization
    color = Column(String(20), default="#64748B")
    width = Column(Float, default=2.0)
    line_style = Column(String(20), default="solid")  # solid, dashed, dotted
    
    # Edge metadata and temporal aspects
    properties = Column(JSON)
    is_active = Column(Boolean, default=True)
    confidence = Column(Float, default=1.0)  # Confidence in relationship
    
    # Temporal information
    valid_from = Column(DateTime(timezone=True))
    valid_to = Column(DateTime(timezone=True))
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Performance analytics
    betweenness_score = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)
    
    # Relationships
    source_node = relationship(
        "KnowledgeNode",
        foreign_keys=[source_node_id],
        back_populates="outgoing_relationships"
    )
    target_node = relationship(
        "KnowledgeNode",
        foreign_keys=[target_node_id],
        back_populates="incoming_relationships"
    )
    graph = relationship("KnowledgeGraph", back_populates="edges")
    
    # Composite indexes
    __table_args__ = (
        Index('idx_edge_nodes', 'source_node_id', 'target_node_id'),
        Index('idx_edge_type_weight', 'edge_type', 'weight'),
        Index('idx_edge_graph_type', 'graph_id', 'edge_type'),
        Index('idx_edge_temporal', 'valid_from', 'valid_to'),
        UniqueConstraint('source_node_id', 'target_node_id', 'edge_type', name='uq_edge_unique'),
    )
    
    def __repr__(self):
        return f"<KnowledgeEdge(type='{self.edge_type}', source='{self.source_node_id}', target='{self.target_node_id}')>"


class NodeConnectedness(Base):
    """
    Tracks connectedness between nodes for clustering and community detection
    """
    __tablename__ = "node_connectedness"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    connected_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id"), nullable=False)
    
    # Connection metrics
    connection_count = Column(Integer, default=1)
    last_connected = Column(DateTime(timezone=True), server_default=func.now())
    connection_strength = Column(Float, default=1.0)
    
    # Community detection
    community_id = Column(UUID(as_uuid=True))  # Community assignment
    cluster_score = Column(Float, default=0.0)
    
    # Metadata
    connection_metadata = Column(JSON)
    
    # Relationships
    node = relationship(
        "KnowledgeNode",
        foreign_keys=[node_id],
        back_populates="connections"
    )
    
    # Composite indexes
    __table_args__ = (
        Index('idx_connectedness_node', 'node_id'),
        Index('idx_connectedness_community', 'community_id'),
    )


class KnowledgeGraph(Base):
    """
    Top-level container for knowledge graphs
    
    Each graph represents a specific domain or analysis context:
    - Energy market network
    - Regulatory landscape
    - Technology ecosystem
    - Custom user-defined graphs
    """
    __tablename__ = "knowledge_graphs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Graph metadata
    name = Column(String(200), nullable=False)
    description = Column(Text)
    graph_type = Column(String(50), default="custom")  # energy_market, regulatory, etc.
    
    # Graph configuration
    layout_config = Column(JSON)  # Force-directed, hierarchical, circular, etc.
    visualization_settings = Column(JSON)  # Colors, styles, interactions
    filtering_rules = Column(JSON)  # Default filtering rules
    
    # Graph statistics
    node_count = Column(Integer, default=0)
    edge_count = Column(Integer, default=0)
    average_degree = Column(Float, default=0.0)
    density = Column(Float, default=0.0)
    
    # AI and analysis features
    ai_insights_enabled = Column(Boolean, default=True)
    pattern_detection_enabled = Column(Boolean, default=True)
    clustering_enabled = Column(Boolean, default=True)
    
    # Ownership and access
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    is_public = Column(Boolean, default=False)
    is_template = Column(Boolean, default=False)
    template_category = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_analyzed = Column(DateTime(timezone=True))
    
    # Relationships
    nodes = relationship("KnowledgeNode", back_populates="graph", cascade="all, delete-orphan")
    edges = relationship("KnowledgeEdge", back_populates="graph", cascade="all, delete-orphan")
    
    # Composite indexes
    __table_args__ = (
        Index('idx_graph_type', 'graph_type'),
        Index('idx_graph_owner', 'created_by'),
        Index('idx_graph_org', 'organization_id'),
        Index('idx_graph_public', 'is_public'),
    )
    
    def __repr__(self):
        return f"<KnowledgeGraph(name='{self.name}', type='{self.graph_type}')>"


class AIInsight(Base):
    """
    Stores AI-generated insights from pattern analysis and LLM queries
    
    This enables:
    - Automatic pattern detection
    - LLM-generated summaries
    - Confidence scoring
    - Source citation
    """
    __tablename__ = "ai_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    graph_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_graphs.id"), nullable=False)
    
    # Insight metadata
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    insight_type = Column(String(50), nullable=False)  # pattern, summary, anomaly, recommendation
    confidence_score = Column(Float, default=0.0)  # 0-1 confidence
    
    # AI model information
    model_used = Column(String(100))  # GPT-4, Claude, local model, etc.
    processing_time_ms = Column(Integer)
    tokens_used = Column(Integer)
    
    # Insight content
    insight_data = Column(JSON)  # Structured insight data
    recommendations = Column(JSON)  # Actionable recommendations
    
    # Source and verification
    source_nodes = Column(JSON)  # List of node IDs this insight is based on
    source_edges = Column(JSON)  # List of edge IDs this insight is based on
    citations = Column(JSON)  # External document references
    evidence_strength = Column(Float, default=0.0)
    
    # Insight status
    status = Column(String(20), default="active")  # active, deprecated, verified
    verification_status = Column(String(20), default="pending")  # pending, verified, falsified
    
    # Usage and engagement
    view_count = Column(Integer, default=0)
    useful_count = Column(Integer, default=0)
    bookmarked_by = Column(JSON)  # List of user IDs
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    # Composite indexes
    __table_args__ = (
        Index('idx_insight_graph', 'graph_id'),
        Index('idx_insight_type', 'insight_type'),
        Index('idx_insight_confidence', 'confidence_score'),
        Index('idx_insight_created', 'created_at'),
    )


class LLMSession(Base):
    """
    Manages LLM assistant sessions for natural language queries
    
    Enables:
    - Conversational interface for graph queries
    - Query history and context
    - Natural language to graph operations
    - Response caching and optimization
    """
    __tablename__ = "llm_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    graph_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_graphs.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Session metadata
    session_name = Column(String(200))
    conversation_context = Column(JSON)  # Previous messages for context
    graph_state = Column(JSON)  # Current graph state for context
    
    # LLM configuration
    model_name = Column(String(100), default="gpt-4")
    system_prompt = Column(Text)
    context_window = Column(Integer, default=4000)
    
    # Session statistics
    message_count = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    successful_queries = Column(Integer, default=0)
    failed_queries = Column(Integer, default=0)
    
    # Session management
    is_active = Column(Boolean, default=True)
    is_shared = Column(Boolean, default=False)
    share_token = Column(String(100), unique=True)
    
    # Performance metrics
    average_response_time = Column(Float, default=0.0)
    satisfaction_score = Column(Float)  # User-rated satisfaction
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Composite indexes
    __table_args__ = (
        Index('idx_llm_session_user', 'user_id'),
        Index('idx_llm_session_graph', 'graph_id'),
        Index('idx_llm_session_active', 'is_active'),
        Index('idx_llm_session_activity', 'last_activity'),
    )


class LLMQuery(Base):
    """
    Stores individual LLM queries and responses
    
    Enables:
    - Query history
    - Response quality analysis
    - Performance optimization
    - Audit trail for compliance
    """
    __tablename__ = "llm_queries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("llm_sessions.id"), nullable=False)
    
    # Query information
    query_text = Column(Text, nullable=False)
    query_intent = Column(String(100))  # detected intent (search, analyze, explain, etc.)
    query_entities = Column(JSON)  # extracted entities from query
    
    # Response information
    response_text = Column(Text)
    response_sources = Column(JSON)  # Sources used for response generation
    response_confidence = Column(Float, default=0.0)
    
    # Query execution
    execution_time_ms = Column(Integer)
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    
    # Graph operations performed
    operations_performed = Column(JSON)  # List of graph operations executed
    nodes_affected = Column(JSON)  # Node IDs that were queried/modified
    edges_affected = Column(JSON)  # Edge IDs that were queried/modified
    
    # Quality metrics
    helpfulness_score = Column(Float)  # User-rated helpfulness
    accuracy_score = Column(Float)     # User-rated accuracy
    completeness_score = Column(Float) # User-rated completeness
    
    # Metadata
    user_agent = Column(String(500))
    ip_address = Column(String(45))
    model_version = Column(String(50))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Composite indexes
    __table_args__ = (
        Index('idx_llm_query_session', 'session_id'),
        Index('idx_llm_query_intent', 'query_intent'),
        Index('idx_llm_query_created', 'created_at'),
    )


class RAGDocument(Base):
    """
    Document store for RAG (Retrieval-Augmented Generation) pipeline
    
    Stores external documents that can be used as sources for LLM responses
    """
    __tablename__ = "rag_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    graph_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_graphs.id"), nullable=False)
    
    # Document metadata
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    document_type = Column(String(50))  # report, regulation, academic, news, etc.
    
    # Source information
    source_url = Column(String(1000))
    source_author = Column(String(200))
    source_publisher = Column(String(200))
    publication_date = Column(DateTime(timezone=True))
    
    # Processing information
    embedding_vector = Column(JSON)  # Vector embeddings
    chunk_count = Column(Integer, default=1)
    processing_status = Column(String(20), default="pending")  # pending, processing, completed, failed
    
    # Quality metrics
    relevance_score = Column(Float, default=0.0)
    citation_count = Column(Integer, default=0)  # How often this document has been cited
    
    # Compliance and governance
    is_trusted = Column(Boolean, default=False)
    verification_status = Column(String(20), default="unverified")
    data_classification = Column(String(50))  # public, internal, confidential, restricted
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_cited = Column(DateTime(timezone=True))
    
    # Composite indexes
    __table_args__ = (
        Index('idx_rag_document_graph', 'graph_id'),
        Index('idx_rag_document_type', 'document_type'),
        Index('idx_rag_document_status', 'processing_status'),
        Index('idx_rag_document_trusted', 'is_trusted'),
    )


# Utility functions for the knowledge graph models
def calculate_graph_metrics(graph: KnowledgeGraph) -> Dict[str, float]:
    """
    Calculate basic graph metrics for a knowledge graph
    
    Args:
        graph: KnowledgeGraph instance
        
    Returns:
        Dictionary with calculated metrics
    """
    from sqlalchemy.orm import Session
    from sqlalchemy import func
    
    db = Session.object_session(graph)
    
    # Get node and edge counts
    node_count = len(graph.nodes)
    edge_count = len(graph.edges)
    
    # Calculate density
    if node_count < 2:
        density = 0.0
    else:
        max_edges = node_count * (node_count - 1)
        density = edge_count / max_edges if max_edges > 0 else 0.0
    
    # Calculate average degree
    if node_count > 0:
        total_degree = sum(node.connected_nodes_count or 0 for node in graph.nodes)
        average_degree = total_degree / node_count
    else:
        average_degree = 0.0
    
    return {
        'node_count': node_count,
        'edge_count': edge_count,
        'density': round(density, 4),
        'average_degree': round(average_degree, 2),
        'timestamp': datetime.utcnow()
    }


def update_graph_statistics(graph: KnowledgeGraph) -> None:
    """
    Update graph statistics and metrics
    
    Args:
        graph: KnowledgeGraph instance to update
    """
    metrics = calculate_graph_metrics(graph)
    
    graph.node_count = metrics['node_count']
    graph.edge_count = metrics['edge_count']
    graph.density = metrics['density']
    graph.average_degree = metrics['average_degree']
    graph.last_analyzed = datetime.utcnow()


# Export all models for easy importing
__all__ = [
    'KnowledgeNode',
    'KnowledgeEdge', 
    'KnowledgeGraph',
    'NodeConnectedness',
    'AIInsight',
    'LLMSession',
    'LLMQuery',
    'RAGDocument',
    'NodeType',
    'EdgeType',
    'calculate_graph_metrics',
    'update_graph_statistics'
]