"""
Predictive Alerts Widget
Phase 10: Advanced Analytics & Reporting

AI-powered predictive alerting system with:
- Real-time alert notifications
- Alert prioritization and filtering
- Quick action buttons
- Alert history tracking
"""

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Button,
  Skeleton,
  Collapse,
  Tooltip,
  Alert as MUIAlert,
  Divider
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AccessTime,
  ExpandMore,
  ExpandLess,
  Done,
  DoneAll,
  Notifications,
  Refresh,
  FilterList,
  ViewModule,
  ViewList
} from '@mui/icons-material';

interface PredictiveAlertsWidgetProps {
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
  alerts: Array<{
    id: number;
    alert_type: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    created_at: string;
    confidence_score?: number;
    impact_score?: number;
  }>;
  onAlertAction: (alertId: number, action: 'acknowledge' | 'resolve') => void;
}

interface AlertGroup {
  priority: 'critical' | 'high' | 'medium' | 'low';
  alerts: typeof widget.alerts;
  count: number;
}

const PredictiveAlertsWidget: React.FC<PredictiveAlertsWidgetProps> = ({
  widget,
  onUpdate,
  timeRange,
  selectedMetrics,
  alerts,
  onAlertAction
}) => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['critical', 'high']));
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load alerts data
  useEffect(() => {
    setLastUpdate(new Date());
  }, [alerts]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <Error color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Info color="info" />;
      default: return <Info color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'churn_risk': return <TrendingDown />;
      case 'usage_spike': return <TrendingUp />;
      case 'pricing_opportunity': return <Info />;
      case 'system_anomaly': return <Warning />;
      default: return <Info />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const groupAlertsByPriority = (alerts: typeof widget.alerts): AlertGroup[] => {
    const grouped = alerts.reduce((acc, alert) => {
      if (!acc[alert.priority]) {
        acc[alert.priority] = [];
      }
      acc[alert.priority].push(alert);
      return acc;
    }, {} as Record<string, typeof alerts>);

    return Object.entries(grouped).map(([priority, alertList]) => ({
      priority: priority as AlertGroup['priority'],
      alerts: alertList,
      count: alertList.length
    })).sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
  };

  const filteredAlerts = alerts.filter(alert => 
    filterPriority === 'all' || alert.priority === filterPriority
  );

  const groupedAlerts = groupAlertsByPriority(filteredAlerts);

  const toggleGroup = (priority: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(priority)) {
      newExpanded.delete(priority);
    } else {
      newExpanded.add(priority);
    }
    setExpandedGroups(newExpanded);
  };

  const getAlertActionButtons = (alert: typeof widget.alerts[0]) => {
    if (alert.status === 'active') {
      return (
        <Box>
          <Button
            size="small"
            onClick={() => onAlertAction(alert.id, 'acknowledge')}
            sx={{ mr: 1 }}
          >
            Acknowledge
          </Button>
          <Button
            size="small"
            color="success"
            onClick={() => onAlertAction(alert.id, 'resolve')}
          >
            Resolve
          </Button>
        </Box>
      );
    }
    return null;
  };

  const getAlertConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'default';
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getAlertImpactDescription = (impact?: number) => {
    if (!impact) return 'Impact unknown';
    if (impact >= 100000) return 'High revenue impact';
    if (impact >= 50000) return 'Medium revenue impact';
    return 'Low revenue impact';
  };

  const getOverallAlertStats = () => {
    const activeAlerts = alerts.filter(a => a.status === 'active');
    const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical');
    const highAlerts = activeAlerts.filter(a => a.priority === 'high');
    
    return {
      total: activeAlerts.length,
      critical: criticalAlerts.length,
      high: highAlerts.length,
      acknowledged: activeAlerts.filter(a => a.status === 'acknowledged').length
    };
  };

  const stats = getOverallAlertStats();

  const renderAlertItem = (alert: typeof widget.alerts[0]) => (
    <ListItem 
      key={alert.id}
      sx={{ 
        borderBottom: 1,
        borderColor: 'divider',
        py: 1
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getAlertTypeIcon(alert.alert_type)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" noWrap>
              {alert.title}
            </Typography>
            <Chip
              label={alert.priority.toUpperCase()}
              size="small"
              color={getPriorityColor(alert.priority) as any}
              variant="outlined"
            />
            {alert.confidence_score && (
              <Chip
                label={`${(alert.confidence_score * 100).toFixed(0)}% confidence`}
                size="small"
                color={getAlertConfidenceColor(alert.confidence_score) as any}
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary" paragraph>
              {alert.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="textSecondary">
                {formatTimeAgo(alert.created_at)}
              </Typography>
              {alert.impact_score && (
                <Typography variant="caption" color="textSecondary">
                  {getAlertImpactDescription(alert.impact_score)}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary">
                Type: {alert.alert_type.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        {getAlertActionButtons(alert)}
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            <Typography variant="h6">
              {widget.name}
            </Typography>
            {stats.critical > 0 && (
              <Badge badgeContent={stats.critical} color="error">
                <Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%' }} />
              </Badge>
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="textSecondary">
              Last updated: {lastUpdate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
            <Chip
              label={`${stats.total} Active Alerts`}
              size="small"
              color={stats.critical > 0 ? 'error' : 'primary'}
              variant="outlined"
            />
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Switch view">
              <IconButton 
                size="small" 
                onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
              >
                {viewMode === 'list' ? <ViewModule /> : <ViewList />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter by priority">
              <IconButton 
                size="small"
                onClick={() => setFilterPriority(
                  filterPriority === 'all' ? 'critical' : 
                  filterPriority === 'critical' ? 'high' : 
                  filterPriority === 'high' ? 'medium' : 'all'
                )}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0, pb: 1 }}>
        {/* Alert Statistics */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 2, 
          mb: 2 
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="error.main">
              {stats.critical}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Critical
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="warning.main">
              {stats.high}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              High
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total Active
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="success.main">
              {stats.acknowledged}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Acknowledged
            </Typography>
          </Box>
        </Box>

        {/* Critical Alerts Banner */}
        {stats.critical > 0 && (
          <MUIAlert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small">
                View Details
              </Button>
            }
          >
            {stats.critical} critical alert{stats.critical > 1 ? 's' : ''} require immediate attention
          </MUIAlert>
        )}

        {/* Filter Indicator */}
        {filterPriority !== 'all' && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Filtering: ${filterPriority.toUpperCase()} priority`}
              size="small"
              onDelete={() => setFilterPriority('all')}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {/* Alerts List */}
        <Box sx={{ 
          maxHeight: 'calc(100% - 200px)', 
          overflow: 'auto',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}>
          {viewMode === 'grouped' ? (
            groupedAlerts.map((group) => (
              <Box key={group.priority}>
                <ListItem 
                  button 
                  onClick={() => toggleGroup(group.priority)}
                  sx={{ 
                    bgcolor: 'background.default',
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getPriorityIcon(group.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {group.priority.toUpperCase()} PRIORITY
                        </Typography>
                        <Chip
                          label={group.count}
                          size="small"
                          color={getPriorityColor(group.priority) as any}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {expandedGroups.has(group.priority) ? <ExpandLess /> : <ExpandMore />}
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Collapse in={expandedGroups.has(group.priority)}>
                  <List component="div" disablePadding>
                    {group.alerts.map(renderAlertItem)}
                  </List>
                </Collapse>
              </Box>
            ))
          ) : (
            <List disablePadding>
              {filteredAlerts.map(renderAlertItem)}
            </List>
          )}
          
          {filteredAlerts.length === 0 && (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
              <Typography variant="h6" color="success.main">
                No Active Alerts
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All systems are operating normally
              </Typography>
            </Box>
          )}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              // Mark all high priority as acknowledged
              alerts.filter(a => a.priority === 'high' && a.status === 'active')
                .forEach(a => onAlertAction(a.id, 'acknowledge'));
            }}
          >
            Acknowledge High Priority
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => {
              // Mark all acknowledged as resolved
              alerts.filter(a => a.status === 'acknowledged')
                .forEach(a => onAlertAction(a.id, 'resolve'));
            }}
          >
            Resolve Acknowledged
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictiveAlertsWidget;