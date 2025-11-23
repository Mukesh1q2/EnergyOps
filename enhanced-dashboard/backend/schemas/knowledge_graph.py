"""
Knowledge Graph Schemas
Phase 4: Visual Knowledge Graphs & AI Integration

Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
from uuid import UUID
import json


# ===== Enumerations =====

class NodeTypeEnum(str, Enum):
    """Node types in the knowledge graph"""
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


class EdgeTypeEnum(str, Enum):
    """Edge types in the knowledge graph"""
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


class GraphAnalysisType(str, Enum):
    """Types of graph analysis"""
    COMMUNITY_DETECTION = "community_detection"
    PATTERN_DETECTION = "pattern_detection"
    CENTRALITY_ANALYSIS = "centrality_analysis"
    PATH_ANALYSIS = "path_analysis"


class InsightType(str, Enum):
    """Types of AI insights"""
    PATTERN = "pattern"
    SUMMARY = "summary"
    ANOMALY = "anomaly"
    RECOMMENDATION = "recommendation"
    TREND = "trend"
    CORRELATION = "correlation"


# ===== Base Schemas =====

class KnowledgeGraphBase(BaseModel):
    """Base schema for knowledge graphs"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    graph_type: str = Field(default="custom", min_length=1, max_length=50)
    layout_config: Optional[Dict[str, Any]] = None
    visualization_settings: Optional[Dict[str, Any]] = None
    filtering_rules: Optional[Dict[str, Any]] = None
    ai_insights_enabled: bool = Field(default=True)
    pattern_detection_enabled: bool = Field(default=True)
    clustering_enabled: bool = Field(default=True)
    is_public: bool = Field(default=False)
    is_template: bool = Field(default=False)
    template_category: Optional[str] = None


class KnowledgeNodeBase(BaseModel):
    """Base schema for knowledge nodes"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    node_type: NodeTypeEnum
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    size: float = Field(default=10.0, gt=0)
    color: str = Field(default="#4F46E5", regex=r'^#[0-9A-Fa-f]{6}$')
    properties: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    content: Optional[str] = None


class KnowledgeEdgeBase(BaseModel):
    """Base schema for knowledge edges"""
    source_node_id: UUID
    target_node_id: UUID
    edge_type: EdgeTypeEnum
    label: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    weight: float = Field(default=1.0, ge=0)
    direction: bool = Field(default=True)
    color: str = Field(default="#64748B", regex=r'^#[0-9A-Fa-f]{6}$')
    width: float = Field(default=2.0, gt=0)
    line_style: str = Field(default="solid", regex=r'^(solid|dashed|dotted)$')
    properties: Optional[Dict[str, Any]] = None
    confidence: float = Field(default=1.0, ge=0, le=1)
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    
    @validator('valid_to')
    def validate_dates(cls, v, values):
        if v and 'valid_from' in values and values['valid_from'] and v <= values['valid_from']:
            raise ValueError('valid_to must be after valid_from')
        return v


# ===== Create Schemas =====

class KnowledgeGraphCreate(KnowledgeGraphBase):
    """Schema for creating a knowledge graph"""
    organization_id: UUID


class KnowledgeGraphUpdate(BaseModel):
    """Schema for updating a knowledge graph"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    graph_type: Optional[str] = Field(None, min_length=1, max_length=50)
    layout_config: Optional[Dict[str, Any]] = None
    visualization_settings: Optional[Dict[str, Any]] = None
    filtering_rules: Optional[Dict[str, Any]] = None
    ai_insights_enabled: Optional[bool] = None
    pattern_detection_enabled: Optional[bool] = None
    clustering_enabled: Optional[bool] = None
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None
    template_category: Optional[str] = None


class KnowledgeNodeCreate(KnowledgeNodeBase):
    """Schema for creating a knowledge node"""
    pass


class KnowledgeNodeUpdate(BaseModel):
    """Schema for updating a knowledge node"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    node_type: Optional[NodeTypeEnum] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    size: Optional[float] = Field(None, gt=0)
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    properties: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    content: Optional[str] = None
    is_expanded: Optional[bool] = None
    is_collapsed: Optional[bool] = None
    is_visible: Optional[bool] = None
    is_locked: Optional[bool] = None


class KnowledgeEdgeCreate(KnowledgeEdgeBase):
    """Schema for creating a knowledge edge"""
    pass


class KnowledgeEdgeUpdate(BaseModel):
    """Schema for updating a knowledge edge"""
    source_node_id: Optional[UUID] = None
    target_node_id: Optional[UUID] = None
    edge_type: Optional[EdgeTypeEnum] = None
    label: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0)
    direction: Optional[bool] = None
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    width: Optional[float] = Field(None, gt=0)
    line_style: Optional[str] = Field(None, regex=r'^(solid|dashed|dotted)$')
    properties: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None


# ===== Response Schemas =====

class KnowledgeNodeResponse(BaseModel):
    """Schema for knowledge node response"""
    id: UUID
    graph_id: UUID
    title: str
    description: Optional[str]
    node_type: NodeTypeEnum
    position_x: Optional[float]
    position_y: Optional[float]
    position_z: Optional[float]
    size: float
    color: str
    properties: Optional[Dict[str, Any]]
    tags: Optional[List[str]]
    centrality_score: float
    betweenness_centrality: float
    clustering_coefficient: float
    page_rank_score: float
    content: Optional[str]
    embedding_vector: Optional[List[float]]
    connected_nodes_count: int
    is_expanded: bool
    is_collapsed: bool
    is_visible: bool
    is_locked: bool
    created_at: datetime
    updated_at: datetime
    last_accessed: Optional[datetime]
    
    @classmethod
    def from_orm(cls, node):
        """Create response from ORM model"""
        return cls(
            id=node.id,
            graph_id=node.graph_id,
            title=node.title,
            description=node.description,
            node_type=node.node_type,
            position_x=node.position_x,
            position_y=node.position_y,
            position_z=node.position_z,
            size=node.size,
            color=node.color,
            properties=node.properties,
            tags=node.tags,
            centrality_score=node.centrality_score,
            betweenness_centrality=node.betweenness_centrality,
            clustering_coefficient=node.clustering_coefficient,
            page_rank_score=node.page_rank_score,
            content=node.content,
            embedding_vector=node.embedding_vector,
            connected_nodes_count=node.connected_nodes_count,
            is_expanded=node.is_expanded,
            is_collapsed=node.is_collapsed,
            is_visible=node.is_visible,
            is_locked=node.is_locked,
            created_at=node.created_at,
            updated_at=node.updated_at,
            last_accessed=node.last_accessed
        )


class KnowledgeEdgeResponse(BaseModel):
    """Schema for knowledge edge response"""
    id: UUID
    graph_id: UUID
    source_node_id: UUID
    target_node_id: UUID
    edge_type: EdgeTypeEnum
    label: Optional[str]
    description: Optional[str]
    weight: float
    direction: bool
    color: str
    width: float
    line_style: str
    properties: Optional[Dict[str, Any]]
    is_active: bool
    confidence: float
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    last_updated: datetime
    betweenness_score: float
    usage_count: int
    
    @classmethod
    def from_orm(cls, edge):
        """Create response from ORM model"""
        return cls(
            id=edge.id,
            graph_id=edge.graph_id,
            source_node_id=edge.source_node_id,
            target_node_id=edge.target_node_id,
            edge_type=edge.edge_type,
            label=edge.label,
            description=edge.description,
            weight=edge.weight,
            direction=edge.direction,
            color=edge.color,
            width=edge.width,
            line_style=edge.line_style,
            properties=edge.properties,
            is_active=edge.is_active,
            confidence=edge.confidence,
            valid_from=edge.valid_from,
            valid_to=edge.valid_to,
            last_updated=edge.last_updated,
            betweenness_score=edge.betweenness_score,
            usage_count=edge.usage_count
        )


class KnowledgeGraphResponse(BaseModel):
    """Schema for knowledge graph response"""
    id: UUID
    name: str
    description: Optional[str]
    graph_type: str
    layout_config: Optional[Dict[str, Any]]
    visualization_settings: Optional[Dict[str, Any]]
    filtering_rules: Optional[Dict[str, Any]]
    node_count: int
    edge_count: int
    average_degree: float
    density: float
    ai_insights_enabled: bool
    pattern_detection_enabled: bool
    clustering_enabled: bool
    created_by: UUID
    organization_id: Optional[UUID]
    is_public: bool
    is_template: bool
    template_category: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_analyzed: Optional[datetime]
    
    @classmethod
    def from_orm(cls, graph):
        """Create response from ORM model"""
        return cls(
            id=graph.id,
            name=graph.name,
            description=graph.description,
            graph_type=graph.graph_type,
            layout_config=graph.layout_config,
            visualization_settings=graph.visualization_settings,
            filtering_rules=graph.filtering_rules,
            node_count=graph.node_count,
            edge_count=graph.edge_count,
            average_degree=graph.average_degree,
            density=graph.density,
            ai_insights_enabled=graph.ai_insights_enabled,
            pattern_detection_enabled=graph.pattern_detection_enabled,
            clustering_enabled=graph.clustering_enabled,
            created_by=graph.created_by,
            organization_id=graph.organization_id,
            is_public=graph.is_public,
            is_template=graph.is_template,
            template_category=graph.template_category,
            created_at=graph.created_at,
            updated_at=graph.updated_at,
            last_analyzed=graph.last_analyzed
        )


class KnowledgeGraphDetailResponse(KnowledgeGraphResponse):
    """Schema for detailed knowledge graph response with nodes and edges"""
    nodes: List[KnowledgeNodeResponse]
    edges: List[KnowledgeEdgeResponse]
    
    @classmethod
    def from_orm(cls, graph):
        """Create detailed response from ORM model"""
        base_data = cls.from_orm(graph).dict()
        base_data.update({
            'nodes': [KnowledgeNodeResponse.from_orm(node) for node in graph.nodes],
            'edges': [KnowledgeEdgeResponse.from_orm(edge) for edge in graph.edges]
        })
        return cls(**base_data)


# ===== Analytics Schemas =====

class GraphAnalyticsResponse(BaseModel):
    """Schema for graph analytics response"""
    basic_metrics: Dict[str, Any]
    node_type_distribution: Dict[str, int]
    edge_type_distribution: Dict[str, int]
    top_central_nodes: List[Dict[str, Any]]
    community_count: int


class GraphAnalysisRequest(BaseModel):
    """Schema for requesting graph analysis"""
    analysis_type: GraphAnalysisType
    parameters: Optional[Dict[str, Any]] = None


class GraphAnalysisResponse(BaseModel):
    """Schema for graph analysis response"""
    analysis_type: GraphAnalysisType
    results: Dict[str, Any]
    insights: List[str]
    completed_at: datetime = Field(default_factory=datetime.utcnow)


# ===== AI Insights Schemas =====

class AIInsightBase(BaseModel):
    """Base schema for AI insights"""
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    insight_type: InsightType
    confidence_score: float = Field(default=0.0, ge=0, le=1)
    model_used: Optional[str] = None
    insight_data: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None
    source_nodes: Optional[List[UUID]] = None
    source_edges: Optional[List[UUID]] = None
    citations: Optional[List[str]] = None


class AIInsightCreate(AIInsightBase):
    """Schema for creating AI insights"""
    graph_id: UUID


class AIInsightUpdate(BaseModel):
    """Schema for updating AI insights"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    insight_type: Optional[InsightType] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    status: Optional[str] = None
    verification_status: Optional[str] = None
    insight_data: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None
    citations: Optional[List[str]] = None


class AIInsightResponse(BaseModel):
    """Schema for AI insight response"""
    id: UUID
    graph_id: UUID
    title: str
    description: str
    insight_type: InsightType
    confidence_score: float
    model_used: Optional[str]
    processing_time_ms: Optional[int]
    tokens_used: Optional[int]
    insight_data: Optional[Dict[str, Any]]
    recommendations: Optional[List[str]]
    source_nodes: Optional[List[UUID]]
    source_edges: Optional[List[UUID]]
    citations: Optional[List[str]]
    evidence_strength: float
    status: str
    verification_status: str
    view_count: int
    useful_count: int
    bookmarked_by: Optional[List[UUID]]
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, insight):
        """Create response from ORM model"""
        return cls(
            id=insight.id,
            graph_id=insight.graph_id,
            title=insight.title,
            description=insight.description,
            insight_type=insight.insight_type,
            confidence_score=insight.confidence_score,
            model_used=insight.model_used,
            processing_time_ms=insight.processing_time_ms,
            tokens_used=insight.tokens_used,
            insight_data=insight.insight_data,
            recommendations=insight.recommendations,
            source_nodes=insight.source_nodes,
            source_edges=insight.source_edges,
            citations=insight.citations,
            evidence_strength=insight.evidence_strength,
            status=insight.status,
            verification_status=insight.verification_status,
            view_count=insight.view_count,
            useful_count=insight.useful_count,
            bookmarked_by=insight.bookmarked_by,
            created_at=insight.created_at,
            updated_at=insight.updated_at,
            expires_at=insight.expires_at
        )


class AIInsightRequest(BaseModel):
    """Schema for requesting AI insight generation"""
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    insight_type: InsightType
    source_nodes: Optional[List[UUID]] = None
    source_edges: Optional[List[UUID]] = None
    citations: Optional[List[str]] = None
    model_used: Optional[str] = None


# ===== LLM Assistant Schemas =====

class LLMSessionBase(BaseModel):
    """Base schema for LLM sessions"""
    session_name: Optional[str] = Field(None, max_length=200)
    conversation_context: Optional[Dict[str, Any]] = None
    graph_state: Optional[Dict[str, Any]] = None
    model_name: str = Field(default="gpt-4", max_length=100)
    system_prompt: Optional[str] = None
    context_window: int = Field(default=4000, gt=0)


class LLMSessionCreate(LLMSessionBase):
    """Schema for creating LLM sessions"""
    pass


class LLMSessionUpdate(BaseModel):
    """Schema for updating LLM sessions"""
    session_name: Optional[str] = Field(None, max_length=200)
    conversation_context: Optional[Dict[str, Any]] = None
    graph_state: Optional[Dict[str, Any]] = None
    model_name: Optional[str] = Field(None, max_length=100)
    system_prompt: Optional[str] = None
    context_window: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None
    is_shared: Optional[bool] = None
    satisfaction_score: Optional[float] = Field(None, ge=1, le=5)


class LLMSessionResponse(BaseModel):
    """Schema for LLM session response"""
    id: UUID
    graph_id: UUID
    user_id: UUID
    session_name: Optional[str]
    conversation_context: Optional[Dict[str, Any]]
    graph_state: Optional[Dict[str, Any]]
    model_name: str
    system_prompt: Optional[str]
    context_window: int
    message_count: int
    total_tokens: int
    successful_queries: int
    failed_queries: int
    is_active: bool
    is_shared: bool
    share_token: Optional[str]
    average_response_time: float
    satisfaction_score: Optional[float]
    created_at: datetime
    updated_at: datetime
    last_activity: datetime
    
    @classmethod
    def from_orm(cls, session):
        """Create response from ORM model"""
        return cls(
            id=session.id,
            graph_id=session.graph_id,
            user_id=session.user_id,
            session_name=session.session_name,
            conversation_context=session.conversation_context,
            graph_state=session.graph_state,
            model_name=session.model_name,
            system_prompt=session.system_prompt,
            context_window=session.context_window,
            message_count=session.message_count,
            total_tokens=session.total_tokens,
            successful_queries=session.successful_queries,
            failed_queries=session.failed_queries,
            is_active=session.is_active,
            is_shared=session.is_shared,
            share_token=session.share_token,
            average_response_time=session.average_response_time,
            satisfaction_score=session.satisfaction_score,
            created_at=session.created_at,
            updated_at=session.updated_at,
            last_activity=session.last_activity
        )


class LLMQueryBase(BaseModel):
    """Base schema for LLM queries"""
    query_text: str = Field(..., min_length=1)
    query_intent: Optional[str] = None
    query_entities: Optional[List[str]] = None


class LLMQueryCreate(LLMQueryBase):
    """Schema for creating LLM queries"""
    session_id: UUID


class LLMQueryResponse(BaseModel):
    """Schema for LLM query response"""
    id: UUID
    session_id: UUID
    query_text: str
    query_intent: Optional[str]
    query_entities: Optional[List[str]]
    response_text: Optional[str]
    response_sources: Optional[List[str]]
    response_confidence: float
    execution_time_ms: Optional[int]
    tokens_input: int
    tokens_output: int
    operations_performed: Optional[List[str]]
    nodes_affected: Optional[List[UUID]]
    edges_affected: Optional[List[UUID]]
    helpfulness_score: Optional[float]
    accuracy_score: Optional[float]
    completeness_score: Optional[float]
    created_at: datetime
    
    @classmethod
    def from_orm(cls, query):
        """Create response from ORM model"""
        return cls(
            id=query.id,
            session_id=query.session_id,
            query_text=query.query_text,
            query_intent=query.query_intent,
            query_entities=query.query_entities,
            response_text=query.response_text,
            response_sources=query.response_sources,
            response_confidence=query.response_confidence,
            execution_time_ms=query.execution_time_ms,
            tokens_input=query.tokens_input,
            tokens_output=query.tokens_output,
            operations_performed=query.operations_performed,
            nodes_affected=query.nodes_affected,
            edges_affected=query.edges_affected,
            helpfulness_score=query.helpfulness_score,
            accuracy_score=query.accuracy_score,
            completeness_score=query.completeness_score,
            created_at=query.created_at
        )


class LLMQueryRequest(BaseModel):
    """Schema for LLM query request"""
    query_text: str = Field(..., min_length=1)
    session_id: UUID
    query_intent: Optional[str] = None
    query_entities: Optional[List[str]] = None


class LLMQueryUpdate(BaseModel):
    """Schema for updating LLM queries"""
    helpfulness_score: Optional[float] = Field(None, ge=1, le=5)
    accuracy_score: Optional[float] = Field(None, ge=1, le=5)
    completeness_score: Optional[float] = Field(None, ge=1, le=5)


# ===== RAG Document Schemas =====

class RAGDocumentBase(BaseModel):
    """Base schema for RAG documents"""
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    document_type: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None
    source_publisher: Optional[str] = None
    publication_date: Optional[datetime] = None
    is_trusted: bool = Field(default=False)
    data_classification: Optional[str] = None


class RAGDocumentCreate(RAGDocumentBase):
    """Schema for creating RAG documents"""
    graph_id: UUID


class RAGDocumentUpdate(BaseModel):
    """Schema for updating RAG documents"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    document_type: Optional[str] = None
    source_url: Optional[str] = None
    source_author: Optional[str] = None
    source_publisher: Optional[str] = None
    publication_date: Optional[datetime] = None
    processing_status: Optional[str] = None
    relevance_score: Optional[float] = Field(None, ge=0, le=1)
    is_trusted: Optional[bool] = None
    data_classification: Optional[str] = None


class RAGDocumentResponse(BaseModel):
    """Schema for RAG document response"""
    id: UUID
    graph_id: UUID
    title: str
    content: str
    document_type: Optional[str]
    source_url: Optional[str]
    source_author: Optional[str]
    source_publisher: Optional[str]
    publication_date: Optional[datetime]
    embedding_vector: Optional[List[float]]
    chunk_count: int
    processing_status: str
    relevance_score: float
    citation_count: int
    is_trusted: bool
    verification_status: str
    data_classification: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_cited: Optional[datetime]
    
    @classmethod
    def from_orm(cls, document):
        """Create response from ORM model"""
        return cls(
            id=document.id,
            graph_id=document.graph_id,
            title=document.title,
            content=document.content,
            document_type=document.document_type,
            source_url=document.source_url,
            source_author=document.source_author,
            source_publisher=document.source_publisher,
            publication_date=document.publication_date,
            embedding_vector=document.embedding_vector,
            chunk_count=document.chunk_count,
            processing_status=document.processing_status,
            relevance_score=document.relevance_score,
            citation_count=document.citation_count,
            is_trusted=document.is_trusted,
            verification_status=document.verification_status,
            data_classification=document.data_classification,
            created_at=document.created_at,
            updated_at=document.updated_at,
            last_cited=document.last_cited
        )


# ===== Bulk Operations =====

class BulkNodeCreate(BaseModel):
    """Schema for bulk creating nodes"""
    nodes: List[KnowledgeNodeCreate]


class BulkEdgeCreate(BaseModel):
    """Schema for bulk creating edges"""
    edges: List[KnowledgeEdgeCreate]


class BulkNodeUpdate(BaseModel):
    """Schema for bulk updating nodes"""
    node_updates: List[Dict[str, Any]]


class BulkEdgeUpdate(BaseModel):
    """Schema for bulk updating edges"""
    edge_updates: List[Dict[str, Any]]


class BulkDeleteRequest(BaseModel):
    """Schema for bulk deletion requests"""
    node_ids: Optional[List[UUID]] = None
    edge_ids: Optional[List[UUID]] = None


# ===== Export and Import =====

class GraphExportRequest(BaseModel):
    """Schema for graph export requests"""
    format: str = Field(..., regex=r'^(json|csv|xlsx|graphml|gephi)$')
    include_metadata: bool = Field(default=True)
    include_analytics: bool = Field(default=True)
    include_ai_insights: bool = Field(default=False)


class GraphImportRequest(BaseModel):
    """Schema for graph import requests"""
    format: str = Field(..., regex=r'^(json|csv|xlsx|graphml)$')
    merge_strategy: str = Field(default="append", regex=r'^(append|replace|merge)$')
    conflict_resolution: str = Field(default="skip", regex=r'^(skip|overwrite|rename)$')


# ===== Search and Filter =====

class NodeSearchFilter(BaseModel):
    """Schema for node search filters"""
    title_contains: Optional[str] = None
    description_contains: Optional[str] = None
    node_types: Optional[List[NodeTypeEnum]] = None
    tags_contains: Optional[List[str]] = None
    properties_match: Optional[Dict[str, Any]] = None
    min_centrality: Optional[float] = Field(None, ge=0, le=1)
    max_centrality: Optional[float] = Field(None, ge=0, le=1)
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None


class EdgeSearchFilter(BaseModel):
    """Schema for edge search filters"""
    edge_types: Optional[List[EdgeTypeEnum]] = None
    source_node_types: Optional[List[NodeTypeEnum]] = None
    target_node_types: Optional[List[NodeTypeEnum]] = None
    min_weight: Optional[float] = Field(None, ge=0)
    max_weight: Optional[float] = Field(None, ge=0)
    min_confidence: Optional[float] = Field(None, ge=0, le=1)
    max_confidence: Optional[float] = Field(None, ge=0, le=1)
    is_active: Optional[bool] = None
    valid_at: Optional[datetime] = None


class GraphSearchRequest(BaseModel):
    """Schema for graph search requests"""
    node_filter: Optional[NodeSearchFilter] = None
    edge_filter: Optional[EdgeSearchFilter] = None
    limit: int = Field(default=100, gt=0, le=1000)
    offset: int = Field(default=0, ge=0)
    sort_by: str = Field(default="title", regex=r'^(title|created_at|centrality_score|degree)$')
    sort_order: str = Field(default="asc", regex=r'^(asc|desc)$')


# ===== WebSocket Events =====

class GraphUpdateEvent(BaseModel):
    """Schema for graph update WebSocket events"""
    event_type: str = Field(..., regex=r'^(node_added|node_updated|node_deleted|edge_added|edge_updated|edge_deleted)$')
    graph_id: UUID
    node_id: Optional[UUID] = None
    edge_id: Optional[UUID] = None
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CollaborationEvent(BaseModel):
    """Schema for collaboration events"""
    event_type: str = Field(..., regex=r'^(user_joined|user_left|cursor_moved|node_selected|comment_added)$')
    user_id: UUID
    graph_id: UUID
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Export all schemas
__all__ = [
    # Enums
    'NodeTypeEnum',
    'EdgeTypeEnum', 
    'GraphAnalysisType',
    'InsightType',
    
    # Base and Create/Update Schemas
    'KnowledgeGraphCreate',
    'KnowledgeGraphUpdate',
    'KnowledgeNodeCreate',
    'KnowledgeNodeUpdate',
    'KnowledgeEdgeCreate',
    'KnowledgeEdgeUpdate',
    'AIInsightCreate',
    'AIInsightUpdate',
    'LLMSessionCreate',
    'LLMSessionUpdate',
    'LLMQueryCreate',
    'LLMQueryUpdate',
    'RAGDocumentCreate',
    'RAGDocumentUpdate',
    
    # Response Schemas
    'KnowledgeGraphResponse',
    'KnowledgeGraphDetailResponse',
    'KnowledgeNodeResponse',
    'KnowledgeEdgeResponse',
    'AIInsightResponse',
    'LLMSessionResponse',
    'LLMQueryResponse',
    'RAGDocumentResponse',
    
    # Analytics and Analysis
    'GraphAnalyticsResponse',
    'GraphAnalysisRequest',
    'GraphAnalysisResponse',
    'AIInsightRequest',
    
    # LLM Assistant
    'LLMQueryRequest',
    
    # Bulk Operations
    'BulkNodeCreate',
    'BulkEdgeCreate',
    'BulkNodeUpdate',
    'BulkEdgeUpdate',
    'BulkDeleteRequest',
    
    # Export/Import
    'GraphExportRequest',
    'GraphImportRequest',
    
    # Search and Filter
    'NodeSearchFilter',
    'EdgeSearchFilter',
    'GraphSearchRequest',
    
    # WebSocket Events
    'GraphUpdateEvent',
    'CollaborationEvent'
]