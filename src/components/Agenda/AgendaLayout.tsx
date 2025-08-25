import { useState } from "react";
import { AgendaToolbar } from "./AgendaToolbar";
import { AgendaMainView } from "./AgendaMainView";
import { EventoUnificado, useAgendaUnificada } from "@/hooks/useAgendaUnificada";
import { GoogleConnect } from "@/components/Dashboard/GoogleConnect";
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
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    eventos,
    isLoading: isLoadingUnified,
    error: errorUnified
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

  return (
    <div className="h-full flex flex-col bg-background">
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


      {/* Main View */}
      <div className="flex-1 min-h-0 overflow-hidden bg-calendar-grid/10">
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


      {/* Google Integration Section */}
      <div className="flex-shrink-0 border-t border-calendar-border bg-background p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Integração com Google Calendar</p>
            <p className="text-xs">Sincronize seus eventos com sua conta Google para uma experiência completa.</p>
          </div>
          <div className="flex-shrink-0">
            <GoogleConnect />
          </div>
        </div>
      </div>
    </div>
  );
}