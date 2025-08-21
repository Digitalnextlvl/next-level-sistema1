import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useUserTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tasks assigned to the current user
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["user-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get task IDs where user is assigned
      const { data: userTasks } = await supabase
        .from("tarefa_responsaveis")
        .select("tarefa_id")
        .eq("user_id", user.id);

      if (!userTasks?.length) return [];

      const taskIds = userTasks.map(t => t.tarefa_id);

      // Get tasks
      const { data: tasks } = await supabase
        .from("tarefas")
        .select("*")
        .in("id", taskIds)
        .order("data_vencimento", { ascending: true, nullsFirst: false });

      // Get projects
      const projectIds = [...new Set(tasks?.map(t => t.projeto_id) || [])];
      const { data: projects } = await supabase
        .from("projetos")
        .select("id, nome")
        .in("id", projectIds);

      // Get Kanban columns for all projects
      const { data: columns } = await supabase
        .from("colunas_kanban")
        .select("id, nome, cor, projeto_id")
        .in("projeto_id", projectIds);

      // Get all responsaveis for these tasks - separate queries
      const { data: responsaveisIds } = await supabase
        .from("tarefa_responsaveis")
        .select("tarefa_id, user_id")
        .in("tarefa_id", taskIds);

      const userIds = [...new Set(responsaveisIds?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", userIds);

      // Combine data
      return tasks?.map(task => {
        const column = columns?.find(c => c.id === task.coluna_id);
        return {
          ...task,
          projeto_nome: projects?.find(p => p.id === task.projeto_id)?.nome || '',
          coluna_nome: column?.nome || 'A Fazer',
          coluna_cor: column?.cor || '#6B7280',
          responsaveis: responsaveisIds?.filter(r => r.tarefa_id === task.id)?.map(r => {
            const profile = profiles?.find(p => p.user_id === r.user_id);
            return {
              user_id: r.user_id,
              name: profile?.name || '',
              avatar_url: profile?.avatar_url || '',
            };
          }) || [],
        };
      }) || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Auto-refresh a cada 30 segundos
    refetchOnWindowFocus: true,
  });

  // Fetch available columns for a specific project
  const { data: availableColumns } = useQuery({
    queryKey: ["kanban-columns"],
    queryFn: async () => {
      const { data: columns } = await supabase
        .from("colunas_kanban")
        .select("id, nome, cor, projeto_id")
        .order("posicao", { ascending: true });

      return columns || [];
    },
    enabled: !!user?.id,
  });

  const updateTaskColumn = useMutation({
    mutationFn: async ({ taskId, columnId }: { taskId: string; columnId: string }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ coluna_id: columnId })
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      return { taskId, columnId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      
      toast.success('Tarefa movida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao mover tarefa:', error);
      toast.error("Erro ao mover tarefa");
    }
  });

  return {
    tasks,
    isLoading,
    availableColumns,
    updateTaskColumn: (taskId: string, columnId: string) => updateTaskColumn.mutate({ taskId, columnId }),
  };
}