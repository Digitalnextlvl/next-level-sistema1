import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  user_id: string;
  vendedor_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  origem: string;
  status: string;
  temperatura: string;
  valor_estimado?: number;
  observacoes?: string;
  data_contato: string;
  proxima_acao?: string;
  data_proxima_acao?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  origem?: string;
  temperatura?: string;
  valor_estimado?: number;
  observacoes?: string;
  proxima_acao?: string;
  data_proxima_acao?: string;
}

export function useLeads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useCreateLead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          ...data,
          user_id: user.id,
          vendedor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead criado com sucesso',
        description: 'O lead foi adicionado ao pipeline.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateLeadData & { status: string }> }) => {
      const { data: lead, error } = await supabase
        .from('leads')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useComissoes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['comissoes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('comissoes')
        .select(`
          *,
          vendas(valor, data_venda, status),
          profiles!comissoes_vendedor_id_fkey(name)
        `)
        .eq(user.role === 'admin' ? 'user_id' : 'vendedor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      // Buscar vendas do mês atual
      const { data: vendas } = await supabase
        .from('vendas')
        .select('valor, status')
        .eq('user_id', user.id)
        .gte('data_venda', currentMonth);

      // Buscar clientes totais
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user.id);

      // Buscar contratos ativos
      const { data: contratos } = await supabase
        .from('contratos')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'ativo');

      // Buscar leads para calcular conversão
      const { data: leads } = await supabase
        .from('leads')
        .select('status')
        .eq('user_id', user.id);

      const vendasMes = vendas?.reduce((acc, venda) => acc + Number(venda.valor), 0) || 0;
      const totalClientes = clientes?.length || 0;
      const contratosAtivos = contratos?.length || 0;
      const leadsConvertidos = leads?.filter(l => l.status === 'cliente').length || 0;
      const totalLeads = leads?.length || 0;
      const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

      return {
        vendasMes,
        totalClientes,
        contratosAtivos,
        taxaConversao,
      };
    },
    enabled: !!user,
  });
}