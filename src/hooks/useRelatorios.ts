import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface RelatorioVendas {
  mes: string;
  vendas: number;
  valor: number;
}

export interface PerformanceVendedor {
  vendedor_id: string;
  nome: string;
  vendas: number;
  valor_total: number;
  comissoes: number;
  meta_atingida: boolean;
}

export function useRelatorioVendas(meses: number = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['relatorio-vendas', user?.id, meses],
    queryFn: async () => {
      if (!user) return [];

      const dados: RelatorioVendas[] = [];
      
      for (let i = 0; i < meses; i++) {
        const data = subMonths(new Date(), i);
        const inicio = startOfMonth(data);
        const fim = endOfMonth(data);
        
        const { data: vendas } = await supabase
          .from('vendas')
          .select('valor')
          .eq('user_id', user.id)
          .gte('data_venda', inicio.toISOString().split('T')[0])
          .lte('data_venda', fim.toISOString().split('T')[0]);

        const valorTotal = vendas?.reduce((acc, v) => acc + Number(v.valor), 0) || 0;
        
        dados.unshift({
          mes: format(data, 'MMM/yyyy'),
          vendas: vendas?.length || 0,
          valor: valorTotal,
        });
      }

      return dados;
    },
    enabled: !!user,
  });
}

export function usePerformanceVendedores() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['performance-vendedores', user?.id],
    queryFn: async () => {
      if (!user || user.role !== 'admin') return [];

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      // Buscar todos os vendedores
      const { data: vendedores } = await supabase
        .from('profiles')
        .select('user_id, name, meta_mensal, percentual_comissao')
        .eq('role', 'vendedor');

      if (!vendedores) return [];

      const performance: PerformanceVendedor[] = [];

      for (const vendedor of vendedores) {
        // Vendas do vendedor no mês
        const { data: vendas } = await supabase
          .from('vendas')
          .select('valor')
          .eq('user_id', vendedor.user_id)
          .gte('data_venda', currentMonth);

        // Comissões do vendedor
        const { data: comissoes } = await supabase
          .from('comissoes')
          .select('valor_comissao')
          .eq('vendedor_id', vendedor.user_id)
          .gte('mes_referencia', currentMonth);

        const valorTotal = vendas?.reduce((acc, v) => acc + Number(v.valor), 0) || 0;
        const totalComissoes = comissoes?.reduce((acc, c) => acc + Number(c.valor_comissao), 0) || 0;
        const metaAtingida = valorTotal >= Number(vendedor.meta_mensal || 0);

        performance.push({
          vendedor_id: vendedor.user_id,
          nome: vendedor.name || 'Vendedor',
          vendas: vendas?.length || 0,
          valor_total: valorTotal,
          comissoes: totalComissoes,
          meta_atingida: metaAtingida,
        });
      }

      return performance.sort((a, b) => b.valor_total - a.valor_total);
    },
    enabled: !!user && user.role === 'admin',
  });
}

export function useMetricasGerais() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['metricas-gerais', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const lastMonth = subMonths(new Date(), 1).toISOString().slice(0, 7) + '-01';

      // Métricas do mês atual
      const [vendasAtual, clientesAtual, leadsAtual, comissoesAtual] = await Promise.all([
        supabase.from('vendas').select('valor').eq('user_id', user.id).gte('data_venda', currentMonth),
        supabase.from('clientes').select('id').eq('user_id', user.id).gte('created_at', currentMonth),
        supabase.from('leads').select('status').eq('user_id', user.id).gte('created_at', currentMonth),
        supabase.from('comissoes').select('valor_comissao').eq(user.role === 'admin' ? 'user_id' : 'vendedor_id', user.id).gte('mes_referencia', currentMonth)
      ]);

      // Métricas do mês anterior
      const [vendasAnterior, clientesAnterior, leadsAnterior] = await Promise.all([
        supabase.from('vendas').select('valor').eq('user_id', user.id).gte('data_venda', lastMonth).lt('data_venda', currentMonth),
        supabase.from('clientes').select('id').eq('user_id', user.id).gte('created_at', lastMonth).lt('created_at', currentMonth),
        supabase.from('leads').select('status').eq('user_id', user.id).gte('created_at', lastMonth).lt('created_at', currentMonth)
      ]);

      const calcularVariacao = (atual: number, anterior: number) => {
        if (anterior === 0) return atual > 0 ? 100 : 0;
        return ((atual - anterior) / anterior) * 100;
      };

      const vendasValorAtual = vendasAtual.data?.reduce((acc, v) => acc + Number(v.valor), 0) || 0;
      const vendasValorAnterior = vendasAnterior.data?.reduce((acc, v) => acc + Number(v.valor), 0) || 0;
      
      const clientesCountAtual = clientesAtual.data?.length || 0;
      const clientesCountAnterior = clientesAnterior.data?.length || 0;

      const leadsConvertidosAtual = leadsAtual.data?.filter(l => l.status === 'cliente').length || 0;
      const leadsConvertidosAnterior = leadsAnterior.data?.filter(l => l.status === 'cliente').length || 0;
      const totalLeadsAtual = leadsAtual.data?.length || 0;
      const totalLeadsAnterior = leadsAnterior.data?.length || 0;

      const taxaConversaoAtual = totalLeadsAtual > 0 ? (leadsConvertidosAtual / totalLeadsAtual) * 100 : 0;
      const taxaConversaoAnterior = totalLeadsAnterior > 0 ? (leadsConvertidosAnterior / totalLeadsAnterior) * 100 : 0;

      const comissoesTotal = comissoesAtual.data?.reduce((acc, c) => acc + Number(c.valor_comissao), 0) || 0;

      return {
        vendas: {
          valor: vendasValorAtual,
          variacao: calcularVariacao(vendasValorAtual, vendasValorAnterior),
          count: vendasAtual.data?.length || 0
        },
        clientes: {
          total: clientesCountAtual,
          variacao: calcularVariacao(clientesCountAtual, clientesCountAnterior)
        },
        conversao: {
          taxa: taxaConversaoAtual,
          variacao: calcularVariacao(taxaConversaoAtual, taxaConversaoAnterior)
        },
        comissoes: {
          total: comissoesTotal
        }
      };
    },
    enabled: !!user,
  });
}