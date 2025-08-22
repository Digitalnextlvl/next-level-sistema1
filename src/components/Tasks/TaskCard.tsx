import { Clock, AlertCircle, Check, ChevronDown, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  task: any;
  availableColumns: any[];
  onColumnChange: (taskId: string, columnId: string) => void;
  onTaskClick: (projectId: string) => void;
}

const getColumnConfig = (columnName: string) => {
  const configs = {
    'A Fazer': { 
      label: "A Fazer", 
      icon: Clock, 
      color: "text-muted-foreground",
      bgColor: "bg-muted/50" 
    },
    'Em Progresso': { 
      label: "Em Progresso", 
      icon: Clock, 
      color: "text-warning",
      bgColor: "bg-warning/10" 
    },
    'Em Revisão': { 
      label: "Em Revisão", 
      icon: AlertCircle, 
      color: "text-info",
      bgColor: "bg-info/10" 
    },
    'Concluído': { 
      label: "Concluído", 
      icon: Check, 
      color: "text-success",
      bgColor: "bg-success/10" 
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

export function TaskCard({ task, availableColumns, onColumnChange, onTaskClick }: TaskCardProps) {
  const columnConfig = getColumnConfig(task.coluna_nome);
  const StatusIcon = columnConfig.icon;
  const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date() && task.coluna_nome !== 'Concluído';
  const isCompleted = task.coluna_nome === 'Concluído';

  // Get available columns for this specific task's project
  const taskColumns = availableColumns?.filter(col => col.projeto_id === task.projeto_id) || [];

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const concludedColumn = taskColumns.find(col => col.nome === 'Concluído');
    const aFazerColumn = taskColumns.find(col => col.nome === 'A Fazer');
    
    if (isCompleted && aFazerColumn) {
      onColumnChange(task.id, aFazerColumn.id);
    } else if (concludedColumn) {
      onColumnChange(task.id, concludedColumn.id);
    }
  };

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
          {/* Status Button */}
          <button
            onClick={handleStatusToggle}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
              ${columnConfig.color} ${columnConfig.bgColor} border-2 border-current
              hover:scale-110 active:scale-95 flex-shrink-0 mt-1
            `}
          >
            <StatusIcon className="w-4 h-4" />
          </button>

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
                <div className="w-2 h-2 rounded-full bg-primary/60" />
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
              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Badge 
                      variant="secondary" 
                      className={`
                        text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5
                        ${columnConfig.color} ${columnConfig.bgColor} border border-current/20
                        hover:border-current/40 transition-colors
                      `}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {columnConfig.label}
                      <ChevronDown className="w-3 h-3" />
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {taskColumns.map((column) => {
                    const config = getColumnConfig(column.nome);
                    return (
                      <DropdownMenuItem
                        key={column.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onColumnChange(task.id, column.id);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <config.icon className="w-4 h-4" />
                        <span>{column.nome}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

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