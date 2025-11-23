"""
KPI Cards Widget
Phase 10: Advanced Analytics & Reporting

Real-time KPI display with:
- Performance metrics
- Trend indicators
- Target comparisons
- Quick actions
"""

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Target,
  Refresh,
  MoreVert,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';

interface KPICardsWidgetProps {
  widget: {
    id: number;
    name: string;
    data_source: string;
    visualization_config: any;
    refresh_interval: number;
  };
  onUpdate: (config: any) => void;
  timeRange: string;
  selectedMetrics: string[];
}

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change_percent: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  last_updated: string;
}

const KPICardsWidget: React.FC<KPICardsWidgetProps> = ({
  widget,
  onUpdate,
  timeRange,
  selectedMetrics
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load KPI data
  useEffect(() => {
    loadKPIData();
    const interval = setInterval(loadKPIData, widget.refresh_interval * 1000);
    return () => clearInterval(interval);
  }, [widget.id, timeRange, selectedMetrics]);

  const loadKPIData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/analytics/widgets/${widget.id}/data?refresh=true&timeRange=${timeRange}`);
      
      if (response.ok) {
        const result = await response.json();
        const kpiData = result.data.metrics || {};
        
        // Convert metrics object to array format
        const processedMetrics: KPIMetric[] = [
          {
            id: 'usage_growth',
            name: 'Predicted Usage Growth',
            value: kpiData.predicted_usage_growth || 0,
            target: 15,
            unit: '%',
            trend: 'up',
            change_percent: 5.2,
            status: 'good',
            description: 'Month-over-month growth prediction',
            last_updated: new Date().toISOString()
          },
          {
            id: 'churn_risk',
            name: 'Average Churn Risk',
            value: (kpiData.average_churn_risk || 0) * 100,
            target: 5,
            unit: '%',
            trend: 'down',
            change_percent: -2.1,
            status: kpiData.average_churn_risk > 0.15 ? 'critical' : 
                   kpiData.average_churn_risk > 0.10 ? 'warning' : 'good',
            description: 'AI-calculated customer churn probability',
            last_updated: new Date().toISOString()
          },
          {
            id: 'pricing_optimization',
            name: 'Pricing Optimization Potential',
            value: kpiData.pricing_optimization_potential || 0,
            target: 100000,
            unit: '$',
            trend: 'up',
            change_percent: 8.7,
            status: 'good',
            description: 'Revenue opportunity from AI recommendations',
            last_updated: new Date().toISOString()
          },
          {
            id: 'customer_segments',
            name: 'Active Customer Segments',
            value: kpiData.active_customer_segments || 0,
            target: 8,
            unit: '',
            trend: 'stable',
            change_percent: 0,
            status: kpiData.active_customer_segments >= 6 ? 'good' : 'warning',
            description: 'Number of active customer segments',
            last_updated: new Date().toISOString()
          }
        ];
        
        setMetrics(processedMetrics);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
    }
  }, [widget.id, timeRange, selectedMetrics]);

  const getTrendIcon = (trend: string, status: string) => {
    if (status === 'critical') return <Error fontSize="small" color="error" />;
    if (status === 'warning') return <Warning fontSize="small" color="warning" />;
    
    switch (trend) {
      case 'up': return <TrendingUp fontSize="small" color="success" />;
      case 'down': return <TrendingDown fontSize="small" color="error" />;
      default: return <TrendingFlat fontSize="small" color="action" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  const getTargetStatus = (value: number, target: number) => {
    if (target === 0) return 'neutral';
    
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  };

  const calculateProgress = (value: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else {
      return value.toLocaleString();
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader 
          title={<Skeleton variant="text" width="60%" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rectangular" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Target color="primary" />
            <Typography variant="h6">
              {widget.name}
            </Typography>
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Last updated: {lastUpdate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
          </Box>
        }
        action={
          <IconButton onClick={loadKPIData} size="small">
            <Refresh fontSize="small" />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} key={metric.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    elevation: 2,
                    borderColor: theme.palette[getProgressColor(metric.status)].main
                  }
                }}
              >
                <CardContent sx={{ pb: 2 }}>
                  {/* Metric Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" noWrap>
                      {metric.name}
                    </Typography>
                    {getTrendIcon(metric.trend, metric.status)}
                  </Box>
                  
                  {/* Main Value */}
                  <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                    {formatValue(metric.value, metric.unit)}
                  </Typography>
                  
                  {/* Target and Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        Target: {formatValue(metric.target, metric.unit)}
                      </Typography>
                      <Chip
                        label={`${calculateProgress(metric.value, metric.target).toFixed(0)}%`}
                        size="small"
                        color={getProgressColor(metric.status)}
                        variant="outlined"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(metric.value, metric.target)}
                      color={getProgressColor(metric.status)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  {/* Change Indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {metric.change_percent > 0 && (
                        <Typography variant="caption" color="success.main">
                          +{metric.change_percent.toFixed(1)}%
                        </Typography>
                      )}
                      {metric.change_percent < 0 && (
                        <Typography variant="caption" color="error.main">
                          {metric.change_percent.toFixed(1)}%
                        </Typography>
                      )}
                      {metric.change_percent === 0 && (
                        <Typography variant="caption" color="textSecondary">
                          No change
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {metric.status === 'good' && (
                        <Tooltip title="On track">
                          <CheckCircle fontSize="small" color="success" />
                        </Tooltip>
                      )}
                      {metric.status === 'warning' && (
                        <Tooltip title="Needs attention">
                          <Warning fontSize="small" color="warning" />
                        </Tooltip>
                      )}
                      {metric.status === 'critical' && (
                        <Tooltip title="Critical">
                          <Error fontSize="small" color="error" />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Description */}
                  <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
                  >
                    {metric.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Overall Status */}
        {metrics.length > 0 && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="h6" gutterBottom>
              Overall Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {metrics.filter(m => m.status === 'good').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    On Track
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {metrics.filter(m => m.status === 'warning').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Needs Attention
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {metrics.filter(m => m.status === 'critical').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Critical
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICardsWidget;