import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createApiError } from '../api-gateway/route';
import { triggerWebhookEvent } from '../webhooks/route';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';

// Workflow Types
export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  description: string;
  config: any;
  nextSteps: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'schedule' | 'webhook' | 'event';
    config: any;
  };
  steps: WorkflowStep[];
  enabled: boolean;
  userId: string;
  createdAt: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'draft' | 'active' | 'paused' | 'error';
  runCount: number;
  errorCount: number;
}

// Workflow Engine
class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private activeWorkflows: Set<string> = new Set();
  private scheduledJobs: Map<string, any> = new Map();
  
  // Create a new workflow
  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'lastRun' | 'nextRun' | 'status' | 'runCount' | 'errorCount'>): Workflow {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newWorkflow: Workflow = {
      ...workflow,
      id,
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: null,
      status: 'draft',
      runCount: 0,
      errorCount: 0
    };
    
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }
  
  // Execute workflow
  async executeWorkflow(workflowId: string, context: any = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active: ${workflow.status}`);
    }
    
    try {
      workflow.status = 'running';
      workflow.lastRun = new Date().toISOString();
      workflow.runCount++;
      
      const result = await this.executeSteps(workflow.steps, context);
      
      workflow.status = 'active';
      
      // Trigger completion webhook
      triggerWebhookEvent('workflow_completed', {
        workflowId: workflow.id,
        workflowName: workflow.name,
        executionTime: Date.now(),
        context,
        result
      });
      
      return result;
      
    } catch (error) {
      workflow.status = 'error';
      workflow.errorCount++;
      
      // Trigger error webhook
      triggerWebhookEvent('workflow_failed', {
        workflowId: workflow.id,
        workflowName: workflow.name,
        error: error.message,
        context
      });
      
      throw error;
    }
  }
  
  // Execute workflow steps
  private async executeSteps(steps: WorkflowStep[], context: any, currentStepId?: string): Promise<any> {
    const results: any = {};
    
    for (const step of steps) {
      // Skip if not connected to current step
      if (currentStepId && !this.isStepReachable(steps, currentStepId, step.id)) {
        continue;
      }
      
      try {
        const stepResult = await this.executeStep(step, context, results);
        results[step.id] = stepResult;
        
        // If this step has next steps, continue execution
        if (step.nextSteps.length > 0) {
          for (const nextStepId of step.nextSteps) {
            const nextStep = steps.find(s => s.id === nextStepId);
            if (nextStep && nextStep.type !== 'trigger') {
              await this.executeSteps([nextStep], context, step.id);
            }
          }
        }
        
      } catch (error) {
        throw new Error(`Step ${step.name} failed: ${error.message}`);
      }
    }
    
    return results;
  }
  
  // Check if step is reachable from current step
  private isStepReachable(steps: WorkflowStep[], fromStepId: string, toStepId: string): boolean {
    const fromStep = steps.find(s => s.id === fromStepId);
    if (!fromStep) return false;
    
    if (fromStep.nextSteps.includes(toStepId)) return true;
    
    for (const nextId of fromStep.nextSteps) {
      const nextStep = steps.find(s => s.id === nextId);
      if (nextStep && this.isStepReachable(steps, nextId, toStepId)) {
        return true;
      }
    }
    
    return false;
  }
  
  // Execute individual step
  private async executeStep(step: WorkflowStep, context: any, previousResults: any): Promise<any> {
    switch (step.type) {
      case 'action':
        return await this.executeAction(step, context, previousResults);
        
      case 'condition':
        return await this.executeCondition(step, context, previousResults);
        
      case 'delay':
        return await this.executeDelay(step, context);
        
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }
  
  // Execute action step
  private async executeAction(step: WorkflowStep, context: any, previousResults: any): Promise<any> {
    const { action, config } = step;
    
    switch (action) {
      case 'create_dashboard':
        return await this.createDashboard(config, context);
        
      case 'update_dashboard':
        return await this.updateDashboard(config, context);
        
      case 'send_notification':
        return await this.sendNotification(config, context);
        
      case 'run_analytics':
        return await this.runAnalytics(config, context);
        
      case 'create_webhook':
        return await this.createWebhook(config, context);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  // Execute condition step
  private async executeCondition(step: WorkflowStep, context: any, previousResults: any): Promise<boolean> {
    const { condition, value, operator } = step.config;
    
    switch (operator) {
      case 'equals':
        return condition === value;
      case 'greater_than':
        return Number(condition) > Number(value);
      case 'less_than':
        return Number(condition) < Number(value);
      case 'contains':
        return String(condition).includes(String(value));
      default:
        return false;
    }
  }
  
  // Execute delay step
  private async executeDelay(step: WorkflowStep, context: any): Promise<any> {
    const { duration, unit } = step.config;
    
    let delayMs = duration;
    switch (unit) {
      case 'seconds':
        delayMs *= 1000;
        break;
      case 'minutes':
        delayMs *= 60 * 1000;
        break;
      case 'hours':
        delayMs *= 60 * 60 * 1000;
        break;
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return { delayed: duration, unit };
  }
  
  // Action implementations
  private async createDashboard(config: any, context: any): Promise<any> {
    // Mock dashboard creation
    return {
      dashboardId: `dashboard_${Date.now()}`,
      name: config.name || `Automated Dashboard ${new Date().toLocaleDateString()}`,
      widgets: config.widgets || [],
      layout: config.layout || {},
      createdAt: new Date().toISOString()
    };
  }
  
  private async updateDashboard(config: any, context: any): Promise<any> {
    // Mock dashboard update
    return {
      dashboardId: config.dashboardId,
      updatedFields: Object.keys(config.updates || {}),
      updatedAt: new Date().toISOString()
    };
  }
  
  private async sendNotification(config: any, context: any): Promise<any> {
    // Mock notification
    return {
      notificationId: `notification_${Date.now()}`,
      type: config.type || 'info',
      message: config.message,
      recipients: config.recipients || [],
      sentAt: new Date().toISOString()
    };
  }
  
  private async runAnalytics(config: any, context: any): Promise<any> {
    // Mock analytics run
    return {
      analysisId: `analysis_${Date.now()}`,
      metrics: ['volatility', 'sharpe_ratio', 'max_drawdown'],
      results: {
        volatility: 0.15,
        sharpe_ratio: 1.2,
        max_drawdown: 0.08
      },
      completedAt: new Date().toISOString()
    };
  }
  
  private async createWebhook(config: any, context: any): Promise<any> {
    // Mock webhook creation
    return {
      webhookId: `webhook_${Date.now()}`,
      url: config.url,
      events: config.events || [],
      createdAt: new Date().toISOString()
    };
  }
  
  // Schedule workflow
  scheduleWorkflow(workflowId: string, schedule: string) {
    if (this.scheduledJobs.has(workflowId)) {
      this.unscheduleWorkflow(workflowId);
    }
    
    const job = cron.schedule(schedule, async () => {
      try {
        await this.executeWorkflow(workflowId);
      } catch (error) {
        console.error(`Workflow ${workflowId} execution failed:`, error);
      }
    });
    
    this.scheduledJobs.set(workflowId, job);
    
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'active';
      workflow.nextRun = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Next hour
    }
  }
  
  // Unschedule workflow
  unscheduleWorkflow(workflowId: string) {
    const job = this.scheduledJobs.get(workflowId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(workflowId);
    }
    
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'paused';
      workflow.nextRun = null;
    }
  }
  
  // Get workflows
  getWorkflows(userId?: string): Workflow[] {
    const workflows = Array.from(this.workflows.values());
    return userId ? workflows.filter(w => w.userId === userId) : workflows;
  }
  
  // Get workflow by ID
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }
  
  // Update workflow
  updateWorkflow(workflowId: string, updates: Partial<Workflow>): Workflow | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;
    
    Object.assign(workflow, updates);
    return workflow;
  }
  
  // Delete workflow
  deleteWorkflow(workflowId: string): boolean {
    this.unscheduleWorkflow(workflowId);
    return this.workflows.delete(workflowId);
  }
}

// Initialize workflow engine
const workflowEngine = new WorkflowEngine();

// Workflow Templates
const workflowTemplates = {
  daily_energy_report: {
    name: 'Daily Energy Report',
    description: 'Generate daily energy production and market analysis report',
    trigger: {
      type: 'schedule',
      config: { cron: '0 8 * * *', timezone: 'UTC' } // Daily at 8 AM
    },
    steps: [
      {
        id: 'collect_data',
        type: 'action',
        name: 'Collect Energy Data',
        description: 'Gather energy production and market data',
        config: { action: 'run_analytics', config: { metrics: ['power_output', 'market_price'] } },
        nextSteps: ['analyze_data']
      },
      {
        id: 'analyze_data',
        type: 'action',
        name: 'Analyze Data',
        description: 'Run analytics on collected data',
        config: { action: 'run_analytics', config: { type: 'daily_report' } },
        nextSteps: ['create_dashboard']
      },
      {
        id: 'create_dashboard',
        type: 'action',
        name: 'Create Report Dashboard',
        description: 'Create dashboard with analysis results',
        config: { action: 'create_dashboard', config: { template: 'daily_report' } },
        nextSteps: ['send_notification']
      },
      {
        id: 'send_notification',
        type: 'action',
        name: 'Send Report Notification',
        description: 'Notify stakeholders about completed report',
        config: { action: 'send_notification', config: { type: 'daily_report_ready' } },
        nextSteps: []
      }
    ]
  },
  price_alert: {
    name: 'Price Alert System',
    description: 'Monitor market prices and trigger alerts when thresholds are met',
    trigger: {
      type: 'schedule',
      config: { cron: '*/15 * * * *', timezone: 'UTC' } // Every 15 minutes
    },
    steps: [
      {
        id: 'check_prices',
        type: 'action',
        name: 'Check Market Prices',
        description: 'Fetch current market prices',
        config: { action: 'run_analytics', config: { metrics: ['market_price'] } },
        nextSteps: ['evaluate_threshold']
      },
      {
        id: 'evaluate_threshold',
        type: 'condition',
        name: 'Evaluate Price Threshold',
        description: 'Check if price exceeds alert threshold',
        config: { condition: 'market_price', operator: 'greater_than', value: 0.065 },
        nextSteps: ['send_alert']
      },
      {
        id: 'send_alert',
        type: 'action',
        name: 'Send Price Alert',
        description: 'Send immediate alert about high prices',
        config: { action: 'send_notification', config: { type: 'price_alert' } },
        nextSteps: []
      }
    ]
  }
};

// Initialize with templates
Object.entries(workflowTemplates).forEach(([key, template]) => {
  workflowEngine.createWorkflow({
    name: template.name,
    description: template.description,
    trigger: template.trigger,
    steps: template.steps,
    enabled: false, // Templates are disabled by default
    userId: 'system'
  });
});

// Workflow API endpoints
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const workflowId = searchParams.get('id');
  
  try {
    if (action === 'list') {
      const workflows = workflowEngine.getWorkflows();
      return createApiResponse({ workflows });
    }
    
    if (action === 'templates') {
      return createApiResponse({ templates: workflowTemplates });
    }
    
    if (action === 'get' && workflowId) {
      const workflow = workflowEngine.getWorkflow(workflowId);
      if (!workflow) {
        return createApiError('Workflow not found', 'WORKFLOW_NOT_FOUND', 404);
      }
      return createApiResponse({ workflow });
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'WORKFLOW_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const requestData = await req.json();
    const { action, workflow, config } = requestData;
    
    if (action === 'create') {
      const newWorkflow = workflowEngine.createWorkflow({
        ...workflow,
        userId: decoded.userId,
        enabled: false // Start disabled
      });
      
      return createApiResponse({ workflow: newWorkflow }, 201);
    }
    
    if (action === 'execute') {
      const { workflowId, context } = config;
      
      if (!workflowId) {
        return createApiError('Workflow ID is required', 'MISSING_WORKFLOW_ID', 400);
      }
      
      const result = await workflowEngine.executeWorkflow(workflowId, context);
      return createApiResponse({ result });
    }
    
    if (action === 'schedule') {
      const { workflowId, schedule } = config;
      
      if (!workflowId || !schedule) {
        return createApiError('Workflow ID and schedule are required', 'MISSING_PARAMETERS', 400);
      }
      
      workflowEngine.scheduleWorkflow(workflowId, schedule);
      return createApiResponse({ message: 'Workflow scheduled successfully' });
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'WORKFLOW_OPERATION_ERROR', 500);
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  try {
    const requestData = await req.json();
    const { action, workflowId, updates } = requestData;
    
    if (action === 'update' && workflowId) {
      const updatedWorkflow = workflowEngine.updateWorkflow(workflowId, updates);
      
      if (!updatedWorkflow) {
        return createApiError('Workflow not found', 'WORKFLOW_NOT_FOUND', 404);
      }
      
      return createApiResponse({ workflow: updatedWorkflow });
    }
    
    if (action === 'toggle' && workflowId) {
      const workflow = workflowEngine.getWorkflow(workflowId);
      
      if (!workflow) {
        return createApiError('Workflow not found', 'WORKFLOW_NOT_FOUND', 404);
      }
      
      const newStatus = workflow.enabled ? 'disabled' : 'enabled';
      const updatedWorkflow = workflowEngine.updateWorkflow(workflowId, { enabled: !workflow.enabled });
      
      return createApiResponse({ 
        workflow: updatedWorkflow,
        message: `Workflow ${newStatus} successfully`
      });
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'WORKFLOW_UPDATE_ERROR', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('id');
    
    if (!workflowId) {
      return createApiError('Workflow ID is required', 'MISSING_WORKFLOW_ID', 400);
    }
    
    const deleted = workflowEngine.deleteWorkflow(workflowId);
    
    if (!deleted) {
      return createApiError('Workflow not found', 'WORKFLOW_NOT_FOUND', 404);
    }
    
    return createApiResponse({ message: 'Workflow deleted successfully' });
    
  } catch (error: any) {
    return createApiError(error.message, 'WORKFLOW_DELETE_ERROR', 500);
  }
}