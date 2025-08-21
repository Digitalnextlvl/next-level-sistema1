import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

interface AgendaNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: GoogleCalendarEvent[];
}

export function AgendaNavigation({ selectedDate, onDateChange, events }: AgendaNavigationProps) {
  // Group events by date for the calendar
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = new Date(event.start.dateTime || event.start.date || '');
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get events for selected date
  const eventsForSelectedDate = events.filter(event => {
    const eventDate = new Date(event.start.dateTime || event.start.date || '');
    return isSameDay(eventDate, selectedDate);
  });

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Mini Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Calendário</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            locale={ptBR}
            className="w-full"
            modifiers={{
              hasEvents: (date) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                return !!eventsByDate[dateKey];
              }
            }}
            modifiersStyles={{
              hasEvents: {
                fontWeight: 'bold',
                color: 'hsl(var(--primary))'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Events for Selected Date */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventsForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum evento para esta data
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {eventsForSelectedDate.length} evento(s)
                </span>
                <Badge variant="secondary" className="text-xs">
                  {eventsForSelectedDate.length}
                </Badge>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {eventsForSelectedDate.slice(0, 5).map((event, index) => (
                  <div key={event.id || index} className="text-xs p-2 bg-muted/50 rounded-md">
                    <div className="font-medium line-clamp-1">{event.summary}</div>
                    {event.start.dateTime && (
                      <div className="text-muted-foreground mt-1">
                        {format(new Date(event.start.dateTime), 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
                {eventsForSelectedDate.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{eventsForSelectedDate.length - 5} mais
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total de eventos</span>
            <Badge variant="outline">{events.length}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Este mês</span>
            <Badge variant="outline">
              {events.filter(event => {
                const eventDate = new Date(event.start.dateTime || event.start.date || '');
                const now = new Date();
                return eventDate.getMonth() === now.getMonth() && 
                       eventDate.getFullYear() === now.getFullYear();
              }).length}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}