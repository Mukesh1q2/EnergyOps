"""
Report Generator Component
Phase 10: Advanced Analytics & Reporting

Automated AI-powered business report generation:
- Multiple report templates
- Scheduled report generation
- Export options (PDF, Excel, PowerPoint)
- Email delivery
- Custom branding
"""

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Chip,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Switch
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  TableChart,
  Slideshow,
  Schedule,
  Email,
  Palette,
  Settings,
  Download,
  Send,
  Preview
} from '@mui/icons-material';

interface ReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  dashboardType: string;
  selectedWidgets: Array<{
    id: number;
    name: string;
    widget_type: string;
  }>;
}

const reportTemplates = [
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    description: 'High-level business overview for C-level executives',
    icon: <Description color="primary" />,
    estimatedTime: '5 min',
    formats: ['PDF', 'PowerPoint'],
    defaultSections: ['key_metrics', 'financial_performance', 'customer_insights', 'ai_recommendations']
  },
  {
    id: 'weekly_ai_insights',
    name: 'Weekly AI Insights',
    description: 'Comprehensive AI model performance and insights',
    icon: <Slideshow color="primary" />,
    estimatedTime: '3 min',
    formats: ['PDF', 'Excel'],
    defaultSections: ['model_performance', 'prediction_accuracy', 'alert_summary', 'optimization_opportunities']
  },
  {
    id: 'monthly_financial_forecast',
    name: 'Monthly Financial Forecast',
    description: 'Revenue projections and financial planning analysis',
    icon: <TableChart color="primary" />,
    estimatedTime: '7 min',
    formats: ['PDF', 'Excel', 'PowerPoint'],
    defaultSections: ['revenue_forecast', 'pricing_optimization', 'customer_value_analysis', 'risk_assessment']
  },
  {
    id: 'churn_analysis',
    name: 'Customer Churn Analysis',
    description: 'Detailed customer retention and churn risk analysis',
    icon: <Description color="primary" />,
    estimatedTime: '4 min',
    formats: ['PDF', 'Excel'],
    defaultSections: ['churn_metrics', 'risk_factors', 'retention_strategies', 'segment_analysis']
  },
  {
    id: 'pricing_optimization',
    name: 'Pricing Strategy Report',
    description: 'Dynamic pricing recommendations and market analysis',
    icon: <Settings color="primary" />,
    estimatedTime: '6 min',
    formats: ['PDF', 'Excel'],
    defaultSections: ['pricing_opportunities', 'market_comparison', 'revenue_impact', 'competitive_analysis']
  },
  {
    id: 'customer_segmentation',
    name: 'Customer Segmentation Analysis',
    description: 'AI-powered customer grouping and behavioral insights',
    icon: <Slideshow color="primary" />,
    estimatedTime: '5 min',
    formats: ['PDF', 'PowerPoint', 'Excel'],
    defaultSections: ['segment_overview', 'behavioral_patterns', 'value_analysis', 'targeting_strategies']
  }
];

const reportSections = [
  { id: 'key_metrics', name: 'Key Performance Indicators', ai_powered: true },
  { id: 'financial_performance', name: 'Financial Performance', ai_powered: true },
  { id: 'customer_insights', name: 'Customer Insights', ai_powered: true },
  { id: 'ai_recommendations', name: 'AI Recommendations', ai_powered: true },
  { id: 'model_performance', name: 'AI Model Performance', ai_powered: true },
  { id: 'prediction_accuracy', name: 'Prediction Accuracy', ai_powered: true },
  { id: 'alert_summary', name: 'Predictive Alerts Summary', ai_powered: true },
  { id: 'optimization_opportunities', name: 'Optimization Opportunities', ai_powered: true },
  { id: 'revenue_forecast', name: 'Revenue Forecast', ai_powered: true },
  { id: 'pricing_optimization', name: 'Pricing Optimization', ai_powered: true },
  { id: 'customer_value_analysis', name: 'Customer Value Analysis', ai_powered: true },
  { id: 'risk_assessment', name: 'Risk Assessment', ai_powered: true },
  { id: 'churn_metrics', name: 'Churn Metrics', ai_powered: true },
  { id: 'risk_factors', name: 'Risk Factors Analysis', ai_powered: true },
  { id: 'retention_strategies', name: 'Retention Strategies', ai_powered: true },
  { id: 'segment_analysis', name: 'Segment Analysis', ai_powered: true },
  { id: 'pricing_opportunities', name: 'Pricing Opportunities', ai_powered: true },
  { id: 'market_comparison', name: 'Market Comparison', ai_powered: true },
  { id: 'revenue_impact', name: 'Revenue Impact Analysis', ai_powered: true },
  { id: 'competitive_analysis', name: 'Competitive Analysis', ai_powered: true },
  { id: 'segment_overview', name: 'Segment Overview', ai_powered: true },
  { id: 'behavioral_patterns', name: 'Behavioral Patterns', ai_powered: true },
  { id: 'targeting_strategies', name: 'Targeting Strategies', ai_powered: true }
];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  open,
  onClose,
  dashboardType,
  selectedWidgets
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    format: 'PDF',
    sections: [] as string[],
    includeCharts: true,
    includeRawData: false,
    customBranding: false,
    scheduledDelivery: false,
    emailRecipients: [] as string[],
    watermark: true,
    timestamp: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const steps = ['Template Selection', 'Report Configuration', 'Delivery Options', 'Review & Generate'];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setReportConfig(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        sections: template.defaultSections,
        format: template.formats[0]
      }));
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedTemplate) return;
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate report generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGenerationProgress(100);
      
      // Simulate report download
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        onClose();
        
        // Show success message
        alert('Report generated successfully! Download will begin shortly.');
      }, 1000);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Report Template
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Choose from AI-powered report templates optimized for different business needs
            </Typography>
            
            <Grid container spacing={2}>
              {reportTemplates.map((template) => (
                <Grid item xs={12} sm={6} key={template.id}>
                  <Card
                    variant={selectedTemplate === template.id ? 'elevation' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { elevation: 2 }
                    }}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardActionArea>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {template.icon}
                          <Typography variant="h6">
                            {template.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {template.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip label={template.estimatedTime} size="small" variant="outlined" />
                          {template.formats.map((format) => (
                            <Chip key={format} label={format} size="small" color="primary" />
                          ))}
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary">
                          {template.defaultSections.length} sections included
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        const template = reportTemplates.find(t => t.id === selectedTemplate);
        if (!template) return null;

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Report
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Report Name"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Export Format</FormLabel>
                  <RadioGroup
                    value={reportConfig.format}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                  >
                    {template.formats.map((format) => (
                      <FormControlLabel
                        key={format}
                        value={format}
                        control={<Radio />}
                        label={format}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Report Sections ({reportConfig.sections.length} selected)
                </Typography>
                <List dense>
                  {reportSections.map((section) => (
                    <ListItem key={section.id}>
                      <ListItemIcon>
                        <Checkbox
                          checked={reportConfig.sections.includes(section.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReportConfig(prev => ({
                                ...prev,
                                sections: [...prev.sections, section.id]
                              }));
                            } else {
                              setReportConfig(prev => ({
                                ...prev,
                                sections: prev.sections.filter(s => s !== section.id)
                              }));
                            }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={section.name}
                        secondary={section.ai_powered ? 'AI-powered analysis' : 'Static content'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Additional Options
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportConfig.includeCharts}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      />
                    }
                    label="Include interactive charts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportConfig.includeRawData}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeRawData: e.target.checked }))}
                      />
                    }
                    label="Include raw data tables"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportConfig.customBranding}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, customBranding: e.target.checked }))}
                      />
                    }
                    label="Apply custom branding"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Delivery Options
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportConfig.scheduledDelivery}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, scheduledDelivery: e.target.checked }))}
                    />
                  }
                  label="Schedule automatic delivery"
                />
              </Grid>
              
              {reportConfig.scheduledDelivery && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Frequency"
                      select
                      fullWidth
                      defaultValue="weekly"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Delivery Time"
                      type="time"
                      fullWidth
                      defaultValue="09:00"
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <TextField
                  label="Email Recipients"
                  placeholder="Enter email addresses separated by commas"
                  value={reportConfig.emailRecipients.join(', ')}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    emailRecipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                  }))}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Email Notifications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Send completion notification"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Include download link"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Generate
            </Typography>
            
            {template && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Report Preview
                </Typography>
                <Typography variant="body2">
                  Template: {template.name} • Format: {reportConfig.format} • 
                  Estimated time: {template.estimatedTime}
                </Typography>
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Report Details</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2"><strong>Name:</strong> {reportConfig.name}</Typography>
                  <Typography variant="body2"><strong>Description:</strong> {reportConfig.description}</Typography>
                  <Typography variant="body2"><strong>Sections:</strong> {reportConfig.sections.length} sections</Typography>
                  <Typography variant="body2"><strong>Format:</strong> {reportConfig.format}</Typography>
                </Box>
              </Grid>
              
              {reportConfig.scheduledDelivery && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Scheduled Delivery</Typography>
                  <Typography variant="body2">
                    Reports will be automatically generated and delivered
                  </Typography>
                </Grid>
              )}
              
              {reportConfig.emailRecipients.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Email Recipients</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {reportConfig.emailRecipients.map((email, index) => (
                      <Chip key={index} label={email} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedTemplate !== null;
      case 1:
        return reportConfig.name && reportConfig.sections.length > 0;
      case 2:
        return true; // Delivery options are optional
      default:
        return true;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="primary" />
          <Typography variant="h6">AI Report Generator</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ flex: 1 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ height: 'calc(100% - 100px)', overflow: 'auto' }}>
          {isGenerating ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%'
            }}>
              <CircularProgress size={80} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Generating AI Report
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Please wait while we create your personalized report with AI insights
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Typography variant="body2" gutterBottom>
                  Progress: {Math.round(generationProgress)}%
                </Typography>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      height: 8, 
                      bgcolor: 'primary.main', 
                      transition: 'width 0.5s ease',
                      width: `${generationProgress}%`
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            renderStepContent()
          )}
        </Box>
      </DialogContent>
      
      {!isGenerating && (
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleGenerateReport}
              disabled={!canProceed()}
            >
              Generate Report
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportGenerator;