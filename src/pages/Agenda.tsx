import { CalendarDays } from "lucide-react";
import { AgendaLayout } from "@/components/Agenda/AgendaLayout";

export default function Agenda() {
  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Agenda</h1>
      </div>

      {/* Main Agenda Layout */}
      <div className="flex-1 overflow-hidden">
        <AgendaLayout />
      </div>
    </div>
  );
}