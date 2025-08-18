import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DashboardImage {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  url_imagem: string;
  ordem: number;
  ativo: boolean;
  tipo: string;
  created_at: string;
  updated_at: string;
}

export interface CreateImageData {
  titulo: string;
  descricao?: string;
  url_imagem: string;
  ordem?: number;
  tipo?: string;
}

export function useDashboardImages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-images-public'],
    queryFn: async () => {
      // Buscar todas as imagens ativas de qualquer admin para exibir no dashboard
      const { data, error } = await supabase
        .from('dashboard_images')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as DashboardImage[];
    },
    enabled: !!user,
  });
}

export function useAllDashboardImages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-dashboard-images-admin'],
    queryFn: async () => {
      if (!user || user.role !== 'admin') return [];

      // Admin vê todas as imagens (ativas e inativas) para gerenciar
      const { data, error } = await supabase
        .from('dashboard_images')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as DashboardImage[];
    },
    enabled: !!user && user.role === 'admin',
  });
}

export function useUploadImage() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Apenas administradores podem fazer upload de imagens');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dashboard-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('dashboard-images')
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    },
    onError: (error) => {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateDashboardImage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateImageData) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Apenas administradores podem criar imagens');
      }

      const { data: image, error } = await supabase
        .from('dashboard_images')
        .insert({
          titulo: data.titulo,
          url_imagem: data.url_imagem,
          ordem: data.ordem || 0,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return image;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-images-public'] });
      queryClient.invalidateQueries({ queryKey: ['all-dashboard-images-admin'] });
      toast({
        title: 'Imagem adicionada',
        description: 'A imagem foi adicionada ao dashboard com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar imagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateDashboardImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateImageData & { ativo: boolean }> }) => {
      const { data: image, error } = await supabase
        .from('dashboard_images')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return image;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-images-public'] });
      queryClient.invalidateQueries({ queryKey: ['all-dashboard-images-admin'] });
      toast({
        title: 'Imagem atualizada',
        description: 'A imagem foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar imagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteDashboardImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dashboard_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-images-public'] });
      queryClient.invalidateQueries({ queryKey: ['all-dashboard-images-admin'] });
      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida do dashboard.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover imagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}