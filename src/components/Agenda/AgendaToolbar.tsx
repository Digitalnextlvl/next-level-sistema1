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
    <div className="border-b border-calendar-border bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 gap-3 sm:gap-4">
        {/* Left Section - Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="flex-shrink-0 px-3 lg:px-4 py-2 font-medium border-calendar-border hover:bg-muted/50 text-xs sm:text-sm"
          >
            Hoje
          </Button>
          
          {viewMode !== 'list' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="flex-shrink-0 p-1.5 lg:p-2 hover:bg-muted/50 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('next')}
                className="flex-shrink-0 p-1.5 lg:p-2 hover:bg-muted/50 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <div className="ml-2 sm:ml-3 lg:ml-4 text-base sm:text-lg lg:text-xl font-semibold text-foreground min-w-[120px] sm:min-w-[150px] lg:min-w-[200px]">
                {getDateLabel()}
              </div>
            </div>
          )}
        </div>

        {/* Center Section - View Mode */}
        <div className="flex items-center gap-0 bg-muted/50 rounded-lg p-1 border border-calendar-border order-3 sm:order-2">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${
              viewMode === 'list' 
                ? 'bg-background shadow-sm border border-calendar-border' 
                : 'hover:bg-background/60'
            }`}
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className={`px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${
              viewMode === 'day' 
                ? 'bg-background shadow-sm border border-calendar-border' 
                : 'hover:bg-background/60'
            }`}
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className={`px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${
              viewMode === 'week' 
                ? 'bg-background shadow-sm border border-calendar-border' 
                : 'hover:bg-background/60'
            }`}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            className={`px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium rounded-md ${
              viewMode === 'month' 
                ? 'bg-background shadow-sm border border-calendar-border' 
                : 'hover:bg-background/60'
            }`}
          >
            Mês
          </Button>
        </div>

        {/* Right Section - Search & Filter */}
        <div className="flex items-center gap-2 lg:gap-3 order-2 sm:order-3">
          {/* Mobile Search */}
          <div className="relative sm:hidden flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-calendar-border text-sm"
            />
          </div>
          
          {/* Desktop Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-40 sm:w-48 lg:w-72 border-calendar-border"
            />
          </div>
          
          {viewMode === 'list' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={onDateRangeChange}
              className="w-auto hidden md:block"
            />
          )}
        </div>
      </div>
    </div>
  );
}