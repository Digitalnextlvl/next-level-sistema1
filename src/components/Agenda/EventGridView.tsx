import { EventoUnificado } from "@/hooks/useAgendaUnificada";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type ViewMode = 'day' | 'week' | 'month';

interface EventGridViewProps {
  events: EventoUnificado[];
  viewMode: ViewMode;
  selectedDate: Date;
  onEventSelect: (event: EventoUnificado) => void;
}

export function EventGridView({ events, viewMode, selectedDate, onEventSelect }: EventGridViewProps) {
  const isMobile = useIsMobile();
  
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
      const eventDate = new Date(event.data_inicio);
      return isSameDay(eventDate, day);
    });
  };

  const formatEventTime = (event: EventoUnificado) => {
    const startDate = new Date(event.data_inicio);
    const isAllDay = startDate.getHours() === 0 && startDate.getMinutes() === 0;
    
    if (isAllDay) return "Dia inteiro";
    return format(startDate, 'HH:mm');
  };

  const days = getDaysToShow();

  if (viewMode === 'day') {
    const dayEvents = getEventsForDay(selectedDate);
    
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-foreground">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''} agendado{dayEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {dayEvents.length === 0 ? (
            <div className="bg-background border border-calendar-border rounded-lg">
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground">Nenhum evento para hoje</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Que tal adicionar um novo evento?</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {dayEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="bg-background border border-calendar-border rounded-lg p-5 hover:shadow-md hover:border-calendar-event-blue/40 transition-all cursor-pointer calendar-event"
                  onClick={() => onEventSelect(event)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-12 bg-calendar-event-blue rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-foreground mb-2">{event.titulo}</h4>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{formatEventTime(event)}</span>
                        </div>
                        {event.local && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.local}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`px-3 py-1 ${formatEventTime(event) !== 'Dia inteiro' ? 'border-calendar-event-blue text-calendar-event-blue' : 'border-calendar-event-green text-calendar-event-green'}`}
                    >
                      {formatEventTime(event) !== 'Dia inteiro' ? 'Horário' : 'Dia inteiro'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'week') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className={`p-3 sm:p-6`}>
          {isMobile ? (
            // Mobile: Single column list
            <div className="space-y-3">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={index} className="bg-background border border-calendar-border rounded-lg overflow-hidden">
                    <div className="p-3 border-b border-calendar-border bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm font-medium ${isToday ? 'text-calendar-today' : 'text-foreground'}`}>
                            {format(day, 'EEEE', { locale: ptBR })}
                          </div>
                          <div className={`text-xs text-muted-foreground ${isToday ? 'text-calendar-today/70' : ''}`}>
                            {format(day, 'd MMM', { locale: ptBR })}
                          </div>
                        </div>
                        {isToday && <Badge variant="outline" className="text-xs">Hoje</Badge>}
                      </div>
                    </div>
                    <div className="p-3">
                      {dayEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">Nenhum evento</p>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.map((event, eventIndex) => (
                            <div
                              key={event.id || eventIndex}
                              className="p-2 bg-calendar-event-blue/10 border-l-2 border-calendar-event-blue rounded-sm cursor-pointer hover:bg-calendar-event-blue/20 transition-colors"
                              onClick={() => onEventSelect(event)}
                            >
                              <div className="font-medium text-sm text-calendar-event-blue">{event.titulo}</div>
                              {formatEventTime(event) !== 'Dia inteiro' && (
                                <div className="text-xs text-calendar-event-blue/70 mt-1">
                                  {formatEventTime(event)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Desktop: Grid layout
            <div className="grid grid-cols-7 gap-1 max-w-7xl mx-auto bg-background rounded-lg border border-calendar-border overflow-hidden">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[160px] border-r border-calendar-border last:border-r-0 ${
                      isToday ? 'bg-calendar-today/5' : 'bg-background hover:bg-muted/30'
                    } transition-colors`}
                  >
                    <div className="p-3 border-b border-calendar-border bg-muted/20">
                      <div className="text-center">
                        <div className={`text-xs font-medium uppercase tracking-wide ${
                          isToday ? 'text-calendar-today' : 'text-muted-foreground'
                        }`}>
                          {format(day, 'EEE', { locale: ptBR })}
                        </div>
                        <div className={`text-lg font-semibold mt-1 ${
                          isToday 
                            ? 'text-calendar-today bg-calendar-today/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto' 
                            : 'text-foreground'
                        }`}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {dayEvents.slice(0, 4).map((event, eventIndex) => (
                        <div
                          key={event.id || eventIndex}
                          className="text-xs p-2 bg-calendar-event-blue/10 border-l-2 border-calendar-event-blue rounded-sm cursor-pointer hover:bg-calendar-event-blue/20 transition-colors"
                          onClick={() => onEventSelect(event)}
                        >
                          <div className="font-medium line-clamp-1 text-calendar-event-blue">{event.titulo}</div>
                          {formatEventTime(event) !== 'Dia inteiro' && (
                            <div className="text-calendar-event-blue/70 mt-1">
                              {formatEventTime(event)}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div className="text-xs text-muted-foreground text-center py-1 font-medium">
                          +{dayEvents.length - 4} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
    <div className="flex-1 overflow-y-auto">
      <div className={`p-3 sm:p-6`}>
        <div className="max-w-7xl mx-auto">
          {isMobile ? (
            // Mobile: Single column week view
            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="space-y-2">
                  {week.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                    const isToday = isSameDay(day, new Date());
                    
                    if (!isCurrentMonth && dayEvents.length === 0) return null;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`bg-background border border-calendar-border rounded-lg p-3 ${
                          !isCurrentMonth ? 'opacity-60' : ''
                        } ${isToday ? 'bg-calendar-today/5 border-calendar-today/30' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-calendar-today' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {format(day, 'EEE, d MMM', { locale: ptBR })}
                          </div>
                          {isToday && <Badge variant="outline" className="text-xs">Hoje</Badge>}
                        </div>
                        
                        {dayEvents.length === 0 ? (
                          isCurrentMonth && <p className="text-xs text-muted-foreground">Nenhum evento</p>
                        ) : (
                          <div className="space-y-1">
                            {dayEvents.map((event, eventIndex) => (
                              <div
                                key={event.id || eventIndex}
                                className="text-xs p-2 bg-calendar-event-blue/10 border-l-2 border-calendar-event-blue rounded-sm cursor-pointer hover:bg-calendar-event-blue/20 transition-colors"
                                onClick={() => onEventSelect(event)}
                              >
                                <div className="font-medium text-calendar-event-blue">
                                  {event.titulo}
                                </div>
                                {formatEventTime(event) !== 'Dia inteiro' && (
                                  <div className="text-calendar-event-blue/70 mt-1">
                                    {formatEventTime(event)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Grid layout
            <>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-0 mb-0 bg-background border border-calendar-border rounded-t-lg overflow-hidden">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-4 border-r border-calendar-border last:border-r-0 bg-muted/30">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="border border-t-0 border-calendar-border rounded-b-lg overflow-hidden bg-background">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-0 border-b border-calendar-border last:border-b-0">
                    {week.map((day, dayIndex) => {
                      const dayEvents = getEventsForDay(day);
                      const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`min-h-[120px] border-r border-calendar-border last:border-r-0 p-2 hover:bg-muted/20 transition-colors ${
                            !isCurrentMonth ? 'opacity-40 bg-muted/10' : ''
                          } ${isToday ? 'bg-calendar-today/5' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-2 ${
                            isToday 
                              ? 'text-calendar-today bg-calendar-today/10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold' 
                              : isCurrentMonth 
                                ? 'text-foreground' 
                                : 'text-muted-foreground'
                          }`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event, eventIndex) => (
                              <div
                                key={event.id || eventIndex}
                                className="text-xs p-1.5 bg-calendar-event-blue/10 border-l-2 border-calendar-event-blue rounded-sm cursor-pointer hover:bg-calendar-event-blue/20 transition-colors"
                                onClick={() => onEventSelect(event)}
                              >
                                <div className="line-clamp-1 font-medium text-calendar-event-blue">
                                  {event.titulo}
                                </div>
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
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}