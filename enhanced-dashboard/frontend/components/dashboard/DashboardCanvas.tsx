/**
 * Dashboard Canvas Component
 * Phase 3: Enhanced Dashboard & Enterprise Features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Resizable, ResizeDirection } from 're-resizable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Settings, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  Copy
} from 'lucide-react';

import { useDashboard } from '../hooks/useDashboard';
import { useCollaboration } from '../hooks/useCollaboration';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Dashboard as DashboardType,
  DashboardWidget as WidgetType,
  WidgetLayout,
  User
} from '../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { CollaborationPanel } from './CollaborationPanel';
import { DashboardSettings } from './DashboardSettings';
import { LayoutTemplate } from './LayoutTemplate';

interface DashboardCanvasProps {
  dashboardId: string;
  user: User;
  isEditable?: boolean;
  onDashboardUpdate?: (dashboard: Partial<DashboardType>) => void;
}

interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GRID_COLS = 12;
const GRID_ROWS = 8;
const MIN_WIDGET_SIZE = { w: 3, h: 2 };
const MAX_WIDGET_SIZE = { w: 12, h: 8 };

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  dashboardId,
  user,
  isEditable = true,
  onDashboardUpdate
}) => {
  // State
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [widgets, setWidgets] = useState<WidgetType[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showLayoutTemplates, setShowLayoutTemplates] = useState(false);
  const [gridPositions, setGridPositions] = useState<Map<string, GridPosition>>(new Map());

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  // Hooks
  const { 
    dashboard: dashboardData,
    widgets: widgetData,
    loading,
    error,
    updateWidget,
    deleteWidget,
    updateLayout,
    refreshDashboard
  } = useDashboard(dashboardId);

  const {
    liveCursors,
    presence,
    comments,
    isCollaborating,
    sendCursorUpdate,
    sendPresenceUpdate,
    createComment
  } = useCollaboration(dashboardId, user.id);

  const { 
    isConnected,
    sendMessage,
    onMessage
  } = useWebSocket(`/api/v1/collaboration/ws/sessions/${dashboardId}`);

  // Initialize data
  useEffect(() => {
    if (dashboardData) {
      setDashboard(dashboardData);
    }
    if (widgetData) {
      setWidgets(widgetData);
      // Initialize grid positions
      const positions = new Map<string, GridPosition>();
      widgetData.forEach(widget => {
        positions.set(widget.id, {
          x: widget.x || 0,
          y: widget.y || 0,
          w: widget.width || 6,
          h: widget.height || 4
        });
      });
      setGridPositions(positions);
    }
  }, [dashboardData, widgetData]);

  // WebSocket message handling
  useEffect(() => {
    if (!onMessage) return;

    onMessage((message) => {
      const { event, data } = message;
      
      switch (event) {
        case 'widget_created':
          addWidget(data.widget);
          break;
        case 'widget_updated':
          updateWidgetInState(data.widget_id, data.updates);
          break;
        case 'widget_deleted':
          removeWidget(data.widget_id);
          break;
        case 'layout_changed':
          updateLayoutInState(data.layout_data);
          break;
        case 'cursor_updated':
          // Handle live cursor updates
          break;
        case 'comment_created':
          // Handle new comments
          break;
        case 'presence_updated':
          // Handle presence updates
          break;
      }
    });

    return () => {
      onMessage(null);
    };
  }, [onMessage]);

  // Widget management functions
  const addWidget = useCallback((widget: WidgetType) => {
    setWidgets(prev => [...prev, widget]);
    setGridPositions(prev => new Map(prev.set(widget.id, {
      x: widget.x || 0,
      y: widget.y || 0,
      w: widget.width || 6,
      h: widget.height || 4
    })));
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setGridPositions(prev => {
      const newMap = new Map(prev);
      newMap.delete(widgetId);
      return newMap;
    });
    setSelectedWidgets(prev => {
      const newSet = new Set(prev);
      newSet.delete(widgetId);
      return newSet;
    });
  }, []);

  const updateWidgetInState = useCallback((widgetId: string, updates: Partial<WidgetType>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  }, []);

  const updateLayoutInState = useCallback((layoutData: Record<string, GridPosition>) => {
    setGridPositions(new Map(Object.entries(layoutData)));
  }, []);

  // Drag and drop handling
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    const newPosition: GridPosition = {
      x: destination.index % GRID_COLS,
      y: Math.floor(destination.index / GRID_COLS) * 2,
      w: gridPositions.get(draggableId)?.w || 6,
      h: gridPositions.get(draggableId)?.h || 4
    };

    // Update local state
    setGridPositions(prev => new Map(prev.set(draggableId, newPosition)));
    
    // Update backend
    if (isEditable) {
      updateLayout({
        [draggableId]: newPosition
      }).catch(console.error);
    }
  }, [gridPositions, isEditable, updateLayout]);

  // Resize handling
  const handleResize = useCallback((
    widgetId: string,
    direction: ResizeDirection,
    delta: { width: number; height: number }
  ) => {
    setIsResizing(true);
    
    const currentPosition = gridPositions.get(widgetId);
    if (!currentPosition) return;

    let newWidth = currentPosition.w;
    let newHeight = currentPosition.h;
    let newX = currentPosition.x;
    let newY = currentPosition.y;

    // Calculate new dimensions based on resize direction
    if (direction.includes('right')) {
      newWidth = Math.min(MAX_WIDGET_SIZE.w, currentPosition.w + Math.ceil(delta.width / 100));
    }
    if (direction.includes('bottom')) {
      newHeight = Math.min(MAX_WIDGET_SIZE.h, currentPosition.h + Math.ceil(delta.height / 80));
    }

    const newPosition: GridPosition = { x: newX, y: newY, w: newWidth, h: newHeight };
    
    // Update local state
    setGridPositions(prev => new Map(prev.set(widgetId, newPosition)));
    
    // Debounce backend update
    setTimeout(() => {
      if (isEditable) {
        updateLayout({ [widgetId]: newPosition }).catch(console.error);
      }
      setIsResizing(false);
    }, 500);
  }, [gridPositions, isEditable, updateLayout]);

  // Widget selection
  const handleWidgetClick = useCallback((widgetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedWidgets(prev => {
        const newSet = new Set(prev);
        if (newSet.has(widgetId)) {
          newSet.delete(widgetId);
        } else {
          newSet.add(widgetId);
        }
        return newSet;
      });
    } else {
      // Single select
      setSelectedWidgets(new Set([widgetId]));
    }
  }, []);

  // Widget actions
  const handleDeleteSelected = useCallback(async () => {
    if (!isEditable || selectedWidgets.size === 0) return;
    
    const widgetIds = Array.from(selectedWidgets);
    
    for (const widgetId of widgetIds) {
      try {
        await deleteWidget(widgetId);
      } catch (error) {
        console.error(`Failed to delete widget ${widgetId}:`, error);
      }
    }
    
    setSelectedWidgets(new Set());
  }, [isEditable, selectedWidgets, deleteWidget]);

  const handleToggleVisibility = useCallback(async (widgetId: string) => {
    if (!isEditable) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    try {
      await updateWidget(widgetId, { is_visible: !widget.is_visible });
    } catch (error) {
      console.error(`Failed to toggle visibility for widget ${widgetId}:`, error);
    }
  }, [isEditable, widgets, updateWidget]);

  const handleToggleLock = useCallback(async (widgetId: string) => {
    if (!isEditable) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    try {
      await updateWidget(widgetId, { is_locked: !widget.is_locked });
    } catch (error) {
      console.error(`Failed to toggle lock for widget ${widgetId}:`, error);
    }
  }, [isEditable, widgets, updateWidget]);

  // Real-time controls
  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    if (isConnected) {
      sendMessage({
        event: 'dashboard_pause_toggled',
        data: { dashboard_id: dashboardId, is_paused: !isPaused }
      });
    }
  }, [isPaused, dashboardId, isConnected, sendMessage]);

  const handleRefresh = useCallback(async () => {
    await refreshDashboard();
  }, [refreshDashboard]);

  // Presence and cursor updates
  useEffect(() => {
    if (isConnected && canvasRef.current) {
      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        sendCursorUpdate({ x, y, widget_id: null });
      };

      const canvas = canvasRef.current;
      canvas.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isConnected, sendCursorUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">
          <p className="font-semibold">Failed to load dashboard</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Dashboard not found</p>
      </div>
    );
  }

  return (
    <div className="dashboard-canvas relative w-full h-full bg-gray-50">
      {/* Canvas Header */}
      <div className="dashboard-header flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {dashboard.name}
          </h1>
          <span className={`px-2 py-1 text-xs rounded-full ${
            dashboard.status === 'active' ? 'bg-green-100 text-green-800' :
            dashboard.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {dashboard.status}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Real-time Controls */}
          <button
            onClick={handleTogglePause}
            className={`p-2 rounded-lg transition-colors ${
              isPaused ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw size={16} />
          </button>

          {/* Layout Controls */}
          <button
            onClick={() => setShowLayoutTemplates(true)}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Layout templates"
          >
            <Grid size={16} />
          </button>

          {/* Collaboration */}
          <button
            onClick={() => setShowCollaboration(true)}
            className={`p-2 rounded-lg transition-colors ${
              isCollaborating ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            } hover:bg-blue-200`}
            title="Collaboration panel"
          >
            <Share2 size={16} />
            {presence.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {presence.length}
              </span>
            )}
          </button>

          {/* Actions */}
          <div className="border-l border-gray-200 pl-2 flex items-center space-x-1">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Dashboard settings"
            >
              <Settings size={16} />
            </button>

            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              <Download size={16} />
            </button>

            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedWidgets.size > 0 && (
        <div className="bulk-actions flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedWidgets.size} widget{selectedWidgets.size !== 1 ? 's' : ''} selected
            </span>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Select All
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Clear Selection
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteSelected}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete selected widgets"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div 
        ref={canvasRef}
        className="canvas-content flex-1 p-4 overflow-auto"
        onClick={() => setSelectedWidgets(new Set())}
      >
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-canvas">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="relative min-h-full"
              >
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full opacity-10">
                    {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={`${(i / GRID_COLS) * 100}%`}
                        y1="0"
                        x2={`${(i / GRID_COLS) * 100}%`}
                        y2="100%"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    ))}
                    {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1="0"
                        y1={`${(i / GRID_ROWS) * 100}%`}
                        x2="100%"
                        y2={`${(i / GRID_ROWS) * 100}%`}
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    ))}
                  </svg>
                </div>

                {/* Widgets */}
                <AnimatePresence>
                  {widgets.map((widget, index) => {
                    const position = gridPositions.get(widget.id) || {
                      x: widget.x || 0,
                      y: widget.y || 0,
                      w: widget.width || 6,
                      h: widget.height || 4
                    };

                    if (!widget.is_visible) return null;

                    const isSelected = selectedWidgets.has(widget.id);

                    return (
                      <Draggable
                        key={widget.id}
                        draggableId={widget.id}
                        index={index}
                        isDragDisabled={!isEditable || widget.is_locked || isResizing}
                      >
                        {(provided, snapshot) => (
                          <Resizable
                            size={{
                              width: position.w * 100,
                              height: position.h * 80
                            }}
                            onResize={(e, dir) => handleResize(widget.id, dir, {
                              width: e.movementX,
                              height: e.movementY
                            })}
                            minWidth={MIN_WIDGET_SIZE.w * 100}
                            minHeight={MIN_WIDGET_SIZE.h * 80}
                            maxWidth={MAX_WIDGET_SIZE.w * 100}
                            maxHeight={MAX_WIDGET_SIZE.h * 80}
                            bounds="parent"
                            enable={{
                              top: isEditable && !widget.is_locked,
                              right: isEditable && !widget.is_locked,
                              bottom: isEditable && !widget.is_locked,
                              left: isEditable && !widget.is_locked,
                              topRight: isEditable && !widget.is_locked,
                              bottomRight: isEditable && !widget.is_locked,
                              bottomLeft: isEditable && !widget.is_locked,
                              topLeft: isEditable && !widget.is_locked
                            }}
                          >
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`widget-container absolute bg-white border-2 rounded-lg shadow-sm transition-all duration-200 ${
                                isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 
                                snapshot.isDragging ? 'border-blue-300 shadow-lg' : 
                                'border-gray-200'
                              } ${widget.is_locked ? 'opacity-75' : ''}`}
                              style={{
                                ...provided.draggableProps.style,
                                left: position.x * 100,
                                top: position.y * 80,
                                width: position.w * 100,
                                height: position.h * 80
                              }}
                              onClick={(e) => handleWidgetClick(widget.id, e)}
                            >
                              {/* Widget Header */}
                              <div className="widget-header flex items-center justify-between p-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                                <div className="flex items-center space-x-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move p-1 hover:bg-gray-200 rounded"
                                  >
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  </div>
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {widget.title}
                                  </h3>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleVisibility(widget.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                    title="Toggle visibility"
                                  >
                                    {widget.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                  </button>

                                  {isEditable && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleLock(widget.id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                      title="Toggle lock"
                                    >
                                      {widget.is_locked ? <Lock size={14} /> : <Unlock size={14} />}
                                    </button>
                                  )}

                                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                    <Settings size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Widget Content */}
                              <div className="widget-content flex-1 overflow-hidden">
                                <WidgetRenderer
                                  widget={widget}
                                  isPaused={isPaused}
                                  onUpdate={(updates) => updateWidgetInState(widget.id, updates)}
                                />
                              </div>

                              {/* Live Cursors Overlay */}
                              {liveCursors.map(cursor => (
                                <div
                                  key={cursor.user_id}
                                  className="absolute pointer-events-none z-50"
                                  style={{
                                    left: cursor.x,
                                    top: cursor.y,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                >
                                  <div 
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: cursor.color }}
                                  >
                                    <div className="text-xs text-white text-center leading-4 font-medium">
                                      {cursor.label || cursor.user_id.slice(-2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          </Resizable>
                        )}
                      </Draggable>
                    );
                  })}
                </AnimatePresence>

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showSettings && (
        <DashboardSettings
          dashboard={dashboard}
          onClose={() => setShowSettings(false)}
          onUpdate={onDashboardUpdate}
        />
      )}

      {showCollaboration && (
        <CollaborationPanel
          dashboardId={dashboardId}
          user={user}
          onClose={() => setShowCollaboration(false)}
        />
      )}

      {showLayoutTemplates && (
        <LayoutTemplate
          onClose={() => setShowLayoutTemplates(false)}
          onApplyTemplate={(template) => {
            // Apply template layout
            setShowLayoutTemplates(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardCanvas;