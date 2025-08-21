import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin } from "lucide-react";

type ViewMode = 'day' | 'week' | 'month';

interface EventGridViewProps {
  events: GoogleCalendarEvent[];
  viewMode: ViewMode;
  selectedDate: Date;
  onEventSelect: (event: GoogleCalendarEvent) => void;
}

export function EventGridView({ events, viewMode, selectedDate, onEventSelect }: EventGridViewProps) {
  
  const getDaysToShow = () => {
    switch (viewMode) {
      case 'day':
        return [selectedDate];
      case 'week':
        const weekStart = startOfWeek(selectedDate, { locale: ptBR });
        const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        // Include days from previous/next month to fill the grid
        const calendarStart = startOfWeek(monthStart, { locale: ptBR });
        const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      default:
        return [selectedDate];
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '');
      return isSameDay(eventDate, day);
    });
  };

  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (!event.start.dateTime) return "Dia inteiro";
    return format(new Date(event.start.dateTime), 'HH:mm');
  };

  const days = getDaysToShow();

  if (viewMode === 'day') {
    const dayEvents = getEventsForDay(selectedDate);
    
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-muted-foreground">
              {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''} agendado{dayEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {dayEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">Nenhum evento para hoje</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event, index) => (
                <Card 
                  key={event.id || index}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onEventSelect(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{event.summary}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatEventTime(event)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.start.dateTime ? 'Horário' : 'Dia inteiro'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'week') {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-7 gap-4 max-w-6xl mx-auto">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card 
                key={index} 
                className={`${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-center">
                    <div className={`${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-lg ${isToday ? 'text-primary font-bold' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={event.id || eventIndex}
                      className="text-xs p-1 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => onEventSelect(event)}
                    >
                      <div className="font-medium line-clamp-1">{event.summary}</div>
                      {event.start.dateTime && (
                        <div className="opacity-70">
                          {formatEventTime(event)}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Month view
  const weeksInMonth = Math.ceil(days.length / 7);
  const weeks = Array.from({ length: weeksInMonth }, (_, weekIndex) =>
    days.slice(weekIndex * 7, (weekIndex + 1) * 7)
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isToday = isSameDay(day, new Date());
                
                return (
                  <Card 
                    key={dayIndex}
                    className={`min-h-[100px] ${!isCurrentMonth ? 'opacity-50' : ''} ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-2 h-full">
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={event.id || eventIndex}
                            className="text-xs p-1 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20 transition-colors line-clamp-1"
                            onClick={() => onEventSelect(event)}
                          >
                            {event.summary}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}