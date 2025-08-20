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
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    let code, redirect_uri;
    
    // Handle GET requests (callback from Google)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      code = url.searchParams.get('code');
      redirect_uri = url.searchParams.get('redirect_uri') || `${url.origin}/auth/google/callback`;
      console.log('GET request - code:', code ? 'present' : 'missing');
    } else {
      // Handle POST requests
      const body = await req.json();
      code = body.code;
      redirect_uri = body.redirect_uri;
      console.log('POST request - code:', code ? 'present' : 'missing');
    }
    
    if (!code) {
      throw new Error('No authorization code provided');
    }
    
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment variables:', {
      GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? 'present' : 'missing',
      GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ? 'present' : 'missing',
      SUPABASE_URL: SUPABASE_URL ? 'present' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing'
    });

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange authorization code for access token
    console.log('Attempting token exchange...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');
    
    // Get user info from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('User validation error:', userError);
      throw new Error('Invalid or expired token');
    }

    console.log('User validated:', user.id);

    // Calculate expires_at
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
    
    // Store or update tokens in database
    console.log('Storing tokens in database...');
    const { error: upsertError } = await supabase
      .from('google_oauth_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokenData.scope,
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to store tokens');
    }

    console.log('Tokens stored successfully');
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Google account connected successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-auth function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});