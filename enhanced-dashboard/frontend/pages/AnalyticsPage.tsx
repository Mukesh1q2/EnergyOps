"""
Analytics Dashboard Page
Phase 10: Advanced Analytics & Reporting with AI Integration

Main page component that integrates all analytics features:
- Real-time AI Dashboard Widgets
- Predictive Alerting System
- Automated Report Generation
- Multi-source Data Visualization
"""

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Import analytics components
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { 
  Dashboard, 
  Timeline, 
  Assessment, 
  TrendingUp,
  Warning,
  Insights
} from '@mui/icons-material';

const AnalyticsPage: React.FC = () => {
  const { dashboardId, dashboardType } = useParams<{ dashboardId?: string; dashboardType?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Parse dashboard type from URL or use default
  const parsedDashboardType = (dashboardType as any) || 'ai_insights';
  const parsedDashboardId = dashboardId ? parseInt(dashboardId) : undefined;

  // Available dashboard types with metadata
  const dashboardTypes = {
    executive: {
      title: 'Executive Analytics Dashboard',
      subtitle: 'High-level business insights and KPIs',
      icon: <Dashboard />,
      color: 'primary',
      description: 'C-level overview with key business metrics, revenue forecasts, and strategic AI recommendations'
    },
    operational: {
      title: 'Operational Analytics Dashboard',
      subtitle: 'Real-time operations monitoring',
      icon: <Timeline />,
      color: 'secondary',
      description: 'Real-time monitoring of daily operations, performance metrics, and operational alerts'
    },
    financial: {
      title: 'Financial Analytics Dashboard',
      subtitle: 'Revenue and financial planning',
      icon: <TrendingUp />,
      color: 'success',
      description: 'Financial forecasting, pricing optimization, and revenue analysis powered by AI'
    },
    ai_insights: {
      title: 'AI Insights Dashboard',
      subtitle: 'AI model performance and predictions',
      icon: <Insights />,
      color: 'info',
      description: 'Comprehensive AI model monitoring, predictions, and intelligent recommendations'
    },
    custom: {
      title: 'Custom Analytics Dashboard',
      subtitle: 'Personalized analytics workspace',
      icon: <Assessment />,
      color: 'warning',
      description: 'Fully customizable dashboard with personalized widgets and analytics'
    }
  };

  const currentDashboardType = dashboardTypes[parsedDashboardType] || dashboardTypes.ai_insights;

  // Handle navigation between different dashboard types
  const handleDashboardTypeChange = (newType: string) => {
    navigate(`/analytics/${newType}`);
  };

  // Handle creating new dashboard
  const handleCreateDashboard = () => {
    // This would open a dialog to create a new dashboard
    console.log('Create new dashboard');
  };

  // Quick navigation shortcuts
  const quickActions = [
    {
      label: 'Executive View',
      type: 'executive',
      icon: <Dashboard />,
      description: 'High-level business overview'
    },
    {
      label: 'AI Operations',
      type: 'ai_insights',
      icon: <Insights />,
      description: 'AI model performance'
    },
    {
      label: 'Financial Analysis',
      type: 'financial',
      icon: <TrendingUp />,
      description: 'Revenue and pricing'
    },
    {
      label: 'Operations Monitor',
      type: 'operational',
      icon: <Timeline />,
      description: 'Real-time operations'
    }
  ];

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        dashboardId={parsedDashboardId}
        dashboardType={parsedDashboardType}
      />

      {/* Quick Actions Floating Panel (Desktop Only) */}
      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {quickActions.map((action, index) => (
            <Box
              key={action.type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                px: 2,
                py: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(-4px)',
                  boxShadow: 2
                }
              }}
              onClick={() => handleDashboardTypeChange(action.type)}
            >
              <Box
                sx={{
                  color: currentDashboardType.color === 'primary' ? 'primary.main' :
                         currentDashboardType.color === 'secondary' ? 'secondary.main' :
                         currentDashboardType.color === 'success' ? 'success.main' :
                         currentDashboardType.color === 'info' ? 'info.main' : 'warning.main',
                  transition: 'color 0.2s'
                }}
              >
                {action.icon}
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" fontWeight="bold">
                  {action.label}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  {action.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Dashboard Type Indicator */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          px: 2,
          py: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1,
          boxShadow: 2
        }}
      >
        {currentDashboardType.icon}
        <Box>
          <Typography variant="caption" fontWeight="bold">
            {currentDashboardType.title}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            {currentDashboardType.subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Mobile Quick Actions */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {quickActions.map((action) => (
            <Box
              key={action.type}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.1)',
                  boxShadow: 2
                }
              }}
              onClick={() => handleDashboardTypeChange(action.type)}
              title={action.label}
            >
              <Box
                sx={{
                  color: currentDashboardType.color === 'primary' ? 'primary.main' :
                         currentDashboardType.color === 'secondary' ? 'secondary.main' :
                         currentDashboardType.color === 'success' ? 'success.main' :
                         currentDashboardType.color === 'info' ? 'info.main' : 'warning.main'
                }}
              >
                {action.icon}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Keyboard Shortcuts Help */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1000,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          px: 2,
          py: 1,
          display: { xs: 'none', lg: 'block' },
          fontSize: '0.75rem',
          color: 'text.secondary'
        }}
      >
        <Typography variant="caption">
          <strong>Shortcuts:</strong> E=Executive, A=AI Insights, F=Financial, O=Operations
        </Typography>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;