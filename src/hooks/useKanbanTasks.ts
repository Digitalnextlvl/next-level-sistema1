import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ColunaKanban, Tarefa } from "./useProjetos";

export const useKanbanTasks = (projetoId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: colunas = [], isLoading: isLoadingColunas } = useQuery({
    queryKey: ["colunas", projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colunas_kanban")
        .select("*")
        .eq("projeto_id", projetoId!)
        .order("posicao");

      if (error) throw error;
      return data as ColunaKanban[];
    },
    enabled: !!user && !!projetoId,
  });

  const { data: tarefas = [], isLoading: isLoadingTarefas } = useQuery({
    queryKey: ["tarefas", projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select(`
          *,
          tarefa_responsaveis (
            user_id,
            profiles (name, avatar_url)
          )
        `)
        .eq("projeto_id", projetoId!)
        .order("posicao");
        
      if (error) throw error;
      
      // Transform the data to include responsaveis
      return data?.map(tarefa => ({
        ...tarefa,
        responsaveis: tarefa.tarefa_responsaveis?.map((tr: any) => ({
          user_id: tr.user_id,
          name: tr.profiles?.name,
          avatar_url: tr.profiles?.avatar_url,
        })) || []
      })) || [];
    },
    enabled: !!user && !!projetoId,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createTarefa = useMutation({
    mutationFn: async (tarefa: Omit<Tarefa, "id" | "user_id" | "created_at" | "updated_at" | "posicao"> & { responsavelIds?: string[] }) => {
      // Get the current highest position in the column
      const { data: existingTasks } = await supabase
        .from("tarefas")
        .select("posicao")
        .eq("coluna_id", tarefa.coluna_id)
        .order("posicao", { ascending: false })
        .limit(1);

      const nextPosition = (existingTasks?.[0]?.posicao || 0) + 1;

      const { responsavelIds, ...tarefaData } = tarefa;

      const { data, error } = await supabase
        .from("tarefas")
        .insert({
          ...tarefaData,
          user_id: user?.id,
          posicao: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert responsaveis if provided
      if (responsavelIds && responsavelIds.length > 0) {
        const responsaveisData = responsavelIds.map(userId => ({
          tarefa_id: data.id,
          user_id: userId,
        }));

        const { error: responsaveisError } = await supabase
          .from("tarefa_responsaveis")
          .insert(responsaveisData);

        if (responsaveisError) throw responsaveisError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas", projetoId] });
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });
    },
  });

  const updateTarefa = useMutation({
    mutationFn: async (tarefa: Partial<Tarefa> & { id: string; responsavelIds?: string[] }) => {
      const { responsavelIds, ...tarefaData } = tarefa;

      const { data, error } = await supabase
        .from("tarefas")
        .update(tarefaData)
        .eq("id", tarefa.id)
        .select()
        .single();

      if (error) throw error;

      // Update responsaveis if provided
      if (responsavelIds !== undefined) {
        // Remove existing responsaveis
        await supabase
          .from("tarefa_responsaveis")
          .delete()
          .eq("tarefa_id", tarefa.id);

        // Insert new responsaveis
        if (responsavelIds.length > 0) {
          const responsaveisData = responsavelIds.map(userId => ({
            tarefa_id: tarefa.id,
            user_id: userId,
          }));

          const { error: responsaveisError } = await supabase
            .from("tarefa_responsaveis")
            .insert(responsaveisData);

          if (responsaveisError) throw responsaveisError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas", projetoId] });
    },
  });

  const updateTaskPosition = useMutation({
    mutationFn: async ({ 
      taskId, 
      newColumnId, 
      newPosition 
    }: { 
      taskId: string; 
      newColumnId: string; 
      newPosition: number; 
    }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ 
          coluna_id: newColumnId, 
          posicao: newPosition 
        })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas", projetoId] });
    },
  });

  const deleteTarefa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tarefas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas", projetoId] });
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    },
  });

  return {
    colunas,
    tarefas,
    usuarios,
    isLoadingColunas,
    isLoadingTarefas,
    createTarefa,
    updateTarefa,
    updateTaskPosition,
    deleteTarefa,
  };
};