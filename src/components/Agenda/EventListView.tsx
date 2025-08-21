import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { format, isToday, isTomorrow, isYesterday, isThisWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface EventListViewProps {
  events: GoogleCalendarEvent[];
  onEventSelect: (event: GoogleCalendarEvent) => void;
  dateRange?: DateRange;
}

export function EventListView({ events, onEventSelect, dateRange }: EventListViewProps) {
  
  // Filter events by date range if provided
  const filteredEvents = events.filter(event => {
    if (!dateRange?.from) return true;
    
    const eventDate = new Date(event.start.dateTime || event.start.date || '');
    const startDate = dateRange.from;
    const endDate = dateRange.to || dateRange.from;
    
    return eventDate >= startDate && eventDate <= endDate;
  });

  // Sort events by date
  const sortedEvents = filteredEvents.sort((a, b) => {
    const dateA = new Date(a.start.dateTime || a.start.date || '');
    const dateB = new Date(b.start.dateTime || b.start.date || '');
    return dateA.getTime() - dateB.getTime();
  });

  // Group events by date
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const eventDate = new Date(event.start.dateTime || event.start.date || '');
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: eventDate,
        events: []
      };
    }
    
    acc[dateKey].events.push(event);
    return acc;
  }, {} as Record<string, { date: Date; events: GoogleCalendarEvent[] }>);

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isYesterday(date)) return "Ontem";
    if (isThisWeek(date)) return format(date, "EEEE", { locale: ptBR });
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (!event.start.dateTime) return "Dia inteiro";
    
    const start = format(new Date(event.start.dateTime), 'HH:mm');
    const end = event.end.dateTime ? format(new Date(event.end.dateTime), 'HH:mm') : '';
    
    return end ? `${start} - ${end}` : start;
  };

  const getEventStatus = (event: GoogleCalendarEvent) => {
    if (!event.start.dateTime) return 'allday';
    
    const now = new Date();
    const startTime = new Date(event.start.dateTime);
    const endTime = event.end.dateTime ? new Date(event.end.dateTime) : startTime;
    
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
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Calendar className="w-12 h-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="font-medium">Nenhum evento encontrado</h3>
              <p className="text-sm text-muted-foreground">
                {dateRange ? 'Nenhum evento no período selecionado' : 'Não há eventos para exibir'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        {Object.values(groupedEvents).map(({ date, events }) => (
          <div key={format(date, 'yyyy-MM-dd')} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">
                {formatEventDate(date)}
              </h3>
              <div className="text-sm text-muted-foreground">
                {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <Badge variant="outline" className="ml-auto">
                {events.length} evento{events.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Events for this date */}
            <div className="space-y-3">
              {events.map((event, index) => {
                const status = getEventStatus(event);
                
                return (
                  <Card 
                    key={event.id || index} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onEventSelect(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Event Title & Status */}
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium line-clamp-2">{event.summary}</h4>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(status)}`}
                            >
                              {getStatusLabel(status)}
                            </Badge>
                          </div>

                          {/* Event Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                            
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.attendees.length} participante{event.attendees.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}