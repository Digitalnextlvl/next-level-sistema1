import { EventoUnificado } from "@/hooks/useAgendaUnificada";
import { EventListView } from "./EventListView";
import { EventGridView } from "./EventGridView";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

type ViewMode = 'day' | 'week' | 'month' | 'list';

interface AgendaMainViewProps {
  events: EventoUnificado[];
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  selectedDate: Date;
  dateRange?: DateRange;
  onEventSelect: (event: EventoUnificado) => void;
}

export function AgendaMainView({
  events,
  isLoading,
  error,
  viewMode,
  selectedDate,
  dateRange,
  onEventSelect
}: AgendaMainViewProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="font-medium">Erro ao carregar eventos</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Calendar className="w-12 h-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="font-medium">Nenhum evento encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Conecte sua conta Google ou aguarde a sincronização dos eventos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render based on view mode
  switch (viewMode) {
    case 'list':
      return (
        <EventListView
          events={events}
          onEventSelect={onEventSelect}
          dateRange={dateRange}
        />
      );
    case 'day':
    case 'week':
    case 'month':
      return (
        <EventGridView
          events={events}
          viewMode={viewMode}
          selectedDate={selectedDate}
          onEventSelect={onEventSelect}
        />
      );
    default:
      return (
        <EventListView
          events={events}
          onEventSelect={onEventSelect}
          dateRange={dateRange}
        />
      );
  }
}