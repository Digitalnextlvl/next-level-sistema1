import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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

  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'list': return 'Lista';
      case 'day': return 'Dia';
      case 'week': return 'Semana';
      case 'month': return 'Mês';
      default: return 'Lista';
    }
  };

  return (
    <div className="border-b border-calendar-border bg-background">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        {/* Left Section - Hoje + Date Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="flex-shrink-0 px-3 py-2 font-medium border-calendar-border hover:bg-muted/50 text-xs sm:text-sm"
          >
            Hoje
          </Button>
          
          {viewMode !== 'list' && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="flex-shrink-0 p-1.5 hover:bg-muted/50 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('next')}
                className="flex-shrink-0 p-1.5 hover:bg-muted/50 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="text-base sm:text-lg font-semibold text-foreground min-w-[140px] sm:min-w-[200px]">
            {getDateLabel()}
          </div>
        </div>

        {/* Right Section - View Mode Dropdown + Search */}
        <div className="flex items-center gap-3">
          {/* View Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-calendar-border hover:bg-muted/50"
              >
                {getViewModeLabel(viewMode)}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-32 bg-background border-calendar-border shadow-lg z-50"
            >
              <DropdownMenuItem
                onClick={() => onViewModeChange('list')}
                className={`cursor-pointer ${viewMode === 'list' ? 'bg-muted' : ''}`}
              >
                Lista
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onViewModeChange('day')}
                className={`cursor-pointer ${viewMode === 'day' ? 'bg-muted' : ''}`}
              >
                Dia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onViewModeChange('week')}
                className={`cursor-pointer ${viewMode === 'week' ? 'bg-muted' : ''}`}
              >
                Semana
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onViewModeChange('month')}
                className={`cursor-pointer ${viewMode === 'month' ? 'bg-muted' : ''}`}
              >
                Mês
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-32 sm:w-48 lg:w-64 border-calendar-border text-sm"
            />
          </div>
          
          {/* Date Range Picker for List View */}
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