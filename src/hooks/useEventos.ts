import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Evento {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  local?: string;
  google_event_id?: string;
  tipo: 'local' | 'google';
  cor: string;
  created_at: string;
  updated_at: string;
}

export interface EventoInput {
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  local?: string;
  cor?: string;
}

export const useEventos = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchEventos = useCallback(async (): Promise<Evento[]> => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return (data || []).map(evento => ({
        ...evento,
        tipo: evento.tipo as 'local' | 'google'
      }));
    } catch (error: any) {
      console.error('Error fetching eventos:', error);
      toast.error('Erro ao carregar eventos locais');
      return [];
    }
  }, []);

  const createEvento = useCallback(async (evento: EventoInput): Promise<Evento | null> => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('eventos')
        .insert({
          user_id: user.user.id,
          titulo: evento.titulo,
          descricao: evento.descricao,
          data_inicio: evento.data_inicio,
          data_fim: evento.data_fim,
          local: evento.local,
          cor: evento.cor || '#3B82F6',
          tipo: 'local'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Evento criado com sucesso!');
      return {
        ...data,
        tipo: data.tipo as 'local' | 'google'
      };
    } catch (error: any) {
      console.error('Error creating evento:', error);
      toast.error('Erro ao criar evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEvento = useCallback(async (id: string, updates: Partial<EventoInput>): Promise<Evento | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Evento atualizado com sucesso!');
      return {
        ...data,
        tipo: data.tipo as 'local' | 'google'
      };
    } catch (error: any) {
      console.error('Error updating evento:', error);
      toast.error('Erro ao atualizar evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEvento = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Evento excluído com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting evento:', error);
      toast.error('Erro ao excluir evento');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncWithGoogle = useCallback(async (evento: Evento, action: 'create' | 'update' | 'delete') => {
    try {
      if (action === 'create') {
        const { data, error } = await supabase.functions.invoke('google-calendar', {
          body: {
            titulo: evento.titulo,
            descricao: evento.descricao,
            data_inicio: evento.data_inicio,
            data_fim: evento.data_fim,
            local: evento.local
          }
        });

        if (error) throw error;
        
        if (data?.success && data.event?.id) {
          // Update local event with Google event ID
          await supabase
            .from('eventos')
            .update({ google_event_id: data.event.id })
            .eq('id', evento.id);
            
          toast.success('Evento sincronizado com Google Calendar!');
        }
      } else if (action === 'update' && evento.google_event_id) {
        const { data, error } = await supabase.functions.invoke('google-calendar', {
          body: {
            titulo: evento.titulo,
            descricao: evento.descricao,
            data_inicio: evento.data_inicio,
            data_fim: evento.data_fim,
            local: evento.local
          }
        });

        if (error) throw error;
        if (data?.success) {
          toast.success('Evento atualizado no Google Calendar!');
        }
      } else if (action === 'delete' && evento.google_event_id) {
        const { data, error } = await supabase.functions.invoke('google-calendar', {
          body: {},
        });

        if (error) throw error;
        if (data?.success) {
          toast.success('Evento removido do Google Calendar!');
        }
      }
    } catch (error: any) {
      console.error('Error syncing with Google:', error);
      toast.error('Erro ao sincronizar com Google Calendar');
    }
  }, []);

  return {
    isLoading,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    syncWithGoogle
  };
};