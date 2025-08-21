import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Map kanban column names to status
const getTaskStatus = (columnId: string, projects: any[]): string => {
  // For now, we'll use a simple mapping based on column names
  // This could be improved by querying the actual column names
  return 'pendente'; // Default status
};

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
        status: task.status || 'pendente'
      })) || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Auto-refresh a cada 30 segundos
    refetchOnWindowFocus: true,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ status })
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      return { taskId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      
      const statusMessages = {
        'pendente': 'Tarefa marcada como pendente',
        'em_processo': 'Tarefa marcada como em processo', 
        'em_revisao': 'Tarefa marcada como em revisão',
        'concluido': 'Tarefa marcada como concluída',
        'problema': 'Tarefa marcada com problema'
      };
      
      toast.success(statusMessages[data.status as keyof typeof statusMessages] || 'Status atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  });

  return {
    tasks,
    isLoading,
    updateTaskStatus: (taskId: string, status: string) => updateTaskStatus.mutate({ taskId, status }),
  };
}