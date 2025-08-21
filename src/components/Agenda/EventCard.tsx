import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Clock, 
  MapPin, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Copy,
  Calendar
} from "lucide-react";
import { EventoUnificado } from "@/hooks/useAgendaUnificada";
import { EventoDialog } from "./EventoDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface EventCardProps {
  evento: EventoUnificado;
  onUpdate?: (id: string, updates: any, syncToGoogle?: boolean) => Promise<void>;
  onDelete?: (id: string, deleteFromGoogle?: boolean) => Promise<void>;
  onSelect?: (evento: EventoUnificado) => void;
}

export function EventCard({ evento, onUpdate, onDelete, onSelect }: EventCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFromGoogle, setDeleteFromGoogle] = useState(false);

  const isGoogleEvent = evento.tipo === 'google';
  const hasGoogleSync = evento.google_event_id;

  const formatEventTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "dd/MM", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(evento.data_inicio);
    const end = new Date(evento.data_fim);

    if (now < start) return { status: "upcoming", label: "Próximo", color: "bg-blue-500" };
    if (now >= start && now <= end) return { status: "ongoing", label: "Em andamento", color: "bg-green-500" };
    return { status: "past", label: "Finalizado", color: "bg-gray-500" };
  };

  const eventStatus = getEventStatus();

  const handleEdit = async (data: any, syncToGoogle: boolean) => {
    if (onUpdate) {
      await onUpdate(evento.id, data, syncToGoogle);
      setShowEditDialog(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(evento.id, deleteFromGoogle);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyToClipboard = () => {
    const eventText = `
${evento.titulo}
Data: ${formatEventDate(evento.data_inicio)} às ${formatEventTime(evento.data_inicio)}
${evento.local ? `Local: ${evento.local}` : ''}
${evento.descricao ? `Descrição: ${evento.descricao}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(eventText);
    toast.success("Detalhes do evento copiados!");
  };

  return (
    <>
      <Card 
        className="group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
        style={{ borderLeftColor: evento.cor }}
        onClick={() => onSelect?.(evento)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm truncate pr-2 flex-1">
                  {evento.titulo}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className={`text-xs ${eventStatus.color} text-white`}>
                    {eventStatus.label}
                  </Badge>
                  {isGoogleEvent && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Google
                    </Badge>
                  )}
                  {hasGoogleSync && !isGoogleEvent && (
                    <Badge variant="outline" className="text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Sync
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatEventDate(evento.data_inicio)} • {formatEventTime(evento.data_inicio)}
                    {evento.data_inicio !== evento.data_fim && ` - ${formatEventTime(evento.data_fim)}`}
                  </span>
                </div>

                {evento.local && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{evento.local}</span>
                  </div>
                )}

                {evento.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                    {evento.descricao}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isGoogleEvent && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToClipboard();
                }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar detalhes
                </DropdownMenuItem>

                {!isGoogleEvent && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EventoDialog
        evento={evento}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento "{evento.titulo}"?
              {hasGoogleSync && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={deleteFromGoogle}
                      onChange={(e) => setDeleteFromGoogle(e.target.checked)}
                      className="rounded"
                    />
                    Também excluir do Google Calendar
                  </label>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}