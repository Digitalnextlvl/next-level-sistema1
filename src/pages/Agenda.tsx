import { CalendarDays } from "lucide-react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { AgendaLayout } from "@/components/Agenda/AgendaLayout";

export default function Agenda() {
  const { events, isLoading, error } = useGoogleCalendar();

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Agenda</h1>
      </div>

      {/* Main Agenda Layout */}
      <div className="flex-1 overflow-hidden">
        <AgendaLayout
          events={events}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}