import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  database: 'ok' | 'error' | 'checking';
  auth: 'ok' | 'error' | 'checking';
  storage: 'ok' | 'error' | 'checking';
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    database: 'checking',
    auth: 'checking',
    storage: 'checking',
  });

  const checkHealth = async () => {
    setStatus({
      database: 'checking',
      auth: 'checking', 
      storage: 'checking',
    });

    // Test database connection
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      setStatus(prev => ({ 
        ...prev, 
        database: error ? 'error' : 'ok' 
      }));
    } catch {
      setStatus(prev => ({ ...prev, database: 'error' }));
    }

    // Test auth
    try {
      const { data } = await supabase.auth.getSession();
      setStatus(prev => ({ 
        ...prev, 
        auth: 'ok'
      }));
    } catch {
      setStatus(prev => ({ ...prev, auth: 'error' }));
    }

    // Test storage
    try {
      const { data } = await supabase.storage.listBuckets();
      setStatus(prev => ({ 
        ...prev, 
        storage: data ? 'ok' : 'error' 
      }));
    } catch {
      setStatus(prev => ({ ...prev, storage: 'error' }));
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Sistema - Verificação de Saúde</CardTitle>
          <CardDescription>
            Verificação do status dos componentes do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <span>Banco de Dados</span>
            {getIcon(status.database)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <span>Autenticação</span>
            {getIcon(status.auth)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <span>Armazenamento</span>
            {getIcon(status.storage)}
          </div>

          <Button onClick={checkHealth} className="w-full">
            Verificar Novamente
          </Button>

          <div className="text-sm text-muted-foreground">
            Versão do Sistema: {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}