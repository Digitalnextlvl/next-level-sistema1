import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGoogleAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .select('id')
        .single();
      
      setIsConnected(!!data && !error);
      return !!data && !error;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, []);

  const connectGoogle = useCallback(async () => {
    setIsConnecting(true);
    try {
      const GOOGLE_CLIENT_ID = '349816671114-l4r9sasdker6s7u81lj1seerdeq35m12.apps.googleusercontent.com'; // Replace with your actual Google Client ID
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      const scope = 'https://www.googleapis.com/auth/calendar.readonly';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Store redirect URL for later use
      localStorage.setItem('google_auth_redirect', window.location.pathname);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast.error('Erro ao conectar com Google');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectGoogle = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('google_oauth_tokens')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setIsConnected(false);
      toast.success('Conta Google desconectada com sucesso');
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      toast.error('Erro ao desconectar conta Google');
    }
  }, []);

  const handleAuthCallback = useCallback(async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { code, redirect_uri: redirectUri }
      });

      if (error) throw error;

      if (data?.success) {
        setIsConnected(true);
        toast.success('Conta Google conectada com sucesso!');
        
        // Redirect back to original page
        const originalPath = localStorage.getItem('google_auth_redirect') || '/dashboard';
        localStorage.removeItem('google_auth_redirect');
        window.location.href = originalPath;
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      toast.error('Erro ao processar autenticação Google');
    }
  }, []);

  return {
    isConnecting,
    isConnected,
    connectGoogle,
    disconnectGoogle,
    checkConnection,
    handleAuthCallback
  };
};