import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createApiError } from '../api-gateway/route';
import { Client } from '@microsoft/microsoft-graph-client';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Microsoft Graph Integration Manager
class MicrosoftGraphConnector {
  private client: Client | null = null;
  
  constructor() {
    // Initialize with mock configuration
    // In production, this would use proper OAuth2 flow
  }
  
  // Set access token
  setAccessToken(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }
  
  // Get user's calendar events for trading schedules
  async getCalendarEvents(startDate: Date, endDate: Date) {
    try {
      if (!this.client) throw new Error('Graph client not initialized');
      
      const events = await this.client
        .api('/me/calendar/events')
        .select('id,subject,body,start,end,location,attendees,recurrence')
        .filter(`start/dateTime ge '${startDate.toISOString()}' and end/dateTime le '${endDate.toISOString()}'`)
        .get();
      
      return events.value?.map(event => ({
        id: event.id,
        title: event.subject,
        description: event.body?.content || '',
        start: event.start?.dateTime,
        end: event.end?.dateTime,
        location: event.location?.displayName,
        attendees: event.attendees?.map((attendee: any) => ({
          email: attendee.emailAddress?.address,
          name: attendee.emailAddress?.name,
          status: attendee.status?.response
        })) || [],
        recurrence: event.recurrence
      })) || [];
      
    } catch (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
  }
  
  // Create trading event in Outlook calendar
  async createTradingEvent(event: {
    title: string;
    description: string;
    start: Date;
    end: Date;
    attendees?: string[];
    location?: string;
  }) {
    try {
      if (!this.client) throw new Error('Graph client not initialized');
      
      const newEvent = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description
        },
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'UTC'
        },
        location: {
          displayName: event.location || 'Virtual Meeting'
        },
        attendees: (event.attendees || []).map(email => ({
          emailAddress: {
            address: email,
            name: email
          },
          type: 'required'
        })),
        reminderMinutesBeforeStart: 60,
        isReminderOn: true
      };
      
      const response = await this.client
        .api('/me/calendar/events')
        .post(newEvent);
      
      return {
        id: response.id,
        title: response.subject,
        start: response.start?.dateTime,
        end: response.end?.dateTime,
        attendees: response.attendees?.length || 0,
        webLink: response.webLink
      };
      
    } catch (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }
  
  // Get Teams meetings for trading sessions
  async getTeamsMeetings() {
    try {
      if (!this.client) throw new Error('Graph client not initialized');
      
      const meetings = await this.client
        .api('/me/events')
        .select('id,subject,start,end,onlineMeeting')
        .filter('onlineMeeting ne null')
        .get();
      
      return meetings.value?.map(meeting => ({
        id: meeting.id,
        title: meeting.subject,
        start: meeting.start?.dateTime,
        end: meeting.end?.dateTime,
        joinUrl: meeting.onlineMeeting?.joinUrl,
        conferenceId: meeting.onlineMeeting?.conferenceId
      })) || [];
      
    } catch (error) {
      throw new Error(`Failed to fetch Teams meetings: ${error.message}`);
    }
  }
  
  // Create Teams meeting for trading session
  async createTeamsMeeting(event: {
    title: string;
    description: string;
    start: Date;
    end: Date;
    attendees?: string[];
  }) {
    try {
      if (!this.client) throw new Error('Graph client not initialized');
      
      const teamsEvent = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description
        },
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'UTC'
        },
        attendees: (event.attendees || []).map(email => ({
          emailAddress: {
            address: email,
            name: email
          },
          type: 'required'
        })),
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
      };
      
      const response = await this.client
        .api('/me/events')
        .post(teamsEvent);
      
      return {
        id: response.id,
        title: response.subject,
        start: response.start?.dateTime,
        end: response.end?.dateTime,
        joinUrl: response.onlineMeeting?.joinUrl,
        conferenceId: response.onlineMeeting?.conferenceId,
        attendees: response.attendees?.length || 0
      };
      
    } catch (error) {
      throw new Error(`Failed to create Teams meeting: ${error.message}`);
    }
  }
  
  // Get organization users for team management
  async getOrganizationUsers() {
    try {
      if (!this.client) throw new Error('Graph client not initialized');
      
      const users = await this.client
        .api('/users')
        .select('id,displayName,mail,jobTitle,department,officeLocation')
        .filter('accountEnabled eq true')
        .get();
      
      return users.value?.map(user => ({
        id: user.id,
        name: user.displayName,
        email: user.mail,
        title: user.jobTitle,
        department: user.department,
        location: user.officeLocation
      })) || [];
      
    } catch (error) {
      throw new Error(`Failed to fetch organization users: ${error.message}`);
    }
  }
  
  // Send Teams message
  async sendTeamsMessage(message: {
    content: string;
    channelId: string;
    teamId: string;
  }) {
    try {
      if (!this.client) throw new Error('Graph client not initialized');
      
      const chatMessage = {
        body: {
          content: message.content
        }
      };
      
      const response = await this.client
        .api(`/teams/${message.teamId}/channels/${message.channelId}/messages`)
        .post(chatMessage);
      
      return {
        id: response.id,
        content: response.body?.content,
        createdDateTime: response.createdDateTime
      };
      
    } catch (error) {
      throw new Error(`Failed to send Teams message: ${error.message}`);
    }
  }
}

// Initialize Microsoft Graph connector
const graphConnector = new MicrosoftGraphConnector();

// Mock access token for development
const mockAccessToken = 'mock_access_token_12345';

// Microsoft Graph API endpoints
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const accessToken = searchParams.get('accessToken') || mockAccessToken;
  
  // Set access token
  graphConnector.setAccessToken(accessToken);
  
  if (action === 'events') {
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date();
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    try {
      const events = await graphConnector.getCalendarEvents(startDate, endDate);
      return createApiResponse({ events });
    } catch (error: any) {
      return createApiError(error.message, 'MICROSOFT_GRAPH_ERROR', 500);
    }
  }
  
  if (action === 'teams-meetings') {
    try {
      const meetings = await graphConnector.getTeamsMeetings();
      return createApiResponse({ meetings });
    } catch (error: any) {
      return createApiError(error.message, 'MICROSOFT_GRAPH_ERROR', 500);
    }
  }
  
  if (action === 'users') {
    try {
      const users = await graphConnector.getOrganizationUsers();
      return createApiResponse({ users });
    } catch (error: any) {
      return createApiError(error.message, 'MICROSOFT_GRAPH_ERROR', 500);
    }
  }
  
  return createApiError('Invalid action', 'INVALID_ACTION', 400);
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
    const { action, event, message, accessToken = mockAccessToken } = requestData;
    
    // Set access token for API calls
    graphConnector.setAccessToken(accessToken);
    
    if (action === 'create-event') {
      if (!event?.title || !event?.start || !event?.end) {
        return createApiError('Missing required fields: title, start, end', 'MISSING_FIELDS', 400);
      }
      
      const tradingEvent = await graphConnector.createTradingEvent({
        title: event.title,
        description: event.description || `Trading session - ${event.title}`,
        start: new Date(event.start),
        end: new Date(event.end),
        attendees: event.attendees || [],
        location: event.location
      });
      
      return createApiResponse({ event: tradingEvent }, 201);
    }
    
    if (action === 'create-teams-meeting') {
      if (!event?.title || !event?.start || !event?.end) {
        return createApiError('Missing required fields: title, start, end', 'MISSING_FIELDS', 400);
      }
      
      const teamsMeeting = await graphConnector.createTeamsMeeting({
        title: event.title,
        description: event.description || `Trading session - ${event.title}`,
        start: new Date(event.start),
        end: new Date(event.end),
        attendees: event.attendees || []
      });
      
      return createApiResponse({ meeting: teamsMeeting }, 201);
    }
    
    if (action === 'send-message') {
      if (!message?.content || !message?.channelId || !message?.teamId) {
        return createApiError('Missing required fields: content, channelId, teamId', 'MISSING_FIELDS', 400);
      }
      
      const sentMessage = await graphConnector.sendTeamsMessage({
        content: message.content,
        channelId: message.channelId,
        teamId: message.teamId
      });
      
      return createApiResponse({ message: sentMessage }, 201);
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'MICROSOFT_INTEGRATION_ERROR', 500);
  }
}