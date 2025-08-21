import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

interface GoogleCalendarHeaderProps {
  currentDate: Date;
  onToday: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function GoogleCalendarHeader({
  currentDate,
  onToday,
  onPreviousMonth,
  onNextMonth,
  searchQuery,
  onSearchChange
}: GoogleCalendarHeaderProps) {
  const { isConnected, connectGoogle, isConnecting } = useGoogleAuth();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const currentMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
      {/* Left Side - Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onToday}
          className="font-medium"
        >
          Hoje
        </Button>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h1 className="text-xl font-medium text-foreground ml-4">
          {currentMonthYear}
        </h1>
      </div>

      {/* Right Side - Search and Google */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        {!isConnected ? (
          <Button 
            onClick={connectGoogle} 
            variant="default"
            disabled={isConnecting}
            className="bg-primary hover:bg-primary/90"
          >
            {isConnecting ? 'Conectando...' : 'Conectar Google'}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Google conectado
          </div>
        )}
      </div>
    </div>
  );
}