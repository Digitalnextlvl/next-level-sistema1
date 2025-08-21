import { useState } from "react";
import { AgendaNavigation } from "./AgendaNavigation";
import { AgendaMainView } from "./AgendaMainView";
import { AgendaEventDetail } from "./AgendaEventDetail";
import { AgendaToolbar } from "./AgendaToolbar";
import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { DateRange } from "react-day-picker";

type ViewMode = 'day' | 'week' | 'month' | 'list';

interface AgendaLayoutProps {
  events: GoogleCalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

export function AgendaLayout({ events, isLoading, error }: AgendaLayoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on search and date
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Toolbar */}
      <AgendaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-80 border-r border-border bg-card/50 hidden lg:block">
          <AgendaNavigation
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            events={filteredEvents}
          />
        </div>

        {/* Center - Main View */}
        <div className="flex-1 flex flex-col">
          <AgendaMainView
            events={filteredEvents}
            isLoading={isLoading}
            error={error}
            viewMode={viewMode}
            selectedDate={selectedDate}
            dateRange={dateRange}
            onEventSelect={setSelectedEvent}
          />
        </div>

        {/* Right Sidebar - Event Detail */}
        {selectedEvent && (
          <div className="w-80 border-l border-border bg-card/50 hidden xl:block">
            <AgendaEventDetail
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}