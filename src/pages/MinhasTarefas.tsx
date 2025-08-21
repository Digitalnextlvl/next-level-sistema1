import { CheckSquare, Clock, AlertCircle, Check, ChevronDown } from "lucide-react";
import { useUserTasks } from "@/hooks/useUserTasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

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

export default function MinhasTarefas() {
  const { tasks, isLoading, availableColumns, updateTaskColumn } = useUserTasks();
  const navigate = useNavigate();

  const handleColumnChange = (taskId: string, newColumnId: string) => {
    updateTaskColumn(taskId, newColumnId);
  };

  const handleTaskClick = (projectId: string) => {
    navigate(`/projetos`, { state: { selectedProjectId: projectId } });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold mb-2">
            <CheckSquare className="w-8 h-8 text-primary" />
            Minhas Tarefas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas pessoais
          </p>
        </div>

        {/* To-Do List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            tasks.map((task) => {
              const columnConfig = getColumnConfig(task.coluna_nome);
              const StatusIcon = columnConfig.icon;
              const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date() && task.coluna_nome !== 'Concluído';

              // Get available columns for this specific task's project
              const taskColumns = availableColumns?.filter(col => col.projeto_id === task.projeto_id) || [];

              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.projeto_id)}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer
                    ${task.coluna_nome === 'Concluído' ? 'opacity-60' : ''}
                    ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}
                  `}
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle between current column and "Concluído"
                      const concludedColumn = taskColumns.find(col => col.nome === 'Concluído');
                      const aFazerColumn = taskColumns.find(col => col.nome === 'A Fazer');
                      if (task.coluna_nome === 'Concluído' && aFazerColumn) {
                        handleColumnChange(task.id, aFazerColumn.id);
                      } else if (concludedColumn) {
                        handleColumnChange(task.id, concludedColumn.id);
                      }
                    }}
                    className={`
                      flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors
                      ${columnConfig.color} ${columnConfig.bgColor} border-current
                      hover:scale-110 active:scale-95
                    `}
                  >
                    <StatusIcon className="w-4 h-4" />
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`
                        font-medium text-sm
                        ${task.coluna_nome === 'Concluído' ? 'line-through text-muted-foreground' : ''}
                      `}>
                        {task.titulo}
                      </h3>
                      
                      {/* Status Badge */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="transition-transform hover:scale-105 active:scale-95"
                          >
                            <Badge 
                              variant="secondary" 
                              className={`
                                text-xs px-2 py-1 h-5 cursor-pointer flex items-center gap-1
                                ${columnConfig.color} ${columnConfig.bgColor}
                                hover:opacity-80 transition-opacity
                              `}
                            >
                              {columnConfig.label}
                              <ChevronDown className="w-3 h-3" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-32">
                          {taskColumns.map((column) => {
                            const config = getColumnConfig(column.nome);
                            return (
                              <DropdownMenuItem
                                key={column.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleColumnChange(task.id, column.id);
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

                      {/* Priority Badge */}
                      {task.prioridade && task.prioridade !== 'media' && (
                        <Badge 
                          variant="outline" 
                          className={`
                            text-xs px-2 py-1 h-5
                            ${task.prioridade === 'alta' ? 'border-destructive text-destructive' : ''}
                            ${task.prioridade === 'baixa' ? 'border-success text-success' : ''}
                          `}
                        >
                          {task.prioridade}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{task.projeto_nome}</span>
                      {task.data_vencimento && (
                        <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                          {new Date(task.data_vencimento).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Suas tarefas aparecerão aqui quando forem atribuídas a você.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}