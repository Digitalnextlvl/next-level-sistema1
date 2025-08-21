import { BannerCarousel } from "@/components/Dashboard/BannerCarousel";
import { MetaProgress } from "@/components/Metas/MetaProgress";
import { GoogleConnect } from "@/components/Dashboard/GoogleConnect";
import { GoogleCalendarWidget } from "@/components/Dashboard/GoogleCalendarWidget";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardStats.map(stat => {
        const IconComponent = stat.icon;
        return <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide leading-tight">{stat.title}</CardTitle>
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>;
      })}
      </div>

      {/* Integração Google */}
      <GoogleConnect />

      {/* Google Calendar - Agora com melhor destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <GoogleCalendarWidget />
        
        {/* Espaço para futuros widgets */}
        <div className="hidden lg:block">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Em breve, mais widgets úteis
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Index;