import { useState } from "react";
import { GoogleCalendarHeader } from "./GoogleCalendarHeader";
import { GoogleCalendarGrid } from "./GoogleCalendarGrid";
import { EventoUnificado, useAgendaUnificada } from "@/hooks/useAgendaUnificada";
import { EventoDialog } from "./EventoDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AgendaLayoutProps {
  events?: any[];
  isLoading?: boolean;
  error?: string | null;
}

export function AgendaLayout({ events, isLoading, error }: AgendaLayoutProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
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
    <div className="h-full flex flex-col bg-background">
      {/* Google Calendar Style Header */}
      <GoogleCalendarHeader
        currentDate={currentDate}
        onToday={goToToday}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Create Event Button */}
      <div className="flex justify-between items-center px-4 pb-2">
        <div className="text-sm text-muted-foreground">
          {filteredEvents.length} evento(s) encontrado(s)
        </div>
        <EventoDialog
          onSave={handleCreateEvent}
          isOpen={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        >
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </EventoDialog>
      </div>

      {/* Main Calendar Grid */}
      <div className="flex-1 p-4">
        <GoogleCalendarGrid
          events={filteredEvents}
          currentDate={currentDate}
          isLoading={loading}
          error={errorMessage}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onRefresh={refreshAllEvents}
        />
      </div>
    </div>
  );
}