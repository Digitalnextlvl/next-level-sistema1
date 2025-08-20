import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tarefa } from "@/hooks/useProjetos";

interface TaskCardProps {
  tarefa: Tarefa & { responsavel?: { name: string; avatar_url?: string } };
  onEdit?: () => void;
}

const prioridades = {
  baixa: { color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)" },
  media: { color: "hsl(var(--warning))", bg: "hsl(var(--warning) / 0.1)" },
  alta: { color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.1)" },
};

export function TaskCard({ tarefa, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tarefa.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
    borderLeftColor: tarefa.prioridade === 'alta' ? 'hsl(var(--destructive))' : 
                    tarefa.prioridade === 'media' ? 'hsl(var(--warning))' : 
                    'hsl(var(--success))'
  };

  const isOverdue = tarefa.data_vencimento && new Date(tarefa.data_vencimento) < new Date();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={handleDoubleClick}
      className={`cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 group border-l-4 ${
        isDragging ? "shadow-xl rotate-2 scale-105" : "hover:scale-[1.02]"
      } ${isOverdue ? "border-l-destructive" : ""}`}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header with priority and edit button */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1"
            style={{
              backgroundColor: prioridades[tarefa.prioridade].bg,
              color: prioridades[tarefa.prioridade].color,
              border: `1px solid ${prioridades[tarefa.prioridade].color}`,
            }}
          >
            {tarefa.prioridade}
          </Badge>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm leading-snug">
          {tarefa.titulo}
        </h4>

        {/* Description */}
        {tarefa.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tarefa.descricao}
          </p>
        )}

        {/* Labels */}
        {tarefa.labels && tarefa.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tarefa.labels.slice(0, 3).map((label, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {label}
              </Badge>
            ))}
            {tarefa.labels.length > 3 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{tarefa.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {tarefa.data_vencimento && (
              <div className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(tarefa.data_vencimento).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {tarefa.responsavel && (
            <Avatar className="w-6 h-6 ring-2 ring-background shadow-sm">
              <AvatarImage src={tarefa.responsavel.avatar_url} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {tarefa.responsavel.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}