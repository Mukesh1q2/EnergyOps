"""
Knowledge Graph Page
Phase 4: Visual Knowledge Graphs & AI Integration

Main page for knowledge graph visualization and interaction
Features:
- Graph canvas with D3.js visualization
- LLM assistant integration
- AI insights panel
- Graph analytics
- Node and edge management
- Export/import functionality
"""

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Network, 
  Settings, 
  Plus, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  Filter,
  Search,
  BarChart3,
  Users,
  MessageSquare,
  BookOpen,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Save,
  Share2,
  GitBranch,
  Database,
  Puzzle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Grid3X3,
  Layers,
  Activity,
  Clock,
  Star,
  Bookmark,
  Tags,
  Map,
  GitMerge
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import components
import KnowledgeGraphCanvas from '@/components/knowledge-graph/KnowledgeGraphCanvas';
import LLMAssistant from '@/components/knowledge-graph/LLMAssistant';

interface KnowledgeGraph {
  id: string;
  name: string;
  description?: string;
  graphType: string;
  nodeCount: number;
  edgeCount: number;
  averageDegree: number;
  density: number;
  aiInsightsEnabled: boolean;
  patternDetectionEnabled: boolean;
  clusteringEnabled: boolean;
  createdBy: string;
  isPublic: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GraphAnalytics {
  basicMetrics: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
  };
  nodeTypeDistribution: Record<string, number>;
  edgeTypeDistribution: Record<string, number>;
  topCentralNodes: Array<{
    nodeId: string;
    title: string;
    centralityScore: number;
    nodeType: string;
  }>;
  communityCount: number;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  insightType: string;
  confidenceScore: number;
  createdAt: string;
  status: string;
}

const KnowledgeGraphPage: React.FC = () => {
  // State management
  const [currentGraph, setCurrentGraph] = useState<KnowledgeGraph | null>(null);
  const [analytics, setAnalytics] = useState<GraphAnalytics | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('canvas');
  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
    metadata: {}
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarContent, setSidebarContent] = useState('analytics');

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string[]>([]);
  const [edgeTypeFilter, setEdgeTypeFilter] = useState<string[]>([]);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force' | 'hierarchical' | 'circular' | 'grid'>('force');
  const [showLabels, setShowLabels] = useState(true);
  const [enableClustering, setEnableClustering] = useState(true);
  const [enableAIInsights, setEnableAIInsights] = useState(true);

  // Graph creation states
  const [isCreatingGraph, setIsCreatingGraph] = useState(false);
  const [newGraphData, setNewGraphData] = useState({
    name: '',
    description: '',
    graphType: 'custom',
    isPublic: false
  });

  // Initialize with demo data for Phase 4
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setLoading(true);
    
    // Demo knowledge graph data
    const demoGraph: KnowledgeGraph = {
      id: 'demo-graph-1',
      name: 'Energy Market Knowledge Graph',
      description: 'Interactive visualization of energy market relationships and entities',
      graphType: 'energy_market',
      nodeCount: 45,
      edgeCount: 78,
      averageDegree: 3.47,
      density: 0.08,
      aiInsightsEnabled: true,
      patternDetectionEnabled: true,
      clusteringEnabled: true,
      createdBy: 'user-123',
      isPublic: false,
      isTemplate: false,
      createdAt: '2025-11-18T10:00:00Z',
      updatedAt: '2025-11-18T16:00:00Z'
    };

    const demoNodes = [
      { id: 'node-1', title: 'NTPC Ltd', nodeType: 'organization', size: 20, color: '#4ECDC4', connectedNodesCount: 8 },
      { id: 'node-2', title: 'Coal Power Plant A', nodeType: 'energy_asset', size: 15, color: '#45B7D1', connectedNodesCount: 5 },
      { id: 'node-3', title: 'Solar Farm B', nodeType: 'energy_asset', size: 12, color: '#96CEB4', connectedNodesCount: 4 },
      { id: 'node-node-4', title: 'Grid Operator', nodeType: 'organization', size: 18, color: '#4ECDC4', connectedNodesCount: 12 },
      { id: 'node-5', title: 'Power Trading Exchange', nodeType: 'market_data', size: 16, color: '#FECA57', connectedNodesCount: 15 },
      { id: 'node-6', title: 'Renewable Energy Policy', nodeType: 'regulation', size: 14, color: '#54A0FF', connectedNodesCount: 6 },
      { id: 'node-7', title: 'Transmission Line X', nodeType: 'energy_asset', size: 10, color: '#45B7D1', connectedNodesCount: 3 },
      { id: 'node-8', title: 'Smart Grid Technology', nodeType: 'technology', size: 11, color: '#5F27CD', connectedNodesCount: 7 },
      { id: 'node-9', title: 'Battery Storage System', nodeType: 'energy_asset', size: 13, color: '#96CEB4', connectedNodesCount: 8 },
      { id: 'node-10', title: 'Carbon Trading', nodeType: 'commodity', size: 9, color: '#FFA502', connectedNodesCount: 4 }
    ];

    const demoEdges = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', edgeType: 'owns', weight: 1, color: '#E74C3C' },
      { id: 'edge-2', source: 'node-1', target: 'node-9', edgeType: 'owns', weight: 1, color: '#E74C3C' },
      { id: 'edge-3', source: 'node-4', target: 'node-2', edgeType: 'connects_to', weight: 1, color: '#34495E' },
      { id: 'edge-4', source: 'node-4', target: 'node-7', edgeType: 'connects_to', weight: 1, color: '#34495E' },
      { id: 'edge-5', source: 'node-5', target: 'node-1', edgeType: 'trades', weight: 1, color: '#3498DB' },
      { id: 'edge-6', source: 'node-5', target: 'node-3', edgeType: 'trades', weight: 1, color: '#3498DB' },
      { id: 'edge-7', source: 'node-6', target: 'node-1', edgeType: 'regulates', weight: 1, color: '#F39C12' },
      { id: 'edge-8', source: 'node-8', target: 'node-4', edgeType: 'influences', weight: 1, color: '#E74C3C' },
      { id: 'edge-9', source: 'node-9', target: 'node-7', edgeType: 'supplies', weight: 1, color: '#9B59B6' },
      { id: 'edge-10', source: 'node-10', target: 'node-1', edgeType: 'related_to', weight: 0.8, color: '#7F8C8D' }
    ];

    const demoAnalytics: GraphAnalytics = {
      basicMetrics: {
        nodeCount: demoNodes.length,
        edgeCount: demoEdges.length,
        density: 0.078,
        averageDegree: 3.47
      },
      nodeTypeDistribution: {
        organization: 2,
        energy_asset: 4,
        market_data: 1,
        regulation: 1,
        technology: 1,
        commodity: 1
      },
      edgeTypeDistribution: {
        owns: 2,
        connects_to: 2,
        trades: 2,
        regulates: 1,
        influences: 1,
        supplies: 1,
        related_to: 1
      },
      topCentralNodes: [
        { nodeId: 'node-5', title: 'Power Trading Exchange', centralityScore: 0.85, nodeType: 'market_data' },
        { nodeId: 'node-4', title: 'Grid Operator', centralityScore: 0.72, nodeType: 'organization' },
        { nodeId: 'node-1', title: 'NTPC Ltd', centralityScore: 0.67, nodeType: 'organization' }
      ],
      communityCount: 2
    };

    const demoInsights: AIInsight[] = [
      {
        id: 'insight-1',
        title: 'Hub Node Detection',
        description: 'Power Trading Exchange acts as a central hub connecting multiple market participants',
        insightType: 'pattern',
        confidenceScore: 0.89,
        createdAt: '2025-11-18T16:30:00Z',
        status: 'active'
      },
      {
        id: 'insight-2',
        title: 'Community Structure',
        description: 'Two distinct communities detected: Traditional Energy and Renewable Energy sectors',
        insightType: 'pattern',
        confidenceScore: 0.76,
        createdAt: '2025-11-18T16:25:00Z',
        status: 'active'
      },
      {
        id: 'insight-3',
        title: 'Regulatory Impact',
        description: 'Renewable Energy Policy significantly influences traditional energy organizations',
        insightType: 'recommendation',
        confidenceScore: 0.82,
        createdAt: '2025-11-18T16:20:00Z',
        status: 'active'
      }
    ];

    setCurrentGraph(demoGraph);
    setGraphData({
      nodes: demoNodes,
      edges: demoEdges,
      metadata: { name: demoGraph.name, nodeCount: demoGraph.nodeCount, edgeCount: demoGraph.edgeCount }
    });
    setAnalytics(demoAnalytics);
    setAiInsights(demoInsights);
    setLoading(false);
  };

  // Graph event handlers
  const handleNodeClick = useCallback((node: any) => {
    console.log('Node clicked:', node);
    setSidebarContent('node-details');
  }, []);

  const handleEdgeClick = useCallback((edge: any) => {
    console.log('Edge clicked:', edge);
    setSidebarContent('edge-details');
  }, []);

  const handleGraphChange = useCallback((data: any) => {
    setGraphData(data);
  }, []);

  const handleLLMQuery = useCallback((query: string, intent?: string) => {
    console.log('LLM Query:', query, intent);
    // This would typically update the graph or perform operations
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    console.log('Node selected by LLM:', nodeId);
    // Highlight or focus the selected node
  }, []);

  const handleEdgeSelect = useCallback((edgeId: string) => {
    console.log('Edge selected by LLM:', edgeId);
    // Highlight or focus the selected edge
  }, []);

  // Graph analytics functions
  const runAnalysis = async (analysisType: string) => {
    if (!currentGraph) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new insight based on analysis type
      const newInsight: AIInsight = {
        id: `insight-${Date.now()}`,
        title: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis`,
        description: `Completed ${analysisType} analysis on the knowledge graph`,
        insightType: 'pattern',
        confidenceScore: 0.85,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      setAiInsights(prev => [newInsight, ...prev]);
    } catch (error) {
      setError(`Failed to run ${analysisType} analysis`);
    } finally {
      setLoading(false);
    }
  };

  const exportGraph = (format: 'json' | 'csv' | 'xlsx') => {
    const exportData = {
      graph: currentGraph,
      analytics,
      insights: aiInsights,
      data: graphData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-graph-${currentGraph?.name || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const createNewGraph = async () => {
    if (!newGraphData.name.trim()) return;

    setIsCreatingGraph(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const graph: KnowledgeGraph = {
        id: `graph-${Date.now()}`,
        name: newGraphData.name,
        description: newGraphData.description,
        graphType: newGraphData.graphType,
        nodeCount: 0,
        edgeCount: 0,
        averageDegree: 0,
        density: 0,
        aiInsightsEnabled: true,
        patternDetectionEnabled: true,
        clusteringEnabled: true,
        createdBy: 'user-123',
        isPublic: newGraphData.isPublic,
        isTemplate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentGraph(graph);
      setGraphData({ nodes: [], edges: [], metadata: { name: graph.name } });
      setNewGraphData({ name: '', description: '', graphType: 'custom', isPublic: false });
    } catch (error) {
      setError('Failed to create new graph');
    } finally {
      setIsCreatingGraph(false);
    }
  };

  if (loading && !currentGraph) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Network className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Knowledge Graph</h2>
          <p className="text-gray-600">Initializing visualization components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="knowledge-graph-page h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Graph</h1>
            </div>
            {currentGraph && (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-gray-700">{currentGraph.name}</h2>
                <Badge variant="outline">{currentGraph.graphType}</Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSidebar ? 'Hide' : 'Show'} Sidebar
            </Button>
            <Button variant="outline" onClick={() => exportGraph('json')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setSelectedTab('create')}>
              <Plus className="w-4 h-4 mr-2" />
              New Graph
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Graph Area */}
        <div className={cn("flex-1 flex flex-col", showSidebar ? "mr-80" : "")}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
            <div className="bg-white border-b px-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="assistant">LLM Assistant</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
              </TabsList>
            </div>

            {/* Graph Canvas Tab */}
            <TabsContent value="canvas" className="flex-1 p-6 m-0">
              {currentGraph && (
                <KnowledgeGraphCanvas
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                  onGraphChange={handleGraphChange}
                  width={showSidebar ? 800 : 1200}
                  height={600}
                  layoutAlgorithm={layoutAlgorithm}
                  showLabels={showLabels}
                  enableClustering={enableClustering}
                  enableAIInsights={enableAIInsights}
                  className="w-full h-full"
                />
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="flex-1 p-6 m-0">
              {analytics && (
                <div className="grid grid-cols-2 gap-6 h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Basic Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {analytics.basicMetrics.nodeCount}
                            </div>
                            <div className="text-sm text-gray-600">Nodes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {analytics.basicMetrics.edgeCount}
                            </div>
                            <div className="text-sm text-gray-600">Edges</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-700">
                              {analytics.basicMetrics.density.toFixed(3)}
                            </div>
                            <div className="text-sm text-gray-600">Density</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-700">
                              {analytics.basicMetrics.averageDegree.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Degree</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Top Central Nodes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {analytics.topCentralNodes.map((node, index) => (
                            <div key={node.nodeId} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium">{node.title}</div>
                                <div className="text-sm text-gray-600">{node.nodeType}</div>
                              </div>
                              <Badge variant="outline">
                                {node.centralityScore.toFixed(3)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tags className="w-5 h-5" />
                        Node Types Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analytics.nodeTypeDistribution).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitMerge className="w-5 h-5" />
                        Analysis Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => runAnalysis('community_detection')}
                          disabled={loading}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Community Detection
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => runAnalysis('centrality_analysis')}
                          disabled={loading}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Centrality Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => runAnalysis('path_analysis')}
                          disabled={loading}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Path Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="flex-1 p-6 m-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">AI-Generated Insights</h2>
                  <Button onClick={() => runAnalysis('pattern_detection')} disabled={loading}>
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Generate Insights
                  </Button>
                </div>

                <div className="grid gap-4">
                  {aiInsights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{insight.title}</h3>
                              <Badge variant="outline">{insight.insightType}</Badge>
                              <div className="flex items-center gap-1">
                                <Brain className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-600">
                                  {Math.round(insight.confidenceScore * 100)}% confidence
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{insight.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(insight.createdAt).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                {insight.status}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {aiInsights.length === 0 && (
                  <div className="text-center py-12">
                    <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No AI insights yet</h3>
                    <p className="text-gray-600 mb-4">
                      Generate AI-powered insights to understand patterns and relationships in your knowledge graph.
                    </p>
                    <Button onClick={() => runAnalysis('pattern_detection')} disabled={loading}>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* LLM Assistant Tab */}
            <TabsContent value="assistant" className="flex-1 m-0">
              {currentGraph && (
                <LLMAssistant
                  graphId={currentGraph.id}
                  onQuerySubmit={handleLLMQuery}
                  onNodeSelect={handleNodeSelect}
                  onEdgeSelect={handleEdgeSelect}
                  className="h-full"
                />
              )}
            </TabsContent>

            {/* Create New Graph Tab */}
            <TabsContent value="create" className="flex-1 p-6 m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Knowledge Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graph Name
                      </label>
                      <Input
                        value={newGraphData.name}
                        onChange={(e) => setNewGraphData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter graph name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Input
                        value={newGraphData.description}
                        onChange={(e) => setNewGraphData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graph Type
                      </label>
                      <select 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={newGraphData.graphType}
                        onChange={(e) => setNewGraphData(prev => ({ ...prev, graphType: e.target.value }))}
                      >
                        <option value="custom">Custom</option>
                        <option value="energy_market">Energy Market</option>
                        <option value="social_network">Social Network</option>
                        <option value="knowledge_base">Knowledge Base</option>
                        <option value="organizational">Organizational</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={newGraphData.isPublic}
                        onChange={(e) => setNewGraphData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="isPublic" className="text-sm text-gray-700">
                        Make this graph publicly accessible
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createNewGraph} disabled={isCreatingGraph || !newGraphData.name.trim()}>
                        {isCreatingGraph ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Graph
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setNewGraphData({ name: '', description: '', graphType: 'custom', isPublic: false })}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="absolute top-16 right-0 w-80 h-full bg-white border-l shadow-lg">
            <Tabs value={sidebarContent} onValueChange={setSidebarContent} className="h-full flex flex-col">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                  <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
                  <TabsTrigger value="node-details" className="text-xs">Node</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="analytics" className="h-full m-0">
                  <ScrollArea className="h-full p-4">
                    {analytics && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Quick Analytics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Nodes</span>
                            <span className="font-medium">{analytics.basicMetrics.nodeCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Edges</span>
                            <span className="font-medium">{analytics.basicMetrics.edgeCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Communities</span>
                            <span className="font-medium">{analytics.communityCount}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Density</span>
                            <span className="font-medium">{analytics.basicMetrics.density.toFixed(3)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Degree</span>
                            <span className="font-medium">{analytics.basicMetrics.averageDegree.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="insights" className="h-full m-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold">Recent Insights</h3>
                      {aiInsights.slice(0, 5).map((insight) => (
                        <Card key={insight.id} className="border-l-2 border-l-blue-500">
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">{insight.insightType}</Badge>
                              <span className="text-xs text-gray-500">
                                {Math.round(insight.confidenceScore * 100)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="node-details" className="h-full m-0">
                  <ScrollArea className="h-full p-4">
                    <div className="text-center text-gray-500 py-8">
                      <Puzzle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Select a node to view details</p>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings" className="h-full m-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Visualization Settings</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Layout Algorithm
                        </label>
                        <select 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={layoutAlgorithm}
                          onChange={(e) => setLayoutAlgorithm(e.target.value as any)}
                        >
                          <option value="force">Force-directed</option>
                          <option value="hierarchical">Hierarchical</option>
                          <option value="circular">Circular</option>
                          <option value="grid">Grid</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">Show Labels</label>
                          <input
                            type="checkbox"
                            checked={showLabels}
                            onChange={(e) => setShowLabels(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">Enable Clustering</label>
                          <input
                            type="checkbox"
                            checked={enableClustering}
                            onChange={(e) => setEnableClustering(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">AI Insights</label>
                          <input
                            type="checkbox"
                            checked={enableAIInsights}
                            onChange={(e) => setEnableAIInsights(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphPage;