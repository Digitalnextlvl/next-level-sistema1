import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  role: string;
  email?: string;
  created_at: string;
  percentual_comissao?: number;
  meta_mensal?: number;
  telefone?: string;
  endereco?: string;
  avatar_url?: string;
}

export function useUsuarios() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['usuarios', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      if (user.role !== 'admin') {
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, role, percentual_comissao, meta_mensal, telefone, endereco, avatar_url, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar perfis', error);
        throw error;
      }
      
      return data as UserProfile[];
    },
    enabled: !!user,
  });
}

export function usePromoverUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, novoRole }: { userId: string; novoRole: 'admin' | 'vendedor' }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: novoRole })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuário atualizado',
        description: `Usuário ${variables.novoRole === 'admin' ? 'promovido para administrador' : 'rebaixado para vendedor'} com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAtualizarConfigUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      percentualComissao, 
      metaMensal 
    }: { 
      userId: string; 
      percentualComissao?: number; 
      metaMensal?: number; 
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          percentual_comissao: percentualComissao,
          meta_mensal: metaMensal
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações do usuário foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar configurações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoverUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, senha }: { userId: string; senha: string }) => {
      // Verificar se não está tentando remover a si mesmo
      if (currentUser?.id === userId) {
        throw new Error('Você não pode remover sua própria conta');
      }

      // Verificar senha
      if (senha !== 'cacazinho') {
        throw new Error('Senha incorreta');
      }

      // Remover perfil do usuário
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao remover usuário', error);
        throw new Error(`Falha ao remover usuário: ${error.message}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCriarUsuario() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      name, 
      role = 'vendedor',
      percentualComissao = 5.00,
      metaMensal = 10000.00
    }: { 
      email: string; 
      password: string; 
      name: string; 
      role?: 'admin' | 'vendedor';
      percentualComissao?: number;
      metaMensal?: number;
    }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Apenas administradores podem criar usuários');
      }

      // Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            percentual_comissao: percentualComissao,
            meta_mensal: metaMensal
          }
        }
      });

      if (authError) throw authError;
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuário criado',
        description: 'O novo usuário foi criado com sucesso. Um email de confirmação foi enviado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}