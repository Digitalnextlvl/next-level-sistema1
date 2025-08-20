import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';
import { CheckSquare, RefreshCw, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const GoogleTasksWidget = () => {
  const { 
    tasks, 
    isLoading, 
    error, 
    fetchTasks, 
    updateTaskStatus, 
    getPendingTasks,
    getTasksDueToday 
  } = useGoogleTasks();

  const pendingTasks = getPendingTasks().slice(0, 10); // Show only first 10
  const tasksDueToday = getTasksDueToday();

  const handleTaskToggle = async (taskId: string, listId: string, completed: boolean) => {
    await updateTaskStatus(taskId, listId, completed);
  };

  const formatDueDate = (dueDate: string) => {
    const date = parseISO(dueDate);
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const isOverdue = (dueDate: string) => {
    return isPast(parseISO(dueDate));
  };

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua conta Google para ver suas tarefas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            Tarefas Google
            {tasksDueToday.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {tasksDueToday.length} hoje
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTasks}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-4 h-4 bg-muted rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingTasks.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pendingTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={(checked) => 
                    handleTaskToggle(task.id, task.listId, !!checked)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground truncate">
                      {task.listTitle}
                    </span>
                    {task.due && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span 
                          className={`text-xs ${
                            isOverdue(task.due) 
                              ? 'text-red-500 font-medium' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatDueDate(task.due)}
                        </span>
                        {isOverdue(task.due) && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {task.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa pendente encontrada
            </p>
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {pendingTasks.length} de {tasks.filter(t => t.status === 'needsAction').length} tarefas pendentes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};