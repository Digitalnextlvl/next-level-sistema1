import { useState } from "react";
import { GoogleCalendarHeader } from "./GoogleCalendarHeader";
import { GoogleCalendarGrid } from "./GoogleCalendarGrid";
import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";

interface AgendaLayoutProps {
  events: GoogleCalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

export function AgendaLayout({ events, isLoading, error }: AgendaLayoutProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on search
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
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

      {/* Main Calendar Grid */}
      <div className="flex-1 p-4">
        <GoogleCalendarGrid
          events={filteredEvents}
          currentDate={currentDate}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}