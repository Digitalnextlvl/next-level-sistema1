import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageCircle, Paperclip, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tarefa } from "@/hooks/useProjetos";

interface TaskCardProps {
  tarefa: Tarefa & { responsavel?: { name: string; avatar_url?: string } };
}

const prioridades = {
  baixa: { color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)" },
  media: { color: "hsl(var(--warning))", bg: "hsl(var(--warning) / 0.1)" },
  alta: { color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.1)" },
};

export function TaskCard({ tarefa }: TaskCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3 space-y-2">
        {/* Priority indicator */}
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
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(tarefa.data_vencimento).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {tarefa.responsavel && (
            <Avatar className="w-6 h-6">
              <AvatarImage src={tarefa.responsavel.avatar_url} />
              <AvatarFallback className="text-xs">
                {tarefa.responsavel.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}