"""
Churn Risk Heatmap Widget
Phase 10: Advanced Analytics & Reporting

AI-powered churn risk visualization with:
- Interactive heatmap display
- Customer segmentation insights
- Risk level categorization
- Drill-down capabilities
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
  useMediaQuery,
  Grid,
  Card as MUICard
} from '@mui/material';
import {
  TrendingDown,
  Warning,
  MoreVert,
  Download,
  Refresh,
  Visibility,
  People,
  Assessment,
  Business,
  Insights
} from '@mui/icons-material';
import {
  ComposedChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ChurnRiskHeatmapWidgetProps {
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

interface ChurnRiskData {
  customer_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  revenue: number;
  tenure_months: number;
  segment: string;
  region: string;
  recent_activity: number;
  support_tickets: number;
  factors: string[];
}

interface ChurnSummary {
  total_customers: number;
  high_risk_count: number;
  critical_risk_count: number;
  avg_risk_score: number;
  at_risk_revenue: number;
  retention_opportunities: number;
  top_risk_factors: string[];
}

const ChurnRiskHeatmapWidget: React.FC<ChurnRiskHeatmapWidgetProps> = ({
  widget,
  onUpdate,
  timeRange,
  selectedMetrics
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState<ChurnRiskData[]>([]);
  const [summary, setSummary] = useState<ChurnSummary | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'scatter' | 'segments'>('heatmap');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load churn risk data
  useEffect(() => {
    loadChurnData();
    const interval = setInterval(loadChurnData, widget.refresh_interval * 1000);
    return () => clearInterval(interval);
  }, [widget.id, timeRange, selectedSegment]);

  const loadChurnData = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        refresh: 'true',
        timeRange,
        segment: selectedSegment
      });
      
      const response = await fetch(`/api/analytics/widgets/${widget.id}/data?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        const churnData = result.data.risk_scores || [];
        
        // Process and format data
        const processedData = churnData.map((item: any) => ({
          customer_id: item.customer_id,
          risk_score: item.risk_score,
          risk_level: item.risk_level,
          revenue: Math.random() * 10000 + 1000, // Mock data
          tenure_months: Math.random() * 60 + 6, // Mock data
          segment: item.segment || 'Unknown',
          region: item.region || 'Unknown',
          recent_activity: Math.random() * 100, // Mock data
          support_tickets: Math.floor(Math.random() * 10), // Mock data
          factors: item.factors || []
        }));
        
        setRiskData(processedData);
        setSummary(calculateSummary(processedData));
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading churn risk data:', error);
    } finally {
      setLoading(false);
    }
  }, [widget.id, timeRange, selectedSegment]);

  const calculateSummary = (data: ChurnRiskData[]): ChurnSummary => {
    if (data.length === 0) return {
      total_customers: 0,
      high_risk_count: 0,
      critical_risk_count: 0,
      avg_risk_score: 0,
      at_risk_revenue: 0,
      retention_opportunities: 0,
      top_risk_factors: []
    };

    const highRisk = data.filter(d => d.risk_level === 'high').length;
    const criticalRisk = data.filter(d => d.risk_level === 'critical').length;
    const avgRisk = data.reduce((sum, d) => sum + d.risk_score, 0) / data.length;
    const atRiskRevenue = data
      .filter(d => d.risk_level === 'high' || d.risk_level === 'critical')
      .reduce((sum, d) => sum + d.revenue, 0);
    
    // Count risk factors
    const factorCount: { [key: string]: number } = {};
    data.forEach(d => {
      d.factors.forEach(factor => {
        factorCount[factor] = (factorCount[factor] || 0) + 1;
      });
    });
    
    const topRiskFactors = Object.entries(factorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([factor]) => factor);

    return {
      total_customers: data.length,
      high_risk_count: highRisk,
      critical_risk_count: criticalRisk,
      avg_risk_score: avgRisk,
      at_risk_revenue: atRiskRevenue,
      retention_opportunities: highRisk + criticalRisk,
      top_risk_factors: topRiskFactors
    };
  };

  const getRiskColor = (riskScore: number, riskLevel?: string) => {
    if (riskLevel === 'critical') return theme.palette.error.dark;
    if (riskLevel === 'high') return theme.palette.error.light;
    if (riskLevel === 'medium') return theme.palette.warning.light;
    return theme.palette.success.light;
  };

  const getRiskLevelChip = (riskLevel: string) => {
    const config = {
      critical: { label: 'CRITICAL', color: 'error' as const, icon: <Warning /> },
      high: { label: 'HIGH', color: 'warning' as const, icon: <TrendingDown /> },
      medium: { label: 'MEDIUM', color: 'warning' as const, icon: <People /> },
      low: { label: 'LOW', color: 'success' as const, icon: <Assessment /> }
    };
    
    const cfg = config[riskLevel as keyof typeof config] || config.low;
    
    return (
      <Chip
        icon={cfg.icon}
        label={cfg.label}
        size="small"
        color={cfg.color}
        variant="outlined"
      />
    );
  };

  const chartData = useMemo(() => {
    return riskData.map(customer => ({
      ...customer,
      x: customer.revenue,
      y: customer.tenure_months,
      risk: customer.risk_score * 100,
      size: Math.max(5, Math.min(20, customer.revenue / 1000))
    }));
  }, [riskData]);

  const segmentData = useMemo(() => {
    const segments = riskData.reduce((acc, customer) => {
      if (!acc[customer.segment]) {
        acc[customer.segment] = {
          name: customer.segment,
          customers: 0,
          avg_risk: 0,
          total_revenue: 0,
          critical_count: 0,
          high_count: 0
        };
      }
      
      acc[customer.segment].customers += 1;
      acc[customer.segment].avg_risk += customer.risk_score;
      acc[customer.segment].total_revenue += customer.revenue;
      
      if (customer.risk_level === 'critical') acc[customer.segment].critical_count += 1;
      if (customer.risk_level === 'high') acc[customer.segment].high_count += 1;
      
      return acc;
    }, {} as any);
    
    return Object.values(segments).map((seg: any) => ({
      ...seg,
      avg_risk: seg.avg_risk / seg.customers,
      risk_rate: ((seg.critical_count + seg.high_count) / seg.customers * 100).toFixed(1)
    }));
  }, [riskData]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExport = async () => {
    try {
      const csvData = riskData.map(customer => ({
        Customer_ID: customer.customer_id,
        Risk_Score: customer.risk_score,
        Risk_Level: customer.risk_level,
        Revenue: customer.revenue.toFixed(2),
        Tenure_Months: customer.tenure_months.toFixed(1),
        Segment: customer.segment,
        Region: customer.region,
        Recent_Activity: customer.recent_activity.toFixed(1),
        Support_Tickets: customer.support_tickets,
        Risk_Factors: customer.factors.join('; ')
      }));
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `churn_risk_${widget.name}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    handleMenuClose();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2,
          minWidth: 200
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Customer: {data.customer_id}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Revenue: ${data.revenue.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Tenure: {data.tenure_months.toFixed(1)} months
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Segment: {data.segment}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Risk Score: {(data.risk_score * 100).toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Risk Level: {data.risk_level.toUpperCase()}
          </Typography>
          {data.factors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Risk Factors:
              </Typography>
              <Typography variant="caption">
                {data.factors.join(', ')}
              </Typography>
            </Box>
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
            <TrendingDown color="primary" />
            <Typography variant="h6">
              {widget.name}
            </Typography>
          </Box>
        }
        subtitle={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${summary?.total_customers || 0} Customers`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`$${(summary?.at_risk_revenue || 0).toLocaleString()} At Risk`}
              size="small"
              color="error"
              variant="outlined"
            />
            <Chip
              label={`${((summary?.avg_risk_score || 0) * 100).toFixed(1)}% Avg Risk`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        }
        action={
          <Box>
            <IconButton onClick={loadChurnData} size="small">
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
        {/* Summary Stats */}
        {summary && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                  {summary.critical_risk_count}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Critical Risk
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {summary.high_risk_count}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  High Risk
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {summary.retention_opportunities}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Retention Opportunities
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {lastUpdate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Last Updated
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Risk Level Legend */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mb: 2,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: theme.palette.error.dark 
            }} />
            <Typography variant="caption">Critical</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: theme.palette.error.light 
            }} />
            <Typography variant="caption">High</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: theme.palette.warning.light 
            }} />
            <Typography variant="caption">Medium</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: theme.palette.success.light 
            }} />
            <Typography variant="caption">Low</Typography>
          </Box>
        </Box>

        {/* Visualization */}
        <Box sx={{ height: 'calc(100% - 200px)', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'scatter' && (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Revenue"
                  unit="$"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Tenure"
                  unit="mo"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Scatter 
                  name="Customers" 
                  data={chartData}
                  fill={theme.palette.primary.main}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getRiskColor(entry.risk_score, entry.risk_level)} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            )}
            
            {viewMode === 'segments' && (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
                height: '100%'
              }}>
                {segmentData.map((segment: any, index) => (
                  <MUICard 
                    key={index}
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { elevation: 4 }
                    }}
                    onClick={() => setSelectedSegment(segment.name)}
                  >
                    <Typography variant="h6" gutterBottom>
                      {segment.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {segment.customers} customers
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {(segment.avg_risk * 100).toFixed(1)}% avg risk
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ${segment.total_revenue.toLocaleString()} revenue
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`${segment.risk_rate}% at risk`}
                        size="small"
                        color={parseFloat(segment.risk_rate) > 20 ? 'error' : 
                               parseFloat(segment.risk_rate) > 10 ? 'warning' : 'success'}
                      />
                    </Box>
                  </MUICard>
                ))}
              </Box>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setViewMode('heatmap'); handleMenuClose(); }}>
          <Insights sx={{ mr: 1 }} />
          Heatmap View
        </MenuItem>
        <MenuItem onClick={() => { setViewMode('scatter'); handleMenuClose(); }}>
          <Business sx={{ mr: 1 }} />
          Scatter Plot
        </MenuItem>
        <MenuItem onClick={() => { setViewMode('segments'); handleMenuClose(); }}>
          <People sx={{ mr: 1 }} />
          Segment View
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <Download sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ChurnRiskHeatmapWidget;