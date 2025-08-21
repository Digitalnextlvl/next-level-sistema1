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
      return tasks?.map(task => ({
        ...task,
        projeto_nome: projects?.find(p => p.id === task.projeto_id)?.nome || '',
        responsaveis: responsaveisIds?.filter(r => r.tarefa_id === task.id)?.map(r => {
          const profile = profiles?.find(p => p.user_id === r.user_id);
          return {
            user_id: r.user_id,
            name: profile?.name || '',
            avatar_url: profile?.avatar_url || '',
          };
        }) || [],
        status: 'pendente'
      })) || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Auto-refresh a cada 30 segundos
    refetchOnWindowFocus: true,
  });

  const markAsCompleted = useMutation({
    mutationFn: async (taskId: string) => {
      const { data: completedColumn } = await supabase
        .from("colunas_kanban")
        .select("id")
        .ilike("nome", "%concluído%")
        .single();

      if (completedColumn) {
        await supabase
          .from("tarefas")
          .update({ coluna_id: completedColumn.id, posicao: 999 })
          .eq("id", taskId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      toast.success("Tarefa marcada como concluída!");
    },
  });

  return {
    tasks,
    isLoading,
    markAsCompleted: markAsCompleted.mutate,
  };
}