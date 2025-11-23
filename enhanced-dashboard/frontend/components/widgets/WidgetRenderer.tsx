/**
 * Widget Renderer Component
 * Phase 3: Enhanced Dashboard & Enterprise Features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Network,
  Map,
  MapPin,
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

import { 
  DashboardWidget as WidgetType,
  WidgetDataSource,
  DataSourceType 
} from '../../types/dashboard';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useWidgetCollaboration } from '../../hooks/useWidgetCollaboration';

// Chart color schemes
const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

interface WidgetRendererProps {
  widget: WidgetType;
  isPaused?: boolean;
  onUpdate?: (updates: Partial<WidgetType>) => void;
  height?: number;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  isPaused = false,
  onUpdate,
  height = 300
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Hooks for data and collaboration
  const {
    data: widgetData,
    loading: dataLoading,
    error: dataError,
    refresh: refreshData
  } = useWidgetData(widget.id);

  const {
    annotations,
    comments,
    isAnnotating,
    addAnnotation,
    addComment
  } = useWidgetCollaboration(widget.id);

  // Process widget data
  useEffect(() => {
    if (widgetData) {
      setData(widgetData.data || []);
      setMetadata(widgetData.metadata || {});
      setError(widgetData.error || null);
    }
    setIsLoading(dataLoading);
  }, [widgetData, dataLoading]);

  // Auto-refresh data when not paused
  useEffect(() => {
    if (!isPaused && widget.refresh_interval > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, widget.refresh_interval * 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused, widget.refresh_interval, refreshData]);

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={refreshData}
            className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  // Render widget based on type
  const renderWidget = () => {
    switch (widget.widget_type) {
      case 'LINE_CHART':
      case 'TIME_SERIES':
        return renderLineChart();
      case 'AREA_CHART':
        return renderAreaChart();
      case 'BAR_CHART':
        return renderBarChart();
      case 'PIE_CHART':
        return renderPieChart();
      case 'SCATTER_CHART':
        return renderScatterChart();
      case 'MULTI_AXIS_CHART':
        return renderMultiAxisChart();
      case 'KNOWLEDGE_GRAPH':
      case 'NETWORK_GRAPH':
        return renderKnowledgeGraph();
      case 'GEOSPATIAL_MAP':
      case 'CHOROPLETH_MAP':
        return renderGeospatialMap();
      case 'HEATMAP':
        return renderHeatmap();
      case 'KPI_CARD':
      case 'METRIC_CARD':
        return renderKPICard();
      case 'DATA_TABLE':
        return renderDataTable();
      case 'SANKEY_DIAGRAM':
        return renderSankeyDiagram();
      case 'GANTT_CHART':
        return renderGanttChart();
      case 'COLLABORATION_PANEL':
      case 'COMMENT_THREAD':
        return renderCollaborationPanel();
      case 'ACTIVITY_FEED':
        return renderActivityFeed();
      default:
        return renderUnknownWidget();
    }
  };

  // Chart rendering functions
  const renderLineChart = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const xField = config.x_field || 'time';
    const yField = config.y_field || 'value';

    return (
      <ResponsiveContainer width="100%" height={height - 80}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xField}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (typeof value === 'string') return value;
              return new Date(value).toLocaleDateString();
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey={yField}
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {config.show_annotations && annotations.map((annotation: any, index: number) => (
            <div key={index} className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              {annotation.text}
            </div>
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const xField = config.x_field || 'time';
    const yField = config.y_field || 'value';

    return (
      <ResponsiveContainer width="100%" height={height - 80}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xField} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey={yField}
            stroke={CHART_COLORS[0]}
            fill={CHART_COLORS[0]}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const xField = config.x_field || 'category';
    const yField = config.y_field || 'value';

    return (
      <ResponsiveContainer width="100%" height={height - 80}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xField} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey={yField} fill={CHART_COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const nameField = config.name_field || 'name';
    const valueField = config.value_field || 'value';

    return (
      <ResponsiveContainer width="100%" height={height - 80}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueField}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const xField = config.x_field || 'x';
    const yField = config.y_field || 'y';
    const sizeField = config.size_field || 'size';

    return (
      <ResponsiveContainer width="100%" height={height - 80}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xField} type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey={yField} type="number" tick={{ fontSize: 12 }} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Scatter 
            dataKey={yField} 
            fill={CHART_COLORS[0]}
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderMultiAxisChart = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const xField = config.x_field || 'time';

    return (
      <ResponsiveContainer width="100%" height={height - 80}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xField} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey={config.y1_field || 'primary'}
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey={config.y2_field || 'secondary'}
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Specialized widget renderers
  const renderKnowledgeGraph = () => {
    const config = widget.visualization_config || {};
    
    return (
      <div className="flex items-center justify-center h-full" ref={containerRef}>
        <div className="text-center">
          <Network className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Knowledge Graph
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Interactive network visualization
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-900">Nodes</div>
              <div className="text-blue-700">{data.length || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-900">Connections</div>
              <div className="text-green-700">{metadata.connections || 0}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeospatialMap = () => {
    const config = widget.visualization_config || {};
    
    return (
      <div className="flex items-center justify-center h-full bg-blue-50" ref={containerRef}>
        <div className="text-center">
          <Map className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Geospatial Map
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Interactive map visualization
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-900">Markers</div>
              <div className="text-blue-700">{data.length || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-900">Regions</div>
              <div className="text-green-700">{metadata.regions || 0}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeatmap = () => {
    if (!data.length) return renderEmptyState();

    return (
      <div className="p-4">
        <div className="grid grid-cols-8 gap-1 h-full">
          {data.map((item, index) => (
            <div
              key={index}
              className="aspect-square rounded"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${item.intensity || 0.5})`
              }}
              title={`Value: ${item.value || 0}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderKPICard = () => {
    const config = widget.visualization_config || {};
    const valueField = config.value_field || 'value';
    const trendField = config.trend_field || 'trend';
    
    const currentValue = data.length > 0 ? data[0][valueField] : 0;
    const trend = data.length > 0 ? data[0][trendField] : 0;
    const isPositive = trend >= 0;

    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className={`h-8 w-8 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {typeof currentValue === 'number' ? 
              new Intl.NumberFormat().format(currentValue) : 
              currentValue
            }
          </div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{trend}% from last period
          </div>
          {config.title && (
            <div className="text-sm text-gray-500 mt-2">
              {config.title}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    if (!data.length) return renderEmptyState();

    const config = widget.visualization_config || {};
    const columns = config.columns || Object.keys(data[0] || {});

    return (
      <div className="h-full overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column: string) => (
                <th key={column} className="px-4 py-2 text-left font-medium text-gray-900">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.slice(0, 10).map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column: string) => (
                  <td key={column} className="px-4 py-2 text-gray-700">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <div className="text-center py-2 text-sm text-gray-500">
            Showing 10 of {data.length} rows
          </div>
        )}
      </div>
    );
  };

  const renderSankeyDiagram = () => {
    return (
      <div className="flex items-center justify-center h-full" ref={containerRef}>
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sankey Diagram
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Energy flow visualization
          </p>
          <div className="text-xs text-gray-500">
            Flow data: {data.length} nodes
          </div>
        </div>
      </div>
    );
  };

  const renderGanttChart = () => {
    return (
      <div className="flex items-center justify-center h-full" ref={containerRef}>
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gantt Chart
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Project timeline visualization
          </p>
          <div className="text-xs text-gray-500">
            Tasks: {data.length || 0}
          </div>
        </div>
      </div>
    );
  };

  const renderCollaborationPanel = () => {
    return (
      <div className="h-full overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Collaboration</h3>
          <Users className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">2 users online</span>
          </div>
          
          {comments.slice(0, 3).map((comment, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500 mb-1">
                {comment.created_by}
              </div>
              <div className="text-sm text-gray-700">
                {comment.content}
              </div>
            </div>
          ))}
          
          <button className="w-full py-2 px-3 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
            Add Comment
          </button>
        </div>
      </div>
    );
  };

  const renderActivityFeed = () => {
    const activities = data.length > 0 ? data : [
      { id: 1, action: 'Widget updated', user: 'John Doe', time: '2 min ago' },
      { id: 2, action: 'Comment added', user: 'Jane Smith', time: '5 min ago' },
      { id: 3, action: 'Layout changed', user: 'Mike Johnson', time: '10 min ago' }
    ];

    return (
      <div className="h-full overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Activity Feed</h3>
          <Activity className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUnknownWidget = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Info className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          Unknown widget type: {widget.widget_type}
        </p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      className="widget-renderer relative w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderWidget()}
      
      {/* Widget overlay for annotations and interactions */}
      {(isAnnotating || annotations.length > 0) && (
        <div className="absolute inset-0 pointer-events-none">
          {annotations.map((annotation: any, index: number) => (
            <div
              key={index}
              className="absolute bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-xs"
              style={{
                left: annotation.x,
                top: annotation.y
              }}
            >
              {annotation.text}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WidgetRenderer;