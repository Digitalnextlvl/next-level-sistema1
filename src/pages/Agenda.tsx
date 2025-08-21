import { CalendarDays } from "lucide-react";
import { GoogleConnect } from "@/components/Dashboard/GoogleConnect";
import { GoogleCalendarWidget } from "@/components/Dashboard/GoogleCalendarWidget";

export default function Agenda() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="w-6 h-6 text-primary" />
            Agenda
          </h1>
          <p className="text-muted-foreground">
            Visualize seus eventos do Google Calendar
          </p>
        </div>
        
        {/* Botão do Google Connect */}
        <GoogleConnect />
      </div>

      {/* Widget do Google Calendar */}
      <GoogleCalendarWidget />
    </div>
  );
}