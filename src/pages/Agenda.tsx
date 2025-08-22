import { CalendarDays } from "lucide-react";
import { AgendaLayout } from "@/components/Agenda/AgendaLayout";

export default function Agenda() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Google Calendar Style Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background">
        <CalendarDays className="w-6 h-6 text-calendar-event-blue" />
        <h1 className="text-xl font-semibold text-foreground">Agenda</h1>
      </div>

      {/* Main Agenda Layout - Full width */}
      <div className="flex-1 min-h-0">
        <AgendaLayout />
      </div>
    </div>
  );
}