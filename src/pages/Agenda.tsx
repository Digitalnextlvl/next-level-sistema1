import { CalendarDays, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleConnect } from "@/components/Dashboard/GoogleConnect";
import { GoogleCalendarWidget } from "@/components/Dashboard/GoogleCalendarWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Agenda() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="w-6 h-6 text-primary" />
            Agenda
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua agenda e sincronize com o Google Calendar
          </p>
        </div>
      </div>

      {/* Tabs para organizar o conteúdo */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          {/* Widget do Google Calendar */}
          <GoogleCalendarWidget />
          
          {/* Informações adicionais sobre a agenda */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Sincronização automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Conecte sua conta Google para sincronizar automaticamente seus eventos e compromissos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Eventos em tempo real</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize seus eventos do Google Calendar diretamente no sistema, com atualizações em tempo real.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Integração com tarefas</h4>
                  <p className="text-sm text-muted-foreground">
                    Futuramente, você poderá criar tarefas automaticamente a partir dos seus eventos do calendário.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximas funcionalidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Criação de eventos</h4>
                  <p className="text-sm text-muted-foreground">
                    Criar eventos diretamente no Google Calendar a partir do sistema.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Lembretes inteligentes</h4>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações personalizadas sobre eventos importantes.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Análise de produtividade</h4>
                  <p className="text-sm text-muted-foreground">
                    Relatórios sobre como você usa seu tempo e sugestões de melhoria.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Configurações do Google */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integração Google</CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleConnect />
            </CardContent>
          </Card>

          {/* Configurações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferências de Sincronização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Status da Sincronização</h4>
                <p className="text-sm text-muted-foreground">
                  Configure como e quando seus dados devem ser sincronizados com o Google Calendar.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium text-sm">Frequência de Sync</h5>
                  <p className="text-xs text-muted-foreground mt-1">A cada 15 minutos</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium text-sm">Último Sync</h5>
                  <p className="text-xs text-muted-foreground mt-1">Conecte sua conta para sincronizar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ajuda e Suporte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajuda e Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Problemas de conexão?</h4>
                <p className="text-sm text-muted-foreground">
                  Se você está tendo problemas para conectar sua conta Google, verifique se:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Você tem permissões para acessar o Google Calendar</li>
                  <li>Sua conta Google permite aplicativos de terceiros</li>
                  <li>Você está usando um navegador atualizado</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}