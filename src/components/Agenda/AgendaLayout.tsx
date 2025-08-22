import { useState } from "react";
import { AgendaToolbar } from "./AgendaToolbar";
import { AgendaMainView } from "./AgendaMainView";
import { EventoUnificado, useAgendaUnificada } from "@/hooks/useAgendaUnificada";
import { EventoDialog } from "./EventoDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DateRange } from "react-day-picker";

interface AgendaLayoutProps {
  events?: any[];
  isLoading?: boolean;
  error?: string | null;
}

type ViewMode = 'day' | 'week' | 'month' | 'list';

export function AgendaLayout({ events, isLoading, error }: AgendaLayoutProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    eventos,
    isLoading: isLoadingUnified,
    error: errorUnified,
    createEventoUnificado,
    updateEventoUnificado,
    deleteEventoUnificado,
    refreshAllEvents
  } = useAgendaUnificada();

  // Use unified events instead of Google-only events
  const allEvents = eventos;
  const loading = isLoading || isLoadingUnified;
  const errorMessage = error || errorUnified;

  // Filter events based on search
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleEventSelect = (event: EventoUnificado) => {
    // Handle event selection - could open a detail modal
    console.log('Selected event:', event);
  };

  const handleCreateEvent = async (data: any, syncToGoogle: boolean) => {
    await createEventoUnificado(data, syncToGoogle);
  };

  const handleUpdateEvent = async (id: string, data: any, syncToGoogle: boolean) => {
    await updateEventoUnificado(id, data, syncToGoogle);
  };

  const handleDeleteEvent = async (id: string, deleteFromGoogle: boolean) => {
    await deleteEventoUnificado(id, deleteFromGoogle);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Agenda Toolbar */}
      <div className="flex-shrink-0">
        <AgendaToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </div>

      {/* Create Event Button and Count */}
      <div className="flex-shrink-0 flex justify-between items-center px-6 py-2 border-b border-calendar-border bg-background">
        <div className="text-sm text-muted-foreground font-medium">
          {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
        </div>
        <EventoDialog
          onSave={handleCreateEvent}
          isOpen={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        >
          <Button className="bg-calendar-event-blue hover:bg-calendar-event-blue/90 text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </EventoDialog>
      </div>

      {/* Main View */}
      <div className="flex-1 min-h-0 bg-calendar-grid/20">
        <AgendaMainView
          events={filteredEvents}
          isLoading={loading}
          error={errorMessage}
          viewMode={viewMode}
          selectedDate={currentDate}
          dateRange={dateRange}
          onEventSelect={handleEventSelect}
        />
      </div>
    </div>
  );
}