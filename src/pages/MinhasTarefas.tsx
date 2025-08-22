import { useState, useMemo } from "react";
import { CheckSquare, Sparkles, TrendingUp } from "lucide-react";
import { useUserTasks } from "@/hooks/useUserTasks";
import { useNavigate } from "react-router-dom";
import { TaskStats } from "@/components/Tasks/TaskStats";
import { TaskFilters, type TaskFilters as TaskFiltersType } from "@/components/Tasks/TaskFilters";
import { TaskList } from "@/components/Tasks/TaskList";
import { useIsMobile } from "@/hooks/use-mobile";


export default function MinhasTarefas() {
  const { tasks, isLoading, availableColumns, updateTaskColumn } = useUserTasks();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<TaskFiltersType>({
    search: '',
    status: [],
    priority: [],
    sortBy: 'date',
    sortOrder: 'asc'
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };
    
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(task => task.coluna_nome === 'Concluído').length;
    const pending = tasks.filter(task => task.coluna_nome !== 'Concluído').length;
    const overdue = tasks.filter(task => 
      task.data_vencimento && 
      new Date(task.data_vencimento) < now && 
      task.coluna_nome !== 'Concluído'
    ).length;

    return { total, completed, pending, overdue };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.titulo.toLowerCase().includes(searchLower) ||
          task.projeto_nome.toLowerCase().includes(searchLower) ||
          task.responsaveis?.some((r: any) => r.name?.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.coluna_nome)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.prioridade || 'media')) {
        return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'date':
          const dateA = a.data_vencimento ? new Date(a.data_vencimento) : new Date('9999-12-31');
          const dateB = b.data_vencimento ? new Date(b.data_vencimento) : new Date('9999-12-31');
          return (dateA.getTime() - dateB.getTime()) * multiplier;
        
        case 'priority':
          const priorityOrder = { alta: 3, media: 2, baixa: 1 };
          const priorityA = priorityOrder[a.prioridade as keyof typeof priorityOrder] || 2;
          const priorityB = priorityOrder[b.prioridade as keyof typeof priorityOrder] || 2;
          return (priorityA - priorityB) * multiplier;
        
        case 'project':
          return a.projeto_nome.localeCompare(b.projeto_nome) * multiplier;
        
        case 'status':
          return a.coluna_nome.localeCompare(b.coluna_nome) * multiplier;
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, filters]);

  // Get unique projects for filter
  const projects = useMemo(() => {
    if (!tasks) return [];
    const uniqueProjects = new Map();
    tasks.forEach(task => {
      if (!uniqueProjects.has(task.projeto_id)) {
        uniqueProjects.set(task.projeto_id, {
          id: task.projeto_id,
          nome: task.projeto_nome
        });
      }
    });
    return Array.from(uniqueProjects.values());
  }, [tasks]);

  const handleColumnChange = (taskId: string, newColumnId: string) => {
    updateTaskColumn(taskId, newColumnId);
  };

  const handleTaskClick = (projectId: string) => {
    navigate(`/projetos`, { state: { selectedProjectId: projectId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className={`container mx-auto ${isMobile ? 'px-4 py-6' : 'px-6 py-8'} max-w-6xl`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <CheckSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Minhas Tarefas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie e acompanhe suas tarefas com produtividade
              </p>
            </div>
          </div>

          {/* Productivity Insight */}
          {stats.total > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 mb-6">
              <div className="p-1 rounded-md bg-primary/20">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm">
                <span className="font-medium text-primary">
                  {stats.completed > 0 && `Parabéns! ${stats.completed} ${stats.completed === 1 ? 'tarefa concluída' : 'tarefas concluídas'}.`}
                  {stats.overdue > 0 && ` ${stats.overdue} ${stats.overdue === 1 ? 'tarefa está' : 'tarefas estão'} atrasada${stats.overdue === 1 ? '' : 's'}.`}
                  {stats.overdue === 0 && stats.completed === 0 && stats.pending > 0 && `${stats.pending} ${stats.pending === 1 ? 'tarefa pendente' : 'tarefas pendentes'} aguardando sua atenção.`}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <TaskStats stats={stats} />

        {/* Filters */}
        <TaskFilters 
          filters={filters}
          onFiltersChange={setFilters}
          projects={projects}
        />

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          availableColumns={availableColumns || []}
          isLoading={isLoading}
          onColumnChange={handleColumnChange}
          onTaskClick={handleTaskClick}
        />
      </div>
    </div>
  );
}