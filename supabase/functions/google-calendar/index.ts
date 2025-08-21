import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const method = req.method;
    console.log(`Request method: ${method}`);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Get user's Google tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        error: 'Google account not connected'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
      // Token expired, try to refresh
      if (!tokenData.refresh_token) {
        throw new Error('Access token expired and no refresh token available');
      }

      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update tokens in database
      const expiresAt = new Date(Date.now() + (refreshData.expires_in * 1000));
      await supabase
        .from('google_oauth_tokens')
        .update({
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Handle different HTTP methods
    if (method === 'GET') {
      // Get calendar events
      return await getCalendarEvents(accessToken);
    } else if (method === 'POST') {
      // Create calendar event
      const body = await req.json();
      return await createCalendarEvent(accessToken, body);
    } else if (method === 'PUT') {
      // Update calendar event
      const url = new URL(req.url);
      const eventId = url.searchParams.get('eventId');
      const body = await req.json();
      return await updateCalendarEvent(accessToken, eventId, body);
    } else if (method === 'DELETE') {
      // Delete calendar event
      const url = new URL(req.url);
      const eventId = url.searchParams.get('eventId');
      return await deleteCalendarEvent(accessToken, eventId);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper functions for calendar operations
async function getCalendarEvents(accessToken: string) {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + 1);

  const calendarResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${timeMin.toISOString()}&` +
    `timeMax=${timeMax.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!calendarResponse.ok) {
    const errorText = await calendarResponse.text();
    console.error('Calendar API error:', errorText);
    throw new Error(`Calendar API error: ${calendarResponse.status}`);
  }

  const calendarData = await calendarResponse.json();
  console.log(`Fetched ${calendarData.items?.length || 0} events`);

  return new Response(
    JSON.stringify({
      success: true,
      events: calendarData.items || [],
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function createCalendarEvent(accessToken: string, eventData: any) {
  console.log('Creating calendar event:', eventData);
  
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: eventData.titulo,
        description: eventData.descricao,
        start: {
          dateTime: eventData.data_inicio,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.data_fim,
          timeZone: 'America/Sao_Paulo',
        },
        location: eventData.local,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create event error:', errorText);
    throw new Error(`Failed to create event: ${response.status}`);
  }

  const createdEvent = await response.json();
  console.log('Event created successfully:', createdEvent.id);

  return new Response(
    JSON.stringify({
      success: true,
      event: createdEvent,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function updateCalendarEvent(accessToken: string, eventId: string | null, eventData: any) {
  if (!eventId) {
    throw new Error('Event ID is required for update');
  }

  console.log('Updating calendar event:', eventId, eventData);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: eventData.titulo,
        description: eventData.descricao,
        start: {
          dateTime: eventData.data_inicio,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.data_fim,
          timeZone: 'America/Sao_Paulo',
        },
        location: eventData.local,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update event error:', errorText);
    throw new Error(`Failed to update event: ${response.status}`);
  }

  const updatedEvent = await response.json();
  console.log('Event updated successfully:', updatedEvent.id);

  return new Response(
    JSON.stringify({
      success: true,
      event: updatedEvent,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function deleteCalendarEvent(accessToken: string, eventId: string | null) {
  if (!eventId) {
    throw new Error('Event ID is required for delete');
  }

  console.log('Deleting calendar event:', eventId);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete event error:', errorText);
    throw new Error(`Failed to delete event: ${response.status}`);
  }

  console.log('Event deleted successfully:', eventId);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Event deleted successfully',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}