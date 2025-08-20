import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKanbanTasks } from "@/hooks/useKanbanTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import { Tarefa } from "@/hooks/useProjetos";

interface KanbanBoardProps {
  projetoId: string;
}

export function KanbanBoard({ projetoId }: KanbanBoardProps) {
  const { colunas, tarefas, updateTaskPosition, isLoadingColunas, isLoadingTarefas } = useKanbanTasks(projetoId);
  const [activeTask, setActiveTask] = useState<Tarefa | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tarefas.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTask = tarefas.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if we're dropping over a column or task
    const overColumn = colunas.find(c => c.id === over.id);
    const overTask = tarefas.find(t => t.id === over.id);
    
    let targetColumnId = overColumn?.id;
    if (overTask) {
      targetColumnId = overTask.coluna_id;
    }

    if (!targetColumnId || activeTask.coluna_id === targetColumnId) return;

    // Calculate new position
    const tasksInTargetColumn = tarefas.filter(t => t.coluna_id === targetColumnId);
    let newPosition = 0;
    
    if (overTask) {
      newPosition = overTask.posicao;
    } else {
      newPosition = tasksInTargetColumn.length;
    }

    updateTaskPosition.mutate({
      taskId: activeTask.id,
      newColumnId: targetColumnId,
      newPosition,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setShowTaskDialog(true);
  };

  if (isLoadingColunas || isLoadingTarefas) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80 bg-muted/20 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-24 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
          <SortableContext items={colunas.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            {colunas.map((coluna) => (
              <KanbanColumn
                key={coluna.id}
                coluna={coluna}
                tarefas={tarefas.filter(t => t.coluna_id === coluna.id)}
                onCreateTask={() => handleCreateTask(coluna.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        projetoId={projetoId}
        colunaId={selectedColumn}
      />
    </div>
  );
}