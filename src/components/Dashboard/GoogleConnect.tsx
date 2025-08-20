import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Calendar, Loader2, Link, Unlink } from 'lucide-react';

export const GoogleConnect = () => {
  const { 
    isConnecting, 
    isConnected, 
    connectGoogle, 
    disconnectGoogle,
    checkConnection 
  } = useGoogleAuth();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Integração Google
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div>
              <p className="font-medium">
                {isConnected ? 'Conta conectada' : 'Conta não conectada'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? 'Acesso ao Google Calendar ativo' 
                  : 'Conecte para sincronizar eventos do calendar'
                }
              </p>
            </div>
          </div>
          
          {isConnected ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={disconnectGoogle}
              className="flex items-center gap-2"
            >
              <Unlink className="h-4 w-4" />
              Desconectar
            </Button>
          ) : (
            <Button 
              onClick={connectGoogle}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link className="h-4 w-4" />
              )}
              Conectar Google
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Google Calendar</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};