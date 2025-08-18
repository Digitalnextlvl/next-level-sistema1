import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadDialog } from "@/components/Leads/LeadDialog";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { 
  Users, 
  Filter, 
  Search, 
  Phone, 
  Mail, 
  Building2,
  Calendar,
  DollarSign,
  Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

const statusColors = {
  novo: 'default',
  contato: 'secondary',
  qualificado: 'outline',
  proposta: 'default',
  negociacao: 'secondary',
  cliente: 'default',
  perdido: 'destructive',
} as const;

const temperaturaEmojis = {
  frio: '🔵',
  morno: '🟡',
  quente: '🔴',
};

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTemperatura, setFiltroTemperatura] = useState<string>('todos');

  const leadsFiltrados = useMemo(() => {
    if (!leads) return [];
    
    return leads.filter((lead) => {
      const matchBusca = 
        lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
        lead.email.toLowerCase().includes(busca.toLowerCase()) ||
        lead.empresa?.toLowerCase().includes(busca.toLowerCase());
      
      const matchStatus = filtroStatus === 'todos' || lead.status === filtroStatus;
      const matchTemperatura = filtroTemperatura === 'todos' || lead.temperatura === filtroTemperatura;
      
      return matchBusca && matchStatus && matchTemperatura;
    });
  }, [leads, busca, filtroStatus, filtroTemperatura]);

  const estatisticas = useMemo(() => {
    if (!leads) return { total: 0, novos: 0, qualificados: 0, clientes: 0 };
    
    return {
      total: leads.length,
      novos: leads.filter(l => l.status === 'novo').length,
      qualificados: leads.filter(l => l.status === 'qualificado').length,
      clientes: leads.filter(l => l.status === 'cliente').length,
    };
  }, [leads]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads e oportunidades de negócio
          </p>
        </div>
        <LeadDialog mode="create" />
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estatisticas.novos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qualificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estatisticas.qualificados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Convertidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estatisticas.clientes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="contato">Em Contato</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="proposta">Proposta Enviada</SelectItem>
                <SelectItem value="negociacao">Negociação</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTemperatura} onValueChange={setFiltroTemperatura}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="frio">🔵 Frio</SelectItem>
                <SelectItem value="morno">🟡 Morno</SelectItem>
                <SelectItem value="quente">🔴 Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <div className="grid gap-4">
        {leadsFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum lead encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  {busca || filtroStatus !== 'todos' || filtroTemperatura !== 'todos'
                    ? 'Tente ajustar os filtros para encontrar leads.'
                    : 'Comece adicionando seu primeiro lead ao pipeline.'}
                </p>
                {!busca && filtroStatus === 'todos' && filtroTemperatura === 'todos' && (
                  <LeadDialog mode="create" />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          leadsFiltrados.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{lead.nome}</h3>
                      <Badge variant={statusColors[lead.status as keyof typeof statusColors]}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                      <span className="text-lg">
                        {temperaturaEmojis[lead.temperatura as keyof typeof temperaturaEmojis]}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                        {lead.telefone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {lead.telefone}
                          </div>
                        )}
                        {lead.empresa && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {lead.empresa}
                            {lead.cargo && ` - ${lead.cargo}`}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {lead.valor_estimado && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            R$ {Number(lead.valor_estimado).toLocaleString('pt-BR')}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Criado em {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                        </div>
                        {lead.data_proxima_acao && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Calendar className="h-4 w-4" />
                            Próxima ação: {format(new Date(lead.data_proxima_acao), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </div>
                    </div>

                    {lead.observacoes && (
                      <p className="text-sm text-muted-foreground mb-3 bg-muted/30 p-3 rounded">
                        {lead.observacoes}
                      </p>
                    )}
                    
                    {lead.proxima_acao && (
                      <p className="text-sm font-medium text-primary">
                        📋 {lead.proxima_acao}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <LeadDialog lead={lead} mode="edit" trigger={
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    } />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}