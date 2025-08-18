import { BannerCarousel } from "@/components/Dashboard/BannerCarousel";
import { GraficoVendas } from "@/components/Relatorios/GraficoVendas";
import { MetaProgress } from "@/components/Metas/MetaProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useLeads";
import { TrendingUp, Users, DollarSign, ShoppingCart, Loader2 } from "lucide-react";
const Index = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const dashboardStats = [
    {
      title: "Vendas do Mês",
      value: stats ? formatCurrency(stats.vendasMes) : "R$ 0,00",
      icon: DollarSign
    },
    {
      title: "Total de Clientes",
      value: stats ? stats.totalClientes.toString() : "0",
      icon: Users
    },
    {
      title: "Contratos Ativos",
      value: stats ? stats.contratosAtivos.toString() : "0",
      icon: ShoppingCart
    },
    {
      title: "Taxa de Conversão",
      value: stats ? `${stats.taxaConversao.toFixed(1)}%` : "0%",
      icon: TrendingUp
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <div className="space-y-8">
      {/* Logo centralizado */}
      

      {/* Carrossel de banners */}
      <BannerCarousel />

      {/* Progresso da Meta */}
      <MetaProgress />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map(stat => {
        const IconComponent = stat.icon;
        return <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>;
      })}
      </div>

      {/* Boas-vindas personalizada */}
      <Card className="gradient-premium-subtle shadow-premium">
        
        
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoVendas />
        
        <Card>
          <CardHeader>
            <CardTitle>Boas-vindas, {user?.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">🎯 Suas metas hoje</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Revisar {stats?.taxaConversao > 0 ? 'pipeline de leads' : 'primeiros leads'}</li>
                  <li>• Acompanhar vendas em andamento</li>
                  <li>• Verificar clientes para follow-up</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-2xl font-bold text-primary">{stats?.vendasMes ? formatCurrency(stats.vendasMes) : 'R$ 0'}</div>
                  <div className="text-xs text-muted-foreground">Vendas do Mês</div>
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{stats?.taxaConversao.toFixed(1) || '0'}%</div>
                  <div className="text-xs text-muted-foreground">Taxa de Conversão</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;