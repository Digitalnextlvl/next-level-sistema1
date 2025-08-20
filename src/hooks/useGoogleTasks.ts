import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated: string;
  listId: string;
  listTitle: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
}

export const useGoogleTasks = () => {
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-tasks');

      if (error) throw error;

      if (data?.success) {
        setTasks(data.tasks || []);
        setTaskLists(data.taskLists || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch tasks');
      }
    } catch (error: any) {
      console.error('Error fetching Google Tasks:', error);
      setError(error.message || 'Erro ao carregar tarefas do Google');
      
      if (error.message?.includes('not connected')) {
        toast.error('Conecte sua conta Google primeiro');
      } else {
        toast.error('Erro ao carregar tarefas do Google');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, listId: string, completed: boolean) => {
    try {
      const status = completed ? 'completed' : 'needsAction';
      
      const { data, error } = await supabase.functions.invoke('google-tasks', {
        body: { taskId, listId, status }
      });

      if (error) throw error;

      if (data?.success) {
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status, completed: completed ? new Date().toISOString() : undefined }
              : task
          )
        );
        
        toast.success(completed ? 'Tarefa marcada como concluída' : 'Tarefa marcada como pendente');
      } else {
        throw new Error(data?.error || 'Failed to update task');
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  }, []);

  const getPendingTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'needsAction');
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'completed');
  }, [tasks]);

  const getTasksDueToday = useCallback(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      if (!task.due || task.status === 'completed') return false;
      const dueDate = new Date(task.due);
      return dueDate <= today;
    });
  }, [tasks]);

  // Auto-fetch tasks when hook is used
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    taskLists,
    isLoading,
    error,
    fetchTasks,
    updateTaskStatus,
    getPendingTasks,
    getCompletedTasks,
    getTasksDueToday
  };
};