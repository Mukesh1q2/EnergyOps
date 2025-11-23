"""
Analytics Filters Component
Phase 10: Advanced Analytics & Reporting

Comprehensive filtering system for analytics dashboard:
- Time range selection
- Metric filtering
- Data source filtering
- Quick filter presets
"""

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Chip,
  Button,
  Divider,
  IconButton,
  Slider,
  TextField,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close,
  AccessTime,
  FilterList,
  Restore,
  Save,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Dashboard,
  Assessment
} from '@mui/icons-material';

interface AnalyticsFiltersProps {
  open: boolean;
  onClose: () => void;
  onTimeRangeChange: (timeRange: string) => void;
  onMetricsChange: (metrics: string[]) => void;
  selectedTimeRange: string;
  selectedMetrics: string[];
}

const timeRangeOptions = [
  { value: '1h', label: 'Last Hour', description: 'High-frequency updates' },
  { value: '24h', label: 'Last 24 Hours', description: 'Daily monitoring' },
  { value: '7d', label: 'Last 7 Days', description: 'Weekly trends' },
  { value: '30d', label: 'Last 30 Days', description: 'Monthly analysis' },
  { value: '90d', label: 'Last 90 Days', description: 'Quarterly trends' },
  { value: '1y', label: 'Last Year', description: 'Annual patterns' },
  { value: 'custom', label: 'Custom Range', description: 'Specific date range' }
];

const metricOptions = [
  { value: 'usage', label: 'Usage Forecasting', category: 'Usage' },
  { value: 'revenue', label: 'Revenue Analysis', category: 'Financial' },
  { value: 'churn', label: 'Churn Prediction', category: 'Customer' },
  { value: 'pricing', label: 'Pricing Optimization', category: 'Financial' },
  { value: 'segments', label: 'Customer Segmentation', category: 'Customer' },
  { value: 'llm', label: 'LLM Performance', category: 'AI' },
  { value: 'alerts', label: 'Predictive Alerts', category: 'AI' },
  { value: 'kpis', label: 'Key Performance Indicators', category: 'General' }
];

const quickFilterPresets = [
  {
    name: 'Executive Overview',
    description: 'High-level business metrics',
    timeRange: '30d',
    metrics: ['revenue', 'kpis', 'alerts']
  },
  {
    name: 'Customer Analytics',
    description: 'Customer-focused insights',
    timeRange: '30d',
    metrics: ['churn', 'segments', 'usage']
  },
  {
    name: 'Financial Planning',
    description: 'Revenue and pricing analysis',
    timeRange: '90d',
    metrics: ['revenue', 'pricing', 'kpis']
  },
  {
    name: 'AI Operations',
    description: 'AI model performance',
    timeRange: '7d',
    metrics: ['llm', 'alerts', 'kpis']
  },
  {
    name: 'Daily Monitoring',
    description: 'Real-time operations',
    timeRange: '24h',
    metrics: ['usage', 'alerts', 'kpis']
  }
];

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  open,
  onClose,
  onTimeRangeChange,
  onMetricsChange,
  selectedTimeRange,
  selectedMetrics
}) => {
  const [localTimeRange, setLocalTimeRange] = useState(selectedTimeRange);
  const [localMetrics, setLocalMetrics] = useState<string[]>(selectedMetrics);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  const handleTimeRangeChange = (newTimeRange: string) => {
    setLocalTimeRange(newTimeRange);
    if (newTimeRange !== 'custom') {
      onTimeRangeChange(newTimeRange);
    }
  };

  const handleMetricToggle = (metric: string) => {
    const newMetrics = localMetrics.includes(metric)
      ? localMetrics.filter(m => m !== metric)
      : [...localMetrics, metric];
    
    setLocalMetrics(newMetrics);
  };

  const handleApplyFilters = () => {
    if (localTimeRange === 'custom' && customDateRange.start && customDateRange.end) {
      onTimeRangeChange(`custom_${customDateRange.start}_${customDateRange.end}`);
    } else {
      onTimeRangeChange(localTimeRange);
    }
    onMetricsChange(localMetrics);
    onClose();
  };

  const handleResetFilters = () => {
    const defaultTimeRange = '30d';
    const defaultMetrics = ['usage', 'revenue', 'kpis'];
    
    setLocalTimeRange(defaultTimeRange);
    setLocalMetrics(defaultMetrics);
    setCustomDateRange({ start: '', end: '' });
    
    onTimeRangeChange(defaultTimeRange);
    onMetricsChange(defaultMetrics);
  };

  const handleApplyPreset = (preset: typeof quickFilterPresets[0]) => {
    setLocalTimeRange(preset.timeRange);
    setLocalMetrics([...preset.metrics]);
    
    onTimeRangeChange(preset.timeRange);
    onMetricsChange(preset.metrics);
  };

  const getMetricsByCategory = () => {
    const categories = metricOptions.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, typeof metricOptions>);
    
    return categories;
  };

  const groupedMetrics = getMetricsByCategory();

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            <Typography variant="h6">Analytics Filters</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Quick Filter Presets */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Quick Presets</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {quickFilterPresets.map((preset, index) => (
                <Grid item xs={12} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { elevation: 2, bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {preset.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {preset.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={preset.timeRange} size="small" variant="outlined" />
                        <Chip label={`${preset.metrics.length} metrics`} size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Time Range Selection */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime />
              <Typography variant="subtitle1">Time Range</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {timeRangeOptions.map((option) => (
                <Grid item xs={12} key={option.value}>
                  <Card
                    variant={localTimeRange === option.value ? 'elevation' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: localTimeRange === option.value ? 'primary.light' : 'transparent',
                      borderColor: localTimeRange === option.value ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        bgcolor: localTimeRange === option.value ? 'primary.light' : 'action.hover' 
                      }
                    }}
                    onClick={() => handleTimeRangeChange(option.value)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="subtitle2">
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {localTimeRange === 'custom' && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Metrics Selection */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              <Typography variant="subtitle1">Metrics & Data Sources</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(groupedMetrics).map(([category, metrics]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {category}
                </Typography>
                <Grid container spacing={1}>
                  {metrics.map((metric) => (
                    <Grid item xs={12} key={metric.value}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localMetrics.includes(metric.value)}
                            onChange={() => handleMetricToggle(metric.value)}
                            size="small"
                          />
                        }
                        label={metric.label}
                        sx={{ 
                          width: '100%',
                          margin: 0,
                          '& .MuiFormControlLabel-label': { flex: 1 }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Refresh Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Auto-Refresh</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Enable auto-refresh"
            />
            
            {autoRefresh && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Refresh interval: {refreshInterval} seconds
                </Typography>
                <Slider
                  value={refreshInterval}
                  onChange={(_, value) => setRefreshInterval(value as number)}
                  min={30}
                  max={3600}
                  step={30}
                  marks={[
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' },
                    { value: 600, label: '10m' },
                    { value: 1800, label: '30m' },
                    { value: 3600, label: '1h' }
                  ]}
                />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Current Selection Summary */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Selected Filters Summary */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Selection
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {localMetrics.map((metric) => (
                <Chip
                  key={metric}
                  label={metric}
                  size="small"
                  onDelete={() => handleMetricToggle(metric)}
                />
              ))}
            </Box>
            <Typography variant="body2" color="textSecondary">
              Time Range: {timeRangeOptions.find(opt => opt.value === localTimeRange)?.label || localTimeRange}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {localMetrics.length} metrics selected
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleResetFilters}
              fullWidth
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleApplyFilters}
              fullWidth
            >
              Apply
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              fullWidth
            >
              Done
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AnalyticsFilters;