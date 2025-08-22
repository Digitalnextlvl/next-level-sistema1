import { EventoUnificado } from "@/hooks/useAgendaUnificada";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { format, isToday, isTomorrow, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface EventListViewProps {
  events: EventoUnificado[];
  onEventSelect: (event: EventoUnificado) => void;
  dateRange?: DateRange;
}

export function EventListView({ events, onEventSelect, dateRange }: EventListViewProps) {
  
  // Filter events by date range if provided
  const filteredEvents = events.filter(event => {
    if (!dateRange?.from) return true;
    
    const eventDate = new Date(event.data_inicio);
    const startDate = dateRange.from;
    const endDate = dateRange.to || dateRange.from;
    
    return eventDate >= startDate && eventDate <= endDate;
  });

  // Sort events by date
  const sortedEvents = filteredEvents.sort((a, b) => {
    const dateA = new Date(a.data_inicio);
    const dateB = new Date(b.data_inicio);
    return dateA.getTime() - dateB.getTime();
  });

  // Group events by date
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const eventDate = new Date(event.data_inicio);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: eventDate,
        events: []
      };
    }
    
    acc[dateKey].events.push(event);
    return acc;
  }, {} as Record<string, { date: Date; events: EventoUnificado[] }>);

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isYesterday(date)) return "Ontem";
    if (isThisWeek(date)) return format(date, "EEEE", { locale: ptBR });
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  const formatEventTime = (event: EventoUnificado) => {
    const start = format(new Date(event.data_inicio), 'HH:mm');
    const end = event.data_fim ? format(new Date(event.data_fim), 'HH:mm') : '';
    
    // Check if it's an all-day event (same date, time is 00:00)
    const startDate = new Date(event.data_inicio);
    const endDate = event.data_fim ? new Date(event.data_fim) : startDate;
    const isAllDay = startDate.getHours() === 0 && startDate.getMinutes() === 0 && 
                    endDate.getHours() === 0 && endDate.getMinutes() === 0;
    
    if (isAllDay) return "Dia inteiro";
    return end ? `${start} - ${end}` : start;
  };

  const getEventStatus = (event: EventoUnificado) => {
    const now = new Date();
    const startTime = new Date(event.data_inicio);
    const endTime = event.data_fim ? new Date(event.data_fim) : startTime;
    
    // Check if it's all day
    const isAllDay = startTime.getHours() === 0 && startTime.getMinutes() === 0 && 
                    endTime.getHours() === 0 && endTime.getMinutes() === 0;
    
    if (isAllDay) return 'allday';
    if (now >= startTime && now <= endTime) return 'ongoing';
    if (now > endTime) return 'past';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'past':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'allday':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default:
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Em andamento';
      case 'past':
        return 'Finalizado';
      case 'allday':
        return 'Dia inteiro';
      default:
        return 'Agendado';
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground">
            {dateRange ? 'Nenhum evento no período selecionado' : 'Não há eventos para exibir'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-8 max-w-5xl mx-auto p-6">
        {Object.values(groupedEvents).map(({ date, events }) => (
          <div key={format(date, 'yyyy-MM-dd')} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-4 pb-3 border-b border-calendar-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-calendar-event-blue"></div>
                <h3 className="text-xl font-semibold text-foreground">
                  {formatEventDate(date)}
                </h3>
                <div className="text-sm text-muted-foreground font-medium">
                  {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="ml-auto px-3 py-1 border-calendar-border text-muted-foreground"
              >
                {events.length} evento{events.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Events for this date */}
            <div className="space-y-3">
              {events.map((event, index) => {
                const status = getEventStatus(event);
                
                return (
                  <div
                    key={event.id || index}
                    className="bg-background border border-calendar-border rounded-lg p-5 hover:shadow-md hover:border-calendar-event-blue/40 transition-all cursor-pointer calendar-event"
                    onClick={() => onEventSelect(event)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-16 rounded-full ${
                        event.tipo === 'google' ? 'bg-calendar-event-green' : 'bg-calendar-event-blue'
                      }`}></div>
                      <div className="flex-1 space-y-3">
                        {/* Event Title & Description */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg text-foreground line-clamp-2">{event.titulo}</h4>
                          {event.descricao && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.descricao}
                            </p>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
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
                          
                          {event.tipo && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{event.tipo === 'google' ? 'Google Calendar' : 'Evento Local'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="outline" 
                          className={`px-3 py-1 text-xs font-medium ${
                            status === 'ongoing' ? 'border-calendar-event-green text-calendar-event-green bg-calendar-event-green/10' :
                            status === 'past' ? 'border-muted-foreground text-muted-foreground bg-muted/10' :
                            status === 'allday' ? 'border-calendar-event-purple text-calendar-event-purple bg-calendar-event-purple/10' :
                            'border-calendar-event-blue text-calendar-event-blue bg-calendar-event-blue/10'
                          }`}
                        >
                          {getStatusLabel(status)}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 h-8 w-8 hover:bg-muted/50"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}