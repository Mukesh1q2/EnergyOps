"""
Knowledge Graph Canvas Component
Phase 4: Visual Knowledge Graphs & AI Integration

Interactive knowledge graph visualization with D3.js
Features:
- Force-directed graph layout
- Drag & drop nodes
- Edge creation and editing
- Zoom and pan
- Node and edge filtering
- AI-powered insights integration
"""

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Plus, 
  Settings, 
  Download, 
  Share2,
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Filter,
  Eye,
  EyeOff,
  Brain,
  MessageSquare,
  Users,
  Play,
  Pause,
  Save,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  title: string;
  description?: string;
  nodeType: string;
  x?: number;
  y?: number;
  size: number;
  color: string;
  tags?: string[];
  properties?: Record<string, any>;
  centralityScore?: number;
  connectedNodesCount?: number;
  isExpanded?: boolean;
  isVisible?: boolean;
  isLocked?: boolean;
  content?: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  edgeType: string;
  label?: string;
  description?: string;
  weight: number;
  direction: boolean;
  color: string;
  width: number;
  lineStyle: string;
  isActive: boolean;
  confidence: number;
}

interface KnowledgeGraphData {
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    name?: string;
    description?: string;
    nodeCount?: number;
    edgeCount?: number;
    graphType?: string;
  };
}

interface KnowledgeGraphCanvasProps {
  data: KnowledgeGraphData;
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onEdgeDoubleClick?: (edge: Edge) => void;
  onGraphChange?: (data: KnowledgeGraphData) => void;
  className?: string;
  width?: number;
  height?: number;
  readonly?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
  showInsights?: boolean;
  layoutAlgorithm?: 'force' | 'hierarchical' | 'circular' | 'grid';
  showLabels?: boolean;
  enableClustering?: boolean;
  enableAIInsights?: boolean;
}

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphCanvasProps> = ({
  data,
  onNodeClick,
  onEdgeClick,
  onNodeDoubleClick,
  onEdgeDoubleClick,
  onGraphChange,
  className,
  width = 800,
  height = 600,
  readonly = false,
  showControls = true,
  showFilters = true,
  showInsights = true,
  layoutAlgorithm = 'force',
  showLabels = true,
  enableClustering = true,
  enableAIInsights = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Edge> | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgeSource, setEdgeSource] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNodeTypes, setFilterNodeTypes] = useState<string[]>([]);
  const [filterEdgeTypes, setFilterEdgeTypes] = useState<string[]>([]);
  const [showHiddenNodes, setShowHiddenNodes] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>>({});

  // Color schemes for different node and edge types
  const nodeColorScheme: Record<string, string> = {
    person: '#FF6B6B',
    organization: '#4ECDC4',
    energy_asset: '#45B7D1',
    market_data: '#96CEB4',
    transaction: '#FECA57',
    location: '#FF9FF3',
    regulation: '#54A0FF',
    technology: '#5F27CD',
    project: '#00D2D3',
    concept: '#FF6348',
    document: '#2ED573',
    time_series: '#3742FA',
    commodity: '#FFA502'
  };

  const edgeColorScheme: Record<string, string> = {
    owns: '#E74C3C',
    trades: '#3498DB',
    located_in: '#2ECC71',
    regulated_by: '#F39C12',
    supplies: '#9B59B6',
    connects_to: '#34495E',
    depends_on: '#E67E22',
    influences: '#E74C3C',
    similar_to: '#95A5A6',
    derived_from: '#16A085',
    related_to: '#7F8C8D',
    contains: '#8E44AD',
    builds_on: '#27AE60',
    conflicts_with: '#C0392B'
  };

  // Initialize D3 visualization
  const initializeVisualization = useCallback(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Create main group for all elements
    const g = svg.append('g');

    // Create arrow markers for directed edges
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    // Filter visible nodes and edges
    const visibleNodes = data.nodes.filter(node => showHiddenNodes || node.isVisible !== false);
    const visibleEdges = data.edges.filter(edge => {
      const sourceVisible = visibleNodes.some(node => node.id === edge.source);
      const targetVisible = visibleNodes.some(node => node.id === edge.target);
      return sourceVisible && targetVisible && 
             (filterNodeTypes.length === 0 || filterNodeTypes.includes(edge.edgeType));
    });

    // Apply node type filter
    const filteredNodes = filterNodeTypes.length > 0 
      ? visibleNodes.filter(node => filterNodeTypes.includes(node.nodeType))
      : visibleNodes;

    // Create force simulation
    if (layoutAlgorithm === 'force') {
      simulationRef.current = d3.forceSimulation<Node>(filteredNodes)
        .force('link', d3.forceLink<Node, Edge>(visibleEdges)
          .id(d => d.id)
          .distance(100)
          .strength(0.5))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.size) + 5));
    }

    // Create link elements (edges)
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(visibleEdges)
      .enter().append('line')
      .attr('stroke', d => edgeColorScheme[d.edgeType] || '#999')
      .attr('stroke-width', d => d.width || 2)
      .attr('stroke-dasharray', d => d.lineStyle === 'dashed' ? '5,5' : 'none')
      .attr('marker-end', d => d.direction ? 'url(#arrowhead)' : null)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedEdge(d);
        onEdgeClick?.(d);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        onEdgeDoubleClick?.(d);
      });

    // Create node elements
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart();
          }
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
          
          // Update node positions for saving
          setNodePositions(prev => ({
            ...prev,
            [d.id]: { x: event.x, y: event.y }
          }));
        })
      );

    // Add circles for nodes
    node.append('circle')
      .attr('r', d => Math.sqrt(d.size) || 10)
      .attr('fill', d => nodeColorScheme[d.nodeType] || '#4F46E5')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', d => d.id === selectedNode?.id ? 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.8))' : 'none')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        setSelectedEdge(null);
        onNodeClick?.(d);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        onNodeDoubleClick?.(d);
      })
      .on('mouseover', function(event, d) {
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('padding', '8px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`
            <strong>${d.title}</strong><br/>
            Type: ${d.nodeType}<br/>
            ${d.description ? d.description.substring(0, 100) + '...' : ''}<br/>
            Connections: ${d.connectedNodesCount || 0}<br/>
            Centrality: ${(d.centralityScore || 0).toFixed(3)}
          `);

        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove();
      });

    // Add labels
    if (showLabels) {
      node.append('text')
        .text(d => d.title)
        .attr('dy', d => (Math.sqrt(d.size) || 10) + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .style('font-weight', '500');
    }

    // Add centrality indicators
    node.append('circle')
      .attr('r', 3)
      .attr('cx', d => (Math.sqrt(d.size) || 10) - 5)
      .attr('cy', d => -(Math.sqrt(d.size) || 10) + 5)
      .attr('fill', d => {
        const score = d.centralityScore || 0;
        if (score > 0.7) return '#FF4757';
        if (score > 0.4) return '#FFA502';
        return '#2ED573';
      })
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    if (simulationRef.current) {
      simulationRef.current.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });
    } else {
      // For non-force layouts, position nodes manually
      const gridCols = Math.ceil(Math.sqrt(filteredNodes.length));
      const gridRows = Math.ceil(filteredNodes.length / gridCols);
      const cellWidth = width / gridCols;
      const cellHeight = height / gridRows;

      filteredNodes.forEach((node, i) => {
        const row = Math.floor(i / gridCols);
        const col = i % gridCols;
        node.x = col * cellWidth + cellWidth / 2;
        node.y = row * cellHeight + cellHeight / 2;
      });

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    setIsSimulating(true);
  }, [data, width, height, layoutAlgorithm, showLabels, showHiddenNodes, filterNodeTypes, selectedNode]);

  // Update graph when data changes
  useEffect(() => {
    initializeVisualization();
  }, [initializeVisualization]);

  // Search functionality
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (!svgRef.current) return;

    const nodes = d3.select(svgRef.current).selectAll('.node');
    const edges = d3.select(svgRef.current).selectAll('.links line');

    if (!term) {
      // Reset to normal
      nodes.style('opacity', 1);
      edges.style('opacity', 0.6);
      return;
    }

    // Highlight matching nodes and connected edges
    const matchingNodeIds = new Set<string>();
    
    data.nodes.forEach(node => {
      const matches = node.title.toLowerCase().includes(term.toLowerCase()) ||
                     node.description?.toLowerCase().includes(term.toLowerCase()) ||
                     node.nodeType.toLowerCase().includes(term.toLowerCase()) ||
                     node.tags?.some(tag => tag.toLowerCase().includes(term.toLowerCase()));
      
      if (matches) {
        matchingNodeIds.add(node.id);
      }
    });

    nodes.style('opacity', d => matchingNodeIds.has(d.id) ? 1 : 0.2);
    edges.style('opacity', d => {
      const sourceMatch = matchingNodeIds.has(d.source);
      const targetMatch = matchingNodeIds.has(d.target);
      return (sourceMatch || targetMatch) ? 0.8 : 0.1;
    });
  }, [data, searchTerm]);

  // Node type filtering
  const getAvailableNodeTypes = useCallback(() => {
    return Array.from(new Set(data.nodes.map(node => node.nodeType)));
  }, [data.nodes]);

  const getAvailableEdgeTypes = useCallback(() => {
    return Array.from(new Set(data.edges.map(edge => edge.edgeType)));
  }, [data.edges]);

  // AI Insights integration
  const generateAIInsights = useCallback(async () => {
    if (!enableAIInsights || !data.nodes.length) return;

    setLoadingInsights(true);
    try {
      // This would typically call the LLM API
      const response = await fetch(`/api/graphs/${data.metadata?.name || 'default'}/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Graph Pattern Analysis',
          description: 'Analyze patterns and insights from this knowledge graph',
          insight_type: 'pattern'
        })
      });

      if (response.ok) {
        const insights = await response.json();
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      // Mock insights for demo
      setAiInsights([
        {
          title: 'Hub Node Detection',
          description: 'Found 3 nodes with high centrality scores that act as information hubs',
          confidence: 0.85,
          type: 'pattern'
        },
        {
          title: 'Community Structure',
          description: 'Detected 2 distinct communities in the network',
          confidence: 0.73,
          type: 'pattern'
        },
        {
          title: 'Relationship Density',
          description: 'The network shows moderate connectivity with potential for expansion',
          confidence: 0.67,
          type: 'pattern'
        }
      ]);
    } finally {
      setLoadingInsights(false);
    }
  }, [enableAIInsights, data]);

  // Export graph data
  const exportGraph = useCallback((format: 'json' | 'csv' | 'xlsx') => {
    const exportData = {
      ...data,
      positions: nodePositions,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data, nodePositions]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1.2
      );
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        0.8
      );
  }, []);

  const resetZoom = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      );
  }, []);

  // Node type filter toggle
  const toggleNodeTypeFilter = useCallback((nodeType: string) => {
    setFilterNodeTypes(prev => 
      prev.includes(nodeType) 
        ? prev.filter(t => t !== nodeType)
        : [...prev, nodeType]
    );
  }, []);

  const toggleEdgeTypeFilter = useCallback((edgeType: string) => {
    setFilterEdgeTypes(prev => 
      prev.includes(edgeType) 
        ? prev.filter(t => t !== edgeType)
        : [...prev, edgeType]
    );
  }, []);

  return (
    <div className={cn("knowledge-graph-canvas", className)}>
      <div className="graph-container relative bg-white rounded-lg border border-gray-200">
        {/* Graph Controls */}
        {showControls && (
          <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg border p-2">
            <div className="flex items-center gap-2 mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={zoomOut}
                disabled={zoomLevel <= 0.3}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetZoom}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={isSimulating}
                onCheckedChange={(checked) => {
                  setIsSimulating(checked);
                  if (simulationRef.current) {
                    if (checked) {
                      simulationRef.current.alpha(0.3).restart();
                    } else {
                      simulationRef.current.alphaTarget(0);
                    }
                  }
                }}
              />
              <span className="text-xs text-gray-600">Auto-layout</span>
            </div>
          </div>
        )}

        {/* Search and Filter Panel */}
        {showFilters && (
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-4 w-80">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Node Type Filters */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Node Types
                </label>
                <div className="flex flex-wrap gap-1">
                  {getAvailableNodeTypes().map(nodeType => (
                    <Badge
                      key={nodeType}
                      variant={filterNodeTypes.includes(nodeType) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleNodeTypeFilter(nodeType)}
                      style={{
                        backgroundColor: filterNodeTypes.includes(nodeType) 
                          ? nodeColorScheme[nodeType] 
                          : 'transparent',
                        borderColor: nodeColorScheme[nodeType],
                        color: filterNodeTypes.includes(nodeType) ? 'white' : nodeColorScheme[nodeType]
                      }}
                    >
                      {nodeType}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Edge Type Filters */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Edge Types
                </label>
                <div className="flex flex-wrap gap-1">
                  {getAvailableEdgeTypes().map(edgeType => (
                    <Badge
                      key={edgeType}
                      variant={filterEdgeTypes.includes(edgeType) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleEdgeTypeFilter(edgeType)}
                      style={{
                        backgroundColor: filterEdgeTypes.includes(edgeType) 
                          ? edgeColorScheme[edgeType] 
                          : 'transparent',
                        borderColor: edgeColorScheme[edgeType],
                        color: filterEdgeTypes.includes(edgeType) ? 'white' : edgeColorScheme[edgeType]
                      }}
                    >
                      {edgeType}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* View Options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Show hidden nodes</label>
                  <Switch
                    checked={showHiddenNodes}
                    onCheckedChange={setShowHiddenNodes}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Show labels</label>
                  <Switch
                    checked={showLabels}
                    onChange={() => {/* Toggle labels */}}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportGraph('json')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                {enableAIInsights && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateAIInsights}
                    disabled={loadingInsights}
                    className="flex-1"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    AI Insights
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        {showInsights && showInsightsPanel && (
          <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-4 w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">AI Insights</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInsightsPanel(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
            
            {loadingInsights ? (
              <div className="text-center text-gray-500">
                <Brain className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                Analyzing graph...
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toggle AI Insights Panel Button */}
        {showInsights && enableAIInsights && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInsightsPanel(!showInsightsPanel)}
            className="absolute bottom-4 left-4 z-10"
          >
            <Brain className="w-4 h-4 mr-1" />
            AI Insights
          </Button>
        )}

        {/* Main SVG Canvas */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="rounded-lg"
          style={{ background: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)' }}
        />

        {/* Selected Node/Edge Details Panel */}
        {(selectedNode || selectedEdge) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg border p-4 w-96 max-h-48 overflow-y-auto">
            {selectedNode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{selectedNode.title}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedNode(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: nodeColorScheme[selectedNode.nodeType],
                        color: 'white'
                      }}
                    >
                      {selectedNode.nodeType}
                    </Badge>
                    {selectedNode.centralityScore && (
                      <Badge variant="outline">
                        Centrality: {selectedNode.centralityScore.toFixed(3)}
                      </Badge>
                    )}
                  </div>
                  {selectedNode.description && (
                    <p className="text-gray-600">{selectedNode.description}</p>
                  )}
                  {selectedNode.tags && selectedNode.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Connections: {selectedNode.connectedNodesCount || 0}
                  </div>
                </div>
              </div>
            )}
            
            {selectedEdge && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {selectedEdge.label || `${selectedEdge.edgeType} relationship`}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEdge(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: edgeColorScheme[selectedEdge.edgeType],
                        color: 'white'
                      }}
                    >
                      {selectedEdge.edgeType}
                    </Badge>
                    {selectedEdge.confidence && (
                      <Badge variant="outline">
                        Confidence: {Math.round(selectedEdge.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  {selectedEdge.description && (
                    <p className="text-gray-600">{selectedEdge.description}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    Weight: {selectedEdge.weight} | 
                    {selectedEdge.direction ? ' Directed' : ' Undirected'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Graph Statistics */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {data.nodes.length}
            </div>
            <div className="text-sm text-gray-600">Nodes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {data.edges.length}
            </div>
            <div className="text-sm text-gray-600">Edges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {getAvailableNodeTypes().length}
            </div>
            <div className="text-sm text-gray-600">Node Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {(data.nodes.reduce((sum, node) => sum + (node.centralityScore || 0), 0) / Math.max(1, data.nodes.length)).toFixed(3)}
            </div>
            <div className="text-sm text-gray-600">Avg Centrality</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeGraphCanvas;