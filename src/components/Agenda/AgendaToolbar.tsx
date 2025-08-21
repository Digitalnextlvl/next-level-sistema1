import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { GoogleConnect } from "@/components/Dashboard/GoogleConnect";
import { Search, Calendar, List, Grid3x3, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

type ViewMode = 'day' | 'week' | 'month' | 'list';

interface AgendaToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function AgendaToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  selectedDate,
  onDateChange
}: AgendaToolbarProps) {
  
  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate = selectedDate;
    
    if (direction === 'prev') {
      switch (viewMode) {
        case 'day':
          newDate = subDays(selectedDate, 1);
          break;
        case 'week':
          newDate = subWeeks(selectedDate, 1);
          break;
        case 'month':
          newDate = subMonths(selectedDate, 1);
          break;
      }
    } else {
      switch (viewMode) {
        case 'day':
          newDate = addDays(selectedDate, 1);
          break;
        case 'week':
          newDate = addWeeks(selectedDate, 1);
          break;
        case 'month':
          newDate = addMonths(selectedDate, 1);
          break;
      }
    }
    
    onDateChange(newDate);
  };

  const getDateLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = subDays(selectedDate, selectedDate.getDay());
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      default:
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4 gap-4">
        {/* Left Section - Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            Hoje
          </Button>
          
          {viewMode !== 'list' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="min-w-0 text-sm font-medium">
                {getDateLabel()}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Center Section - View Mode */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-3"
          >
            <List className="w-4 h-4 mr-1" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className="px-3"
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className="px-3"
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            className="px-3"
          >
            Mês
          </Button>
        </div>

        {/* Right Section - Search, Filter & Connect */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          {viewMode === 'list' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={onDateRangeChange}
              className="w-auto"
            />
          )}
          
          <GoogleConnect />
        </div>
      </div>
    </div>
  );
}