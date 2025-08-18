import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Contrato {
  id: string;
  numero_contrato: string;
  titulo: string;
  descricao?: string;
  valor: number;
  data_inicio: string;
  data_fim?: string;
  status: 'ativo' | 'suspenso' | 'cancelado' | 'finalizado';
  observacoes?: string;
  cliente_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Dados do cliente via join
  cliente?: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
}

export interface CreateContratoData {
  titulo: string;
  descricao?: string;
  valor: number;
  data_inicio: string;
  data_fim?: string;
  status: 'ativo' | 'suspenso' | 'cancelado' | 'finalizado';
  observacoes?: string;
  cliente_id: string;
}

export interface UpdateContratoData extends CreateContratoData {
  id: string;
}

export function useContratos(searchTerm?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contratos', user?.id, searchTerm],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      let query = supabase
        .from('contratos')
        .select(`
          *,
          cliente:clientes(id, nome, email, telefone)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchTerm && searchTerm.trim()) {
        query = query.or(`numero_contrato.ilike.%${searchTerm}%,titulo.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });
}

export function useContrato(contratoId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contrato', contratoId, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!contratoId) throw new Error('Contrato ID is required');
      
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          cliente:clientes(id, nome, email, telefone, cnpj, endereco),
          servicos:contrato_servicos(
            id,
            quantidade,
            valor_unitario,
            valor_total,
            servico:servicos(id, nome, descricao)
          )
        `)
        .eq('id', contratoId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!user?.id && !!contratoId,
  });
}

export function useCreateContrato() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contratoData: CreateContratoData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, get the client name to generate contract number
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('nome')
        .eq('id', contratoData.cliente_id)
        .single();

      if (clienteError) throw clienteError;

      // Generate contract number using the database function
      const { data: contractNumber, error: numberError } = await supabase
        .rpc('generate_contract_number', {
          client_id: contratoData.cliente_id,
          client_name: cliente.nome
        });

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('contratos')
        .insert({
          ...contratoData,
          numero_contrato: contractNumber,
          user_id: user.id,
        })
        .select(`
          *,
          cliente:clientes(id, nome, email, telefone)
        `)
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({
        title: "Contrato criado",
        description: "Contrato adicionado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContrato() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...contratoData }: UpdateContratoData) => {
      const { data, error } = await supabase
        .from('contratos')
        .update(contratoData)
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(id, nome, email, telefone)
        `)
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({
        title: "Contrato atualizado",
        description: "Informações do contrato atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContrato() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', contratoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({
        title: "Contrato removido",
        description: "Contrato removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}