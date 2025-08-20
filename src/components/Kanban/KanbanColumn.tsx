import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { ColunaKanban, Tarefa } from "@/hooks/useProjetos";

interface KanbanColumnProps {
  coluna: ColunaKanban;
  tarefas: (Tarefa & { responsavel?: { name: string; avatar_url?: string } })[];
  onCreateTask: () => void;
}

export function KanbanColumn({ coluna, tarefas, onCreateTask }: KanbanColumnProps) {
  const { setNodeRef: droppableRef } = useDroppable({
    id: coluna.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: sortableRef,
    transform,
    transition,
  } = useSortable({
    id: coluna.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={sortableRef}
      style={style}
      {...attributes}
      className="flex-shrink-0 w-80 bg-muted/20 rounded-lg"
    >
      {/* Column Header */}
      <div 
        className="p-4 border-b border-border/50 cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: coluna.cor }}
            />
            <h3 className="font-semibold text-sm">{coluna.nome}</h3>
            <Badge variant="secondary" className="text-xs">
              {tarefas.length}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCreateTask}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={droppableRef}
        className="p-4 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto space-y-3"
      >
        {tarefas.map((tarefa) => (
          <TaskCard key={tarefa.id} tarefa={tarefa} />
        ))}
        
        {tarefas.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>Nenhuma tarefa</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateTask}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar tarefa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}