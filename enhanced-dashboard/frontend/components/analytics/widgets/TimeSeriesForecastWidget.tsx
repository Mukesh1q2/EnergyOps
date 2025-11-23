"""
Time Series Forecast Widget
Phase 10: Advanced Analytics & Reporting

AI-powered time series forecasting widget with:
- Interactive chart visualization
- Confidence intervals
- Forecast accuracy metrics
- Real-time data updates
"""

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Download,
  Refresh,
  Visibility,
  Timeline,
  Assessment
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';

interface TimeSeriesForecastWidgetProps {
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

interface ForecastDataPoint {
  date: string;
  actual_value?: number;
  predicted_value: number;
  confidence_lower: number;
  confidence_upper: number;
  accuracy?: number;
  trend: 'up' | 'down' | 'stable';
}

interface ForecastSummary {
  total_growth: number;
  accuracy_score: number;
  forecast_horizon: number;
  data_points: number;
  trend_direction: 'up' | 'down' | 'stable';
  confidence_level: number;
}

const TimeSeriesForecastWidget: React.FC<TimeSeriesForecastWidgetProps> = ({
  widget,
  onUpdate,
  timeRange,
  selectedMetrics
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ForecastDataPoint[]>([]);
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'line' | 'area'>('area');
  const [showConfidence, setShowConfidence] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load forecast data
  useEffect(() => {
    loadForecastData();
    const interval = setInterval(loadForecastData, widget.refresh_interval * 1000);
    return () => clearInterval(interval);
  }, [widget.id, timeRange]);

  const loadForecastData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/analytics/widgets/${widget.id}/data?refresh=true&timeRange=${timeRange}`);
      
      if (response.ok) {
        const result = await response.json();
        const forecastData = result.data.forecasts || [];
        
        // Process and format data
        const processedData = forecastData.map((item: any) => ({
          date: item.date,
          actual_value: item.actual_value || null,
          predicted_value: item.value,
          confidence_lower: item.confidence_interval?.[0] || 0,
          confidence_upper: item.confidence_interval?.[1] || 0,
          accuracy: item.accuracy,
          trend: calculateTrend(forecastData, item.date)
        }));
        
        setData(processedData);
        setSummary(calculateSummary(processedData));
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setLoading(false);
    }
  }, [widget.id, timeRange]);

  const calculateTrend = (data: any[], currentDate: string): 'up' | 'down' | 'stable' => {
    const currentIndex = data.findIndex(d => d.date === currentDate);
    if (currentIndex === -1 || currentIndex === data.length - 1) return 'stable';
    
    const current = data[currentIndex].predicted_value;
    const next = data[currentIndex + 1].predicted_value;
    const changePercent = ((next - current) / current) * 100;
    
    if (changePercent > 0.5) return 'up';
    if (changePercent < -0.5) return 'down';
    return 'stable';
  };

  const calculateSummary = (data: ForecastDataPoint[]): ForecastSummary => {
    if (data.length === 0) return {
      total_growth: 0,
      accuracy_score: 0,
      forecast_horizon: 0,
      data_points: 0,
      trend_direction: 'stable',
      confidence_level: 0
    };

    const firstValue = data[0].predicted_value;
    const lastValue = data[data.length - 1].predicted_value;
    const totalGrowth = ((lastValue - firstValue) / firstValue) * 100;
    
    const avgAccuracy = data.reduce((sum, point) => sum + (point.accuracy || 0), 0) / data.length;
    
    const upwardPoints = data.filter(d => d.trend === 'up').length;
    const downwardPoints = data.filter(d => d.trend === 'down').length;
    
    const trendDirection = upwardPoints > downwardPoints ? 'up' : 
                          downwardPoints > upwardPoints ? 'down' : 'stable';
    
    const avgConfidence = data.reduce((sum, point) => 
      sum + ((point.confidence_upper - point.confidence_lower) / 2), 0) / data.length;

    return {
      total_growth: totalGrowth,
      accuracy_score: avgAccuracy,
      forecast_horizon: data.length,
      data_points: data.length,
      trend_direction: trendDirection,
      confidence_level: avgConfidence
    };
  };

  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [data]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExport = async () => {
    try {
      const csvData = data.map(point => ({
        Date: point.date,
        'Predicted Value': point.predicted_value,
        'Confidence Lower': point.confidence_lower,
        'Confidence Upper': point.confidence_upper,
        'Accuracy': point.accuracy || 'N/A'
      }));
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forecast_${widget.name}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    handleMenuClose();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" fontSize="small" />;
      case 'down': return <TrendingDown color="error" fontSize="small" />;
      default: return <Timeline color="action" fontSize="small" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success.main';
      case 'down': return 'error.main';
      default: return 'text.secondary';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2
        }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value?.toFixed(2) || 'N/A'}
            </Typography>
          ))}
          {showConfidence && payload[0]?.payload?.confidence_lower && (
            <Typography variant="caption" color="textSecondary">
              95% Confidence: {payload[0].payload.confidence_lower.toFixed(2)} - {payload[0].payload.confidence_upper.toFixed(2)}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader 
          title={<Skeleton variant="text" width="60%" />}
          action={<Skeleton variant="circular" width={32} height={32} />}
        />
        <CardContent>
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline color="primary" />
            <Typography variant="h6">
              {widget.name}
            </Typography>
          </Box>
        }
        subtitle={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={getTrendIcon(summary?.trend_direction || 'stable')}
              label={`${summary?.trend_direction?.toUpperCase() || 'STABLE'}`}
              size="small"
              sx={{ color: getTrendColor(summary?.trend_direction || 'stable') }}
            />
            <Chip
              label={`±${(summary?.total_growth || 0).toFixed(1)}% Growth`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Assessment />}
              label={`${(summary?.accuracy_score || 0).toFixed(1)}% Accuracy`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        }
        action={
          <Box>
            <IconButton onClick={loadForecastData} size="small">
              <Refresh fontSize="small" />
            </IconButton>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Box sx={{ height: 'calc(100% - 100px)', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                
                {showConfidence && (
                  <Area
                    dataKey="confidence_upper"
                    fill={theme.palette.primary.light}
                    fillOpacity={0.1}
                    stroke="none"
                  />
                )}
                
                <Area
                  dataKey="predicted_value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.2}
                  name="Predicted"
                />
                
                {data.some(d => d.actual_value) && (
                  <Line
                    type="monotone"
                    dataKey="actual_value"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Actual"
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="predicted_value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Predicted"
                />
                
                {data.some(d => d.actual_value) && (
                  <Line
                    type="monotone"
                    dataKey="actual_value"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Actual"
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
        
        {/* Summary Stats */}
        {summary && (
          <Box sx={{ 
            mt: 2, 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {summary.data_points}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Data Points
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {summary.forecast_horizon}d
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Forecast Horizon
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {(summary.confidence_level * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg Confidence
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {lastUpdate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Last Updated
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setViewMode(viewMode === 'area' ? 'line' : 'area'); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} />
          Switch to {viewMode === 'area' ? 'Line' : 'Area'} Chart
        </MenuItem>
        <MenuItem onClick={() => { setShowConfidence(!showConfidence); handleMenuClose(); }}>
          <TrendingUp sx={{ mr: 1 }} />
          {showConfidence ? 'Hide' : 'Show'} Confidence Interval
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <Download sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TimeSeriesForecastWidget;