import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { cn } from "@/lib/utils";

interface GoogleCalendarGridProps {
  events: GoogleCalendarEvent[];
  currentDate: Date;
  isLoading: boolean;
  error: string | null;
}

export function GoogleCalendarGrid({ events, currentDate, isLoading, error }: GoogleCalendarGridProps) {
  const { isConnected, connectGoogle, isConnecting, isCheckingConnection } = useGoogleAuth();
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  
  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startCalendar = new Date(firstDayOfMonth);
  startCalendar.setDate(startCalendar.getDate() - firstDayOfMonth.getDay());
  
  const calendarDays: Date[] = [];
  const currentCalendarDate = new Date(startCalendar);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  const getEventsForDay = (day: Date): GoogleCalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '');
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const formatEventTime = (event: GoogleCalendarEvent): string => {
    if (event.start.date) return ""; // All-day event
    
    const startTime = new Date(event.start.dateTime || '');
    return startTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const isToday = (day: Date): boolean => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (day: Date): boolean => {
    return day.getMonth() === currentDate.getMonth();
  };

  const getEventColor = (eventIndex: number): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500"
    ];
    return colors[eventIndex % colors.length];
  };

  // Show loading state while checking connection or loading events
  if (isLoading || isCheckingConnection) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-px bg-border">
          {dayNames.map(day => (
            <div key={day} className="bg-card p-2">
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="bg-card p-2 h-32">
              <Skeleton className="h-6 w-6 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle not connected state
  if (!isConnected && !isCheckingConnection) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Conecte sua conta Google</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Para visualizar seus eventos do Google Calendar, conecte sua conta Google primeiro.
        </p>
        <Button 
          onClick={connectGoogle}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {isConnecting ? 'Conectando...' : 'Conectar Google Calendar'}
        </Button>
      </div>
    );
  }

  // Handle other errors (connection issues, API errors, etc.)
  if (error && isConnected) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-border rounded-lg overflow-hidden">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {dayNames.map(day => (
          <div key={day} className="bg-card p-3 text-center font-medium text-sm text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {calendarDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);
          const inCurrentMonth = isCurrentMonth(day);

          return (
            <div
              key={dayIndex}
              className={cn(
                "bg-card p-2 min-h-[120px] relative",
                !inCurrentMonth && "bg-muted/20"
              )}
            >
              {/* Day Number */}
              <div className={cn(
                "text-sm font-medium mb-1",
                isCurrentDay && "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center",
                !inCurrentMonth && "text-muted-foreground"
              )}>
                {day.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded text-white font-medium truncate cursor-pointer",
                      getEventColor(eventIndex)
                    )}
                    title={`${event.summary}${formatEventTime(event) ? ` - ${formatEventTime(event)}` : ''}`}
                  >
                    {formatEventTime(event) && (
                      <span className="mr-1">{formatEventTime(event)}</span>
                    )}
                    {event.summary}
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground font-medium">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}