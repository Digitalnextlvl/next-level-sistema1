import { AlertCircle, Check, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  task: any;
  onTaskClick: (projectId: string) => void;
}

const getStatusIndicator = (columnName: string) => {
  const configs = {
    'A Fazer': { 
      label: "A Fazer", 
      color: "bg-muted-foreground"
    },
    'Em Progresso': { 
      label: "Em Progresso", 
      color: "bg-warning"
    },
    'Em Revisão': { 
      label: "Em Revisão", 
      color: "bg-info"
    },
    'Concluído': { 
      label: "Concluído", 
      color: "bg-success"
    }
  };
  return configs[columnName as keyof typeof configs] || configs['A Fazer'];
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta':
      return 'border-destructive text-destructive bg-destructive/10';
    case 'baixa':
      return 'border-success text-success bg-success/10';
    default:
      return 'border-warning text-warning bg-warning/10';
  }
};

export function TaskCard({ task, onTaskClick }: TaskCardProps) {
  const statusConfig = getStatusIndicator(task.coluna_nome);
  const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date() && task.coluna_nome !== 'Concluído';
  const isCompleted = task.coluna_nome === 'Concluído';

  return (
    <Card 
      className={`
        group hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]
        ${isCompleted ? 'opacity-75' : ''}
        ${isOverdue ? 'ring-1 ring-destructive/20 bg-destructive/5' : ''}
      `}
      onClick={() => onTaskClick(task.projeto_id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Indicator */}
          <div className="flex-shrink-0 mt-2">
            <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title and Priority */}
            <div className="flex items-start justify-between gap-3">
              <h3 className={`
                font-semibold text-base leading-tight
                ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}
              `}>
                {task.titulo}
              </h3>
              
              {task.prioridade && task.prioridade !== 'media' && (
                <Badge 
                  variant="outline" 
                  className={`
                    text-xs px-2 py-1 font-medium flex-shrink-0
                    ${getPriorityColor(task.prioridade)}
                  `}
                >
                  {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
                </Badge>
              )}
            </div>

            {/* Project and Date */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{task.projeto_nome}</span>
              </div>
              
              {task.data_vencimento && (
                <div className={`
                  flex items-center gap-1.5
                  ${isOverdue ? 'text-destructive font-medium' : ''}
                `}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(task.data_vencimento).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Status and Assignees */}
            <div className="flex items-center justify-between">
              {/* Status Badge */}
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {statusConfig.label}
              </Badge>

              {/* Assignees */}
              {task.responsaveis && task.responsaveis.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {task.responsaveis.slice(0, 3).map((responsavel: any, index: number) => (
                      <Avatar key={responsavel.user_id} className="w-6 h-6 ring-2 ring-background">
                        <AvatarImage src={responsavel.avatar_url} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {responsavel.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.responsaveis.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                        <span className="text-xs text-muted-foreground">
                          +{task.responsaveis.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}