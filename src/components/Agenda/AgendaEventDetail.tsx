import { GoogleCalendarEvent } from "@/hooks/useGoogleCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Calendar, Clock, MapPin, Users, Link, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaEventDetailProps {
  event: GoogleCalendarEvent;
  onClose: () => void;
}

export function AgendaEventDetail({ event, onClose }: AgendaEventDetailProps) {
  const formatEventDate = (event: GoogleCalendarEvent) => {
    const startDate = new Date(event.start.dateTime || event.start.date || '');
    
    if (!event.start.dateTime) {
      return format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    
    const endDate = event.end.dateTime ? new Date(event.end.dateTime) : null;
    const dateStr = format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    
    if (endDate && !isSameDay(startDate, endDate)) {
      return `${dateStr} - ${format(endDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    
    return dateStr;
  };

  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (!event.start.dateTime) return "Dia inteiro";
    
    const start = format(new Date(event.start.dateTime), 'HH:mm', { locale: ptBR });
    const end = event.end.dateTime ? format(new Date(event.end.dateTime), 'HH:mm', { locale: ptBR }) : '';
    
    return end ? `${start} - ${end}` : start;
  };

  const getEventDuration = () => {
    if (!event.start.dateTime || !event.end.dateTime) return null;
    
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? `${diffMinutes}min` : ''}`;
    }
    
    return `${diffMinutes}min`;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getEventStatus = () => {
    if (!event.start.dateTime) return { status: 'allday', label: 'Dia inteiro', color: 'bg-blue-500/10 text-blue-700' };
    
    const now = new Date();
    const startTime = new Date(event.start.dateTime);
    const endTime = event.end.dateTime ? new Date(event.end.dateTime) : startTime;
    
    if (now >= startTime && now <= endTime) {
      return { status: 'ongoing', label: 'Em andamento', color: 'bg-green-500/10 text-green-700' };
    }
    if (now > endTime) {
      return { status: 'past', label: 'Finalizado', color: 'bg-gray-500/10 text-gray-700' };
    }
    return { status: 'upcoming', label: 'Agendado', color: 'bg-orange-500/10 text-orange-700' };
  };

  const status = getEventStatus();
  const duration = getEventDuration();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Detalhes do Evento</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Event Title & Status */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg leading-tight">{event.summary}</h3>
                <Badge className={`${status.color} border`}>
                  {status.label}
                </Badge>
              </div>
              
              {event.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">Data</div>
                <div className="text-sm text-muted-foreground">
                  {formatEventDate(event)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">Horário</div>
                <div className="text-sm text-muted-foreground">
                  {formatEventTime(event)}
                  {duration && (
                    <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                      {duration}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Local</div>
                    <div className="text-sm text-muted-foreground break-words">
                      {event.location}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      Participantes ({event.attendees.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {event.attendees.slice(0, 5).map((attendee, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {attendee.displayName || attendee.email}
                        </div>
                      ))}
                      {event.attendees.length > 5 && (
                        <div className="text-xs text-muted-foreground">
                          +{event.attendees.length - 5} mais
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Link className="w-4 h-4 mr-2" />
              Abrir no Google Calendar
            </Button>
            
            {event.location && (
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="w-4 h-4 mr-2" />
                Ver no Google Maps
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}