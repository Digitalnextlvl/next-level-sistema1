import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, WifiOff, Calendar, ExternalLink } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { EventoUnificado } from "@/hooks/useAgendaUnificada";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

interface GoogleCalendarGridProps {
  events: EventoUnificado[];
  currentDate: Date;
  isLoading: boolean;
  error: string | null;
  onUpdateEvent?: (id: string, updates: any, syncToGoogle?: boolean) => Promise<void>;
  onDeleteEvent?: (id: string, deleteFromGoogle?: boolean) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function GoogleCalendarGrid({ 
  events, 
  currentDate, 
  isLoading, 
  error,
  onUpdateEvent,
  onDeleteEvent,
  onRefresh
}: GoogleCalendarGridProps) {
  const { isConnected, connectGoogle, isConnecting, isCheckingConnection } = useGoogleAuth();

  // Generate calendar grid (6 weeks x 7 days)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the starting day (previous month's days to fill the grid)
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startingDayOfWeek);
    
    // Generate 42 days (6 weeks)
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const getEventsForDay = (day: Date): EventoUnificado[] => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const eventStart = new Date(event.data_inicio);
      const eventEnd = new Date(event.data_fim);
      
      // Event spans this day if it starts before day ends and ends after day starts
      return (eventStart <= dayEnd && eventEnd >= dayStart);
    });
  };

  const formatEventTime = (event: EventoUnificado): string => {
    try {
      const date = new Date(event.data_inicio);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
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

  if (isCheckingConnection) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Verificando conexão...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <WifiOff className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium mb-2">Google Calendar não conectado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua conta Google para sincronizar eventos
            </p>
            <Button onClick={connectGoogle}>
              Conectar Google Calendar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-px bg-border">
        {/* Calendar Header */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="bg-background p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar Days with Skeleton */}
        {Array.from({ length: 42 }).map((_, index) => (
          <div key={index} className="bg-background p-2 h-32">
            <Skeleton className="h-6 w-6 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-medium mb-2">Erro ao carregar eventos</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {/* Calendar Header */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="bg-muted p-3 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDate = isToday(day);
          const isInCurrentMonth = isCurrentMonth(day);

          return (
            <div
              key={index}
              className={cn(
                "bg-background p-2 min-h-32 relative",
                !isInCurrentMonth ? 'text-muted-foreground bg-muted/30' : '',
                isTodayDate ? 'ring-2 ring-primary ring-inset' : ''
              )}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isTodayDate 
                    ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs' 
                    : ''
                )}>
                  {day.getDate()}
                </span>
                {dayEvents.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dayEvents.length - 3}
                  </Badge>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.cor }}
                    title={`${event.titulo}${event.local ? ` - ${event.local}` : ''}`}
                  >
                    {event.titulo}
                    {event.tipo === 'google' && (
                      <span className="ml-1 opacity-75">📅</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events List for Mobile/Better View */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          Eventos de {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum evento encontrado para este período.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                evento={event}
                onUpdate={onUpdateEvent}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}