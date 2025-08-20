import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Loader2 } from 'lucide-react';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback } = useGoogleAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/dashboard?auth_error=true');
      return;
    }

    if (code) {
      handleAuthCallback(code);
    } else {
      navigate('/dashboard');
    }
  }, [searchParams, navigate, handleAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Processando autenticação Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;