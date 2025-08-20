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
      // First, get all tasks without the problematic join
      const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("projeto_id", projetoId!)
        .order("posicao");

      if (error) throw error;
      
      // If no tasks, return empty array
      if (!data || data.length === 0) return [];

      // Get unique user IDs from tasks that have a responsavel_id
      const userIds = [...new Set(data.filter(task => task.responsavel_id).map(task => task.responsavel_id))];
      
      // Fetch user data for all responsible users at once
      let usersMap = new Map();
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", userIds);
        
        if (!usersError && users) {
          usersMap = new Map(users.map(user => [user.user_id, user]));
        }
      }

      // Map tasks with their responsible users
      return data.map(tarefa => ({
        ...tarefa,
        responsavel: tarefa.responsavel_id ? usersMap.get(tarefa.responsavel_id) : undefined
      })) as (Tarefa & { responsavel?: { name: string; avatar_url?: string } })[];
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
    mutationFn: async (tarefa: Omit<Tarefa, "id" | "user_id" | "created_at" | "updated_at" | "posicao">) => {
      // Get the highest position in the column
      const { data: maxPos } = await supabase
        .from("tarefas")
        .select("posicao")
        .eq("coluna_id", tarefa.coluna_id)
        .order("posicao", { ascending: false })
        .limit(1);

      const newPos = maxPos?.[0]?.posicao ? maxPos[0].posicao + 1 : 0;

      const { data, error } = await supabase
        .from("tarefas")
        .insert({
          ...tarefa,
          user_id: user?.id,
          posicao: newPos,
        })
        .select()
        .single();

      if (error) throw error;
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
    mutationFn: async ({ id, ...tarefa }: Partial<Tarefa> & { id: string }) => {
      const { data, error } = await supabase
        .from("tarefas")
        .update(tarefa)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
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