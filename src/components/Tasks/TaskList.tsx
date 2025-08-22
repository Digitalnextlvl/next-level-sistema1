import { TaskCard } from "./TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare } from "lucide-react";

interface TaskListProps {
  tasks: any[];
  isLoading: boolean;
  onTaskClick: (projectId: string) => void;
}

export function TaskList({ tasks, isLoading, onTaskClick }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border bg-card">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex -space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
          <CheckSquare className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Nenhuma tarefa encontrada
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Suas tarefas aparecerão aqui quando forem atribuídas a você ou quando você criar novas tarefas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
          />
        ))}
    </div>
  );
}