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

    // Check if token needs refresh (same logic as calendar function)
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
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

    const url = new URL(req.url);
    const method = req.method;

    if (method === 'GET') {
      // Get task lists first
      const taskListsResponse = await fetch(
        'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!taskListsResponse.ok) {
        throw new Error('Failed to fetch task lists');
      }

      const taskListsData = await taskListsResponse.json();
      const allTasks = [];

      // Get tasks from each list
      for (const taskList of taskListsData.items || []) {
        const tasksResponse = await fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${taskList.id}/tasks`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          const tasksWithList = (tasksData.items || []).map((task: any) => ({
            ...task,
            listId: taskList.id,
            listTitle: taskList.title,
          }));
          allTasks.push(...tasksWithList);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        tasks: allTasks,
        taskLists: taskListsData.items || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (method === 'PATCH') {
      // Update task (mark as complete/incomplete)
      const { taskId, listId, status } = await req.json();
      
      const updateResponse = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await updateResponse.json();

      return new Response(JSON.stringify({
        success: true,
        task: updatedTask
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-tasks function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});