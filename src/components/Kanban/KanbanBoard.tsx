import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKanbanTasks } from "@/hooks/useKanbanTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
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
  const [editingTask, setEditingTask] = useState<Tarefa | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    let newPosition = 0;
    
    if (overTask) {
      targetColumnId = overTask.coluna_id;
      
      // If same column, reorder within column
      if (activeTask.coluna_id === targetColumnId) {
        const columnTasks = tarefas.filter(t => t.coluna_id === targetColumnId && t.id !== activeTask.id);
        const overIndex = columnTasks.findIndex(t => t.id === overTask.id);
        newPosition = overIndex >= 0 ? overIndex : columnTasks.length;
      } else {
        // Moving to different column, place after the over task
        newPosition = overTask.posicao + 1;
      }
    } else if (overColumn) {
      // Dropping on empty column or at the end
      const tasksInTargetColumn = tarefas.filter(t => t.coluna_id === targetColumnId);
      newPosition = tasksInTargetColumn.length;
    }

    if (!targetColumnId) return;

    // Only update if position or column changed
    if (activeTask.coluna_id !== targetColumnId || activeTask.posicao !== newPosition) {
      updateTaskPosition.mutate({
        taskId: activeTask.id,
        newColumnId: targetColumnId,
        newPosition,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setEditingTask(null);
    setShowTaskDialog(true);
  };

  const handleEditTask = (task: Tarefa) => {
    setEditingTask(task);
    setSelectedColumn(task.coluna_id);
    setShowTaskDialog(true);
  };

  // Filter tasks based on search
  const filteredTarefas = tarefas.filter(task => 
    searchTerm === "" || 
    task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6 px-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1 min-h-0">
          <SortableContext items={colunas.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            {colunas.map((coluna) => (
              <KanbanColumn
                key={coluna.id}
                coluna={coluna}
                tarefas={filteredTarefas.filter(t => t.coluna_id === coluna.id)}
                onCreateTask={() => handleCreateTask(coluna.id)}
                onEditTask={handleEditTask}
              />
            ))}
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-90">
              <TaskCard tarefa={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        projetoId={projetoId}
        colunaId={selectedColumn}
        tarefa={editingTask}
      />
    </div>
  );
}