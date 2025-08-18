import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, FileText, Download, Filter, Calendar, Users, DollarSign, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GraficoVendas } from "@/components/Relatorios/GraficoVendas";
import { useMetricasGerais, usePerformanceVendedores } from "@/hooks/useRelatorios";
import { useAuth } from "@/contexts/AuthContext";

export default function Relatorios() {
  const { user } = useAuth();
  const { data: metricas, isLoading: loadingMetricas } = useMetricasGerais();
  const { data: performance, isLoading: loadingPerformance } = usePerformanceVendedores();

  const relatorios = [
    {
      title: "Vendas por Período",
      description: "Análise detalhada das vendas por mês/trimestre",
      tipo: "Vendas",
      ultimaAtualizacao: "Hoje",
      icon: BarChart3,
    },
    {
      title: "Performance de Vendedores",
      description: "Ranking e métricas de performance individual",
      tipo: "RH",
      ultimaAtualizacao: "Ontem",
      icon: PieChart,
    },
    {
      title: "Clientes por Segmento",
      description: "Distribuição e análise do portfólio de clientes",
      tipo: "Clientes",
      ultimaAtualizacao: "2 dias atrás",
      icon: FileText,
    },
    {
      title: "Receitas vs Despesas",
      description: "Comparativo financeiro mensal e anual",
      tipo: "Financeiro",
      ultimaAtualizacao: "Hoje",
      icon: BarChart3,
    },
  ];

  const metricasCards = metricas ? [
    {
      label: "Vendas do Mês",
      valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.vendas.valor),
      variacao: `${metricas.vendas.variacao > 0 ? '+' : ''}${metricas.vendas.variacao.toFixed(1)}%`,
      periodo: "vs mês anterior",
      count: metricas.vendas.count,
    },
    {
      label: "Novos Clientes",
      valor: metricas.clientes.total.toString(),
      variacao: `${metricas.clientes.variacao > 0 ? '+' : ''}${metricas.clientes.variacao.toFixed(1)}%`,
      periodo: "vs mês anterior",
    },
    {
      label: "Taxa de Conversão",
      valor: `${metricas.conversao.taxa.toFixed(1)}%`,
      variacao: `${metricas.conversao.variacao > 0 ? '+' : ''}${metricas.conversao.variacao.toFixed(1)}%`,
      periodo: "vs mês anterior",
    },
    {
      label: "Comissões",
      valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.comissoes.total),
      variacao: "Pendentes",
      periodo: "Este mês",
    },
  ] : [];

  if (loadingMetricas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Analytics e relatórios do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricasCards.map((metrica) => (
          <Card key={metrica.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metrica.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrica.valor}</div>
              <div className="flex items-center text-xs">
                <Badge variant={metrica.variacao.includes('+') ? 'default' : 'secondary'} className="mr-1">
                  {metrica.variacao}
                </Badge>
                <span className="text-muted-foreground">{metrica.periodo}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Vendas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GraficoVendas />
        
        {/* Performance de Vendedores - Apenas para Admin */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Performance de Vendedores</CardTitle>
              <CardDescription>Ranking do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPerformance ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {performance?.slice(0, 5).map((vendedor, index) => (
                    <div key={vendedor.vendedor_id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{vendedor.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {vendedor.vendas} vendas • {vendedor.meta_atingida ? '✅' : '❌'} Meta
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendedor.valor_total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendedor.comissoes)} comissão
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!performance || performance.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum dado de performance disponível
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>
            Selecione um relatório para visualizar ou baixar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {relatorios.map((relatorio) => (
              <Card key={relatorio.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <relatorio.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{relatorio.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {relatorio.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{relatorio.tipo}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Atualizado: {relatorio.ultimaAtualizacao}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Personalizados */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Relatório Personalizado</CardTitle>
          <CardDescription>
            Configure um relatório customizado com suas métricas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Vendas
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <PieChart className="h-6 w-6 mb-2" />
              Financeiro
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Operacional
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}