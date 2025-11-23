import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createApiError } from '../api-gateway/route';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

// Google Workspace Integration Manager
class GoogleWorkspaceConnector {
  private auth: any;
  
  constructor(credentials: { clientId: string; clientSecret: string; redirectUri: string }) {
    this.auth = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );
  }
  
  // Generate Google OAuth URL
  generateAuthUrl(scopes: string[] = ['https://www.googleapis.com/auth/calendar.readonly']): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }
  
  // Exchange authorization code for tokens
  async getTokens(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }
  
  // Set tokens for API calls
  setTokens(tokens: any) {
    this.auth.setCredentials(tokens);
  }
  
  // Get calendar events for energy trading schedules
  async getCalendarEvents(timeMin: Date, timeMax: Date) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.auth });
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250
      });
      
      return response.data.items?.map(event => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location,
        attendees: event.attendees?.map(a => ({
          email: a.email,
          name: a.displayName,
          status: a.responseStatus
        })) || [],
        recurrence: event.recurrence
      })) || [];
      
    } catch (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
  }
  
  // Create trading schedule event
  async createTradingEvent(event: {
    title: string;
    description: string;
    start: Date;
    end: Date;
    attendees?: string[];
    location?: string;
  }) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.auth });
      
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: 'UTC'
          },
          attendees: event.attendees?.map(email => ({ email })) || [],
          location: event.location,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 } // 1 hour before
            ]
          }
        }
      });
      
      return {
        id: response.data.id,
        title: response.data.summary,
        start: response.data.start?.dateTime,
        end: response.data.end?.dateTime,
        attendees: response.data.attendees?.length || 0
      };
      
    } catch (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }
  
  // Get team directory
  async getTeamDirectory() {
    try {
      const directory = google.admin({ version: 'directory_v1', auth: this.auth });
      
      const response = await directory.users.list({
        domain: 'optibid.com',
        maxResults: 500,
        orderBy: 'email'
      });
      
      return response.data.users?.map(user => ({
        id: user.id,
        email: user.primaryEmail,
        name: user.name?.fullName,
        givenName: user.name?.givenName,
        familyName: user.name?.familyName,
        department: user.organizations?.[0]?.department,
        jobTitle: user.organizations?.[0]?.title,
        status: user.suspended ? 'suspended' : 'active'
      })) || [];
      
    } catch (error) {
      throw new Error(`Failed to fetch team directory: ${error.message}`);
    }
  }
}

// Mock credentials (in production, these would be stored securely)
const googleCredentials = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google/callback'
};

// Initialize connector
const googleConnector = new GoogleWorkspaceConnector(googleCredentials);

// Google Workspace API endpoints

// Get authentication URL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const scopes = searchParams.get('scopes')?.split(',') || [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
  ];
  
  if (action === 'auth-url') {
    const authUrl = googleConnector.generateAuthUrl(scopes);
    return createApiResponse({ authUrl });
  }
  
  if (action === 'events') {
    const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin')!) : new Date();
    const timeMax = searchParams.get('timeMax') ? new Date(searchParams.get('timeMax')!) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    try {
      const events = await googleConnector.getCalendarEvents(timeMin, timeMax);
      return createApiResponse({ events });
    } catch (error: any) {
      return createApiError(error.message, 'GOOGLE_API_ERROR', 500);
    }
  }
  
  if (action === 'team') {
    try {
      const team = await googleConnector.getTeamDirectory();
      return createApiResponse({ team });
    } catch (error: any) {
      return createApiError(error.message, 'GOOGLE_API_ERROR', 500);
    }
  }
  
  return createApiError('Invalid action', 'INVALID_ACTION', 400);
}

// Create calendar event
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const requestData = await req.json();
    const { action, event, tokens } = requestData;
    
    if (action === 'create-event') {
      if (!event?.title || !event?.start || !event?.end) {
        return createApiError('Missing required fields: title, start, end', 'MISSING_FIELDS', 400);
      }
      
      if (tokens) {
        googleConnector.setTokens(tokens);
      }
      
      const tradingEvent = await googleConnector.createTradingEvent({
        title: event.title,
        description: event.description || `Trading session - ${event.title}`,
        start: new Date(event.start),
        end: new Date(event.end),
        attendees: event.attendees || [],
        location: event.location
      });
      
      return createApiResponse({ event: tradingEvent }, 201);
    }
    
    if (action === 'exchange-token') {
      const { code } = requestData;
      
      if (!code) {
        return createApiError('Authorization code is required', 'MISSING_CODE', 400);
      }
      
      const tokens = await googleConnector.getTokens(code);
      return createApiResponse({ tokens });
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'GOOGLE_INTEGRATION_ERROR', 500);
  }
}