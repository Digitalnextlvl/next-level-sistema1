import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Calendar, Clock, MapPin, Users, RefreshCw, Loader2, Timer, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const GoogleCalendarWidget = () => {
  const { events, isLoading, error, fetchEvents, getUpcomingEvents, getTodayEvents } = useGoogleCalendar();

  const todayEvents = getTodayEvents();
  const upcomingEvents = getUpcomingEvents(7);
  
  const formatEventDate = (event: any) => {
    const startDate = parseISO(event.start.dateTime || event.start.date);
    
    if (isToday(startDate)) {
      return 'Hoje';
    } else if (isTomorrow(startDate)) {
      return 'Amanhã';
    } else {
      return format(startDate, 'EEEE, dd/MM', { locale: ptBR });
    }
  };

  const formatEventTime = (event: any) => {
    if (!event.start.dateTime) return null;
    const startTime = parseISO(event.start.dateTime);
    return format(startTime, 'HH:mm');
  };

  const formatEventDuration = (event: any) => {
    if (!event.start.dateTime || !event.end.dateTime) return null;
    const startTime = parseISO(event.start.dateTime);
    const endTime = parseISO(event.end.dateTime);
    const duration = differenceInMinutes(endTime, startTime);
    
    if (duration < 60) {
      return `${duration}min`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  };

  const getEventStatus = (event: any) => {
    if (!event.start.dateTime) return 'allday';
    const startTime = parseISO(event.start.dateTime);
    const endTime = parseISO(event.end.dateTime);
    const now = new Date();
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'past': return 'bg-gray-400';
      default: return 'bg-purple-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing': return 'Acontecendo';
      case 'upcoming': return 'Próximo';
      case 'past': return 'Finalizado';
      default: return 'Dia todo';
    }
  };

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua conta Google para ver seus eventos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Próximos Eventos
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchEvents}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Eventos de Hoje */}
            {todayEvents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm text-primary">Hoje</h3>
                </div>
                {todayEvents.map(event => {
                  const status = getEventStatus(event);
                  return (
                    <div key={event.id} className="relative group">
                      <div className="flex items-start gap-3 p-4 rounded-xl border-2 bg-gradient-to-r from-card to-card/80 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-primary/30">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(status)} border-2 border-white shadow-sm`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm leading-tight">
                              {event.summary || 'Sem título'}
                            </h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              {formatEventTime(event) && (
                                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                  <Clock className="h-3 w-3" />
                                  {formatEventTime(event)}
                                </span>
                              )}
                              {formatEventDuration(event) && (
                                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                  <Timer className="h-3 w-3" />
                                  {formatEventDuration(event)}
                                </span>
                              )}
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3 text-primary" />
                                <span>{event.attendees.length} participante{event.attendees.length > 1 ? 's' : ''}</span>
                              </div>
                            )}

                            {event.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded-md">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Separador se houver eventos de hoje e próximos eventos */}
            {todayEvents.length > 0 && upcomingEvents.filter(event => !isToday(parseISO(event.start.dateTime || event.start.date))).length > 0 && (
              <Separator className="my-4" />
            )}

            {/* Próximos Eventos */}
            {upcomingEvents.filter(event => !isToday(parseISO(event.start.dateTime || event.start.date))).length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm text-muted-foreground">Próximos</h3>
                </div>
                {upcomingEvents
                  .filter(event => !isToday(parseISO(event.start.dateTime || event.start.date)))
                  .map(event => {
                    const status = getEventStatus(event);
                    return (
                      <div key={event.id} className="group">
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all duration-200 hover:shadow-sm hover:border-primary/20">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate mb-1">
                              {event.summary || 'Sem título'}
                            </h4>
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatEventDate(event)}
                                {formatEventTime(event) && ` às ${formatEventTime(event)}`}
                              </span>
                              {formatEventDuration(event) && (
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {formatEventDuration(event)}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {event.location && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{event.location}</span>
                                </span>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{event.attendees.length}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhum evento encontrado nos próximos 7 dias
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
};