import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cnpj?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteWithVendedor extends Cliente {
  vendedor?: {
    name: string;
    role: string;
  };
}

export interface CreateClienteData {
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cnpj?: string;
}

export interface UpdateClienteData extends CreateClienteData {
  id: string;
}

export interface ClientesResponse {
  data: ClienteWithVendedor[];
  total: number;
  totalPages: number;
}

export function useClientes(searchTerm?: string, page: number = 1, limit: number = 25) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['clientes', user?.id, user?.role, searchTerm, page, limit],
    queryFn: async (): Promise<ClientesResponse> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Se for admin, busca todos os clientes com informações do vendedor
      if (user.role === 'admin') {
        // Primeiro buscar todos os clientes com count
        let query = supabase
          .from('clientes')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const { data: clientesData, error: clientesError, count } = await query;

        if (clientesError) throw clientesError;

        // Depois buscar os profiles para obter informações dos vendedores
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, role');

        if (profilesError) throw profilesError;

        // Criar um mapa de user_id para profile
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });

        let filteredData = clientesData?.map(cliente => ({
          ...cliente,
          vendedor: profilesMap.get(cliente.user_id) || {
            name: 'Vendedor não encontrado',
            role: 'vendedor'
          }
        })) || [];

        // Para admin, aplicar filtro de busca depois da paginação se necessário
        if (searchTerm && searchTerm.trim()) {
          // Refazer a query com filtro para obter contagem correta
          const searchQuery = supabase
            .from('clientes')
            .select('*', { count: 'exact' })
            .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          const { data: searchData, error: searchError, count: searchCount } = await searchQuery;
          
          if (searchError) throw searchError;

          filteredData = searchData?.map(cliente => ({
            ...cliente,
            vendedor: profilesMap.get(cliente.user_id) || {
              name: 'Vendedor não encontrado',
              role: 'vendedor'
            }
          })) || [];

          const total = searchCount || 0;
          const totalPages = Math.ceil(total / limit);

          return {
            data: filteredData as ClienteWithVendedor[],
            total,
            totalPages
          };
        }

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return {
          data: filteredData as ClienteWithVendedor[],
          total,
          totalPages
        };
      } else {
        // Se for vendedor, busca apenas seus próprios clientes
        let query = supabase
          .from('clientes')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (searchTerm && searchTerm.trim()) {
          query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`);
        }

        const { data, error, count } = await query;
        
        if (error) throw error;
        
        const total = count || 0;
        const totalPages = Math.ceil(total / limit);
        
        return {
          data: data as ClienteWithVendedor[],
          total,
          totalPages
        };
      }
    },
    enabled: !!user?.id,
  });
}

export function useCliente(clienteId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['cliente', clienteId, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!clienteId) throw new Error('Cliente ID is required');
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Cliente;
    },
    enabled: !!user?.id && !!clienteId,
  });
}

export function useCreateCliente() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clienteData: CreateClienteData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...clienteData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: "Cliente criado",
        description: "Cliente adicionado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...clienteData }: UpdateClienteData) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: "Cliente atualizado",
        description: "Informações do cliente atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clienteId: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}