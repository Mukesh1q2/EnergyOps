"""
Analytics Dashboard Component
Phase 10: Advanced Analytics & Reporting with AI Integration

This component implements:
- Real-time AI Dashboard Widgets
- Interactive Analytics Interface
- Predictive Alerting Integration
- Multi-source Data Visualization
"""

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Fab,
  Chip,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Paper,
  Button
} from '@mui/material';
import {
  Refresh,
  Add,
  Settings,
  Download,
  Fullscreen,
  Dashboard,
  TrendingUp,
  Warning,
  Timeline
} from '@mui/icons-material';

// Import analytics widget components
import TimeSeriesForecastWidget from './widgets/TimeSeriesForecastWidget';
import ChurnRiskHeatmapWidget from './widgets/ChurnRiskHeatmapWidget';
import PricingOptimizationWidget from './widgets/PricingOptimizationWidget';
import CustomerSegmentationWidget from './widgets/CustomerSegmentationWidget';
import KPICardsWidget from './widgets/KPICardsWidget';
import PredictiveAlertsWidget from './widgets/PredictiveAlertsWidget';
import LLMPerformanceWidget from './widgets/LLMPerformanceWidget';

// Import UI components
import DashboardHeader from '../dashboard/DashboardHeader';
import WidgetToolbar from '../widgets/WidgetToolbar';
import AnalyticsFilters from './AnalyticsFilters';
import ReportGenerator from './ReportGenerator';

interface AnalyticsDashboardProps {
  dashboardId?: number;
  dashboardType?: 'executive' | 'operational' | 'financial' | 'ai_insights' | 'custom';
}

interface DashboardWidget {
  id: number;
  widget_type: string;
  name: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  data_source: string;
  visualization_config: any;
  refresh_interval: number;
}

interface PredictiveAlert {
  id: number;
  alert_type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  confidence_score?: number;
  impact_score?: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  dashboardId,
  dashboardType = 'ai_insights'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['usage', 'churn', 'pricing', 'segments']);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [dashboardId, dashboardType, autoRefresh]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load dashboard widgets
      const widgetsResponse = await fetch(`/api/analytics/dashboards/${dashboardId}/widgets`);
      if (widgetsResponse.ok) {
        const widgetsData = await widgetsResponse.json();
        setWidgets(widgetsData);
      }
      
      // Load predictive alerts
      const alertsResponse = await fetch('/api/analytics/alerts?status=active&limit=10');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [dashboardId, dashboardType]);

  const handleRefresh = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  const handleWidgetUpdate = useCallback(async (widgetId: number, updatedConfig: any) => {
    try {
      const response = await fetch(`/api/analytics/widgets/${widgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      
      if (response.ok) {
        // Update local state
        setWidgets(prev => prev.map(w => 
          w.id === widgetId ? { ...w, ...updatedConfig } : w
        ));
      }
    } catch (error) {
      console.error('Error updating widget:', error);
    }
  }, []);

  const handleAlertAction = useCallback(async (alertId: number, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch(`/api/analytics/alerts/${alertId}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Update local state
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
    }
  }, []);

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      widget,
      onUpdate: (config: any) => handleWidgetUpdate(widget.id, config),
      timeRange: selectedTimeRange,
      selectedMetrics
    };

    switch (widget.widget_type) {
      case 'time_series_chart':
        return <TimeSeriesForecastWidget key={widget.id} {...commonProps} />;
      case 'churn_risk_heatmap':
        return <ChurnRiskHeatmapWidget key={widget.id} {...commonProps} />;
      case 'pricing_optimization_panel':
        return <PricingOptimizationWidget key={widget.id} {...commonProps} />;
      case 'customer_segmentation_chart':
        return <CustomerSegmentationWidget key={widget.id} {...commonProps} />;
      case 'kpi_card':
        return <KPICardsWidget key={widget.id} {...commonProps} />;
      case 'predictive_alert':
        return <PredictiveAlertsWidget key={widget.id} {...commonProps} alerts={alerts} onAlertAction={handleAlertAction} />;
      case 'llm_performance_metric':
        return <LLMPerformanceWidget key={widget.id} {...commonProps} />;
      default:
        return (
          <Card key={widget.id} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">{widget.name}</Typography>
              <Typography color="textSecondary">Unknown widget type: {widget.widget_type}</Typography>
            </CardContent>
          </Card>
        );
    }
  };

  const getDashboardTitle = () => {
    switch (dashboardType) {
      case 'executive':
        return 'Executive Analytics Dashboard';
      case 'operational':
        return 'Operational Analytics Dashboard';
      case 'financial':
        return 'Financial Analytics Dashboard';
      case 'ai_insights':
        return 'AI Insights Dashboard';
      default:
        return 'Custom Analytics Dashboard';
    }
  };

  const getGridSpacing = () => isMobile ? 1 : 2;
  const getGridItemSize = (width: number) => (isMobile ? 12 : Math.min(width, 12));

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <DashboardHeader
        title={getDashboardTitle()}
        subtitle={`Last updated: ${lastRefresh.toLocaleString()}`}
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<Timeline />}
              label={dashboardType.replace('_', ' ').toUpperCase()}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${alerts.filter(a => a.status === 'active').length} Active Alerts`}
              color={alerts.filter(a => a.priority === 'critical').length > 0 ? 'error' : 'default'}
              size="small"
            />
            <WidgetToolbar
              onRefresh={handleRefresh}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onGenerateReport={() => setShowReportGenerator(!showReportGenerator)}
              onSettings={() => {/* Open dashboard settings */}}
              autoRefresh={autoRefresh}
              onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
              lastRefresh={lastRefresh}
            />
          </Box>
        }
      />

      {/* Filters Panel */}
      {showFilters && (
        <AnalyticsFilters
          onTimeRangeChange={setSelectedTimeRange}
          onMetricsChange={setSelectedMetrics}
          selectedTimeRange={selectedTimeRange}
          selectedMetrics={selectedMetrics}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Predictive Alerts Bar */}
      {alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length > 0 && (
        <Alert
          severity={alerts.filter(a => a.priority === 'critical').length > 0 ? 'error' : 'warning'}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowFilters(true)}
            >
              View Details
            </Button>
          }
          sx={{ mx: 2, mb: 1 }}
        >
          {alerts.filter(a => a.priority === 'critical').length > 0 && 
            `${alerts.filter(a => a.priority === 'critical').length} critical`} 
          {alerts.filter(a => a.priority === 'high').length > 0 && 
            ` and ${alerts.filter(a => a.priority === 'high').length} high-priority`} 
          {' alerts require attention'}
        </Alert>
      )}

      {/* Main Dashboard Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={getGridSpacing()}>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ height: 300 }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={200} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : widgets.length > 0 ? (
            widgets.map(widget => (
              <Grid
                key={widget.id}
                item
                xs={12}
                md={getGridItemSize(widget.width)}
              >
                <Paper 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    minHeight: widget.height * 100,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { elevation: 4 }
                  }}
                >
                  {renderWidget(widget)}
                </Paper>
              </Grid>
            ))
          ) : (
            // Empty state
            <Grid item xs={12}>
              <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Dashboard sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    No Analytics Widgets Configured
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    Add AI-powered widgets to start visualizing your data insights
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {/* Open widget selector */}}
                  >
                    Add Widget
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Report Generator Modal */}
      {showReportGenerator && (
        <ReportGenerator
          open={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
          dashboardType={dashboardType}
          selectedWidgets={widgets}
        />
      )}

      {/* Floating Action Button */}
      {!isMobile && (
        <Fab
          color="primary"
          aria-label="add widget"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => {/* Open widget selector */}}
        >
          <Add />
        </Fab>
      )}

      {/* Status Footer */}
      <Box sx={{ 
        p: 1, 
        borderTop: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="caption" color="textSecondary">
          Analytics Platform v10.0 • AI-Powered Insights
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={`${widgets.length} Widgets`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${alerts.filter(a => a.status === 'active').length} Alerts`}
            color={alerts.filter(a => a.priority === 'critical').length > 0 ? 'error' : 'default'}
            variant="outlined"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;