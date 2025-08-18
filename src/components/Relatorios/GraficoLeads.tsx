import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLeads } from "@/hooks/useLeads";
import { Loader2 } from "lucide-react";

const STATUS_COLORS = {
  novo: 'hsl(var(--primary))',
  contato: 'hsl(var(--secondary))',
  qualificado: 'hsl(240 100% 70%)',
  proposta: 'hsl(30 100% 60%)',
  negociacao: 'hsl(60 100% 50%)',
  cliente: 'hsl(120 100% 40%)',
  perdido: 'hsl(var(--destructive))',
};

export function GraficoLeads() {
  const { data: leads, isLoading } = useLeads();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const dadosStatus = leads?.reduce((acc, lead) => {
    const status = lead.status;
    const statusExistente = acc.find(item => item.status === status);
    
    if (statusExistente) {
      statusExistente.quantidade += 1;
    } else {
      acc.push({
        status,
        quantidade: 1,
        label: getStatusLabel(status)
      });
    }
    
    return acc;
  }, [] as Array<{ status: string; quantidade: number; label: string }>) || [];

  const dadosTemperatura = leads?.reduce((acc, lead) => {
    const temp = lead.temperatura || 'frio';
    const tempExistente = acc.find(item => item.temperatura === temp);
    
    if (tempExistente) {
      tempExistente.quantidade += 1;
    } else {
      acc.push({
        temperatura: temp,
        quantidade: 1,
        label: temp.charAt(0).toUpperCase() + temp.slice(1)
      });
    }
    
    return acc;
  }, [] as Array<{ temperatura: string; quantidade: number; label: string }>) || [];

  const taxaConversao = leads && leads.length > 0 
    ? ((leads.filter(lead => lead.status === 'cliente').length / leads.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leads por Status</CardTitle>
          <div className="text-sm text-muted-foreground">
            Taxa de conversão: <span className="font-bold text-primary">{taxaConversao}%</span>
          </div>
        </CardHeader>
        <CardContent>
          {dadosStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum lead encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Temperatura dos Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {dadosTemperatura.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosTemperatura}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="quantidade"
                  label={({ label, value }) => `${label}: ${value}`}
                >
                  {dadosTemperatura.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getTemperaturaColor(entry.temperatura)} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum lead encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    novo: 'Novo',
    contato: 'Contato',
    qualificado: 'Qualificado',
    proposta: 'Proposta',
    negociacao: 'Negociação',
    cliente: 'Cliente',
    perdido: 'Perdido',
  };
  return labels[status] || status;
}

function getTemperaturaColor(temperatura: string): string {
  const colors: Record<string, string> = {
    frio: 'hsl(240 100% 70%)',
    morno: 'hsl(30 100% 60%)',
    quente: 'hsl(0 100% 60%)',
  };
  return colors[temperatura] || 'hsl(var(--primary))';
}