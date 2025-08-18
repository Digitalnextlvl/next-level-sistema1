import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Filter, Download, FileText, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FiltrosRelatorioProps {
  onPeriodoChange?: (periodo: DateRange | undefined) => void;
  onTipoChange?: (tipo: string) => void;
  onExportar?: (formato: 'pdf' | 'excel') => void;
  mostrarFiltros: boolean;
  onToggleFiltros: () => void;
}

export function FiltrosRelatorio({
  onPeriodoChange,
  onTipoChange,
  onExportar,
  mostrarFiltros,
  onToggleFiltros
}: FiltrosRelatorioProps) {
  const [periodo, setPeriodo] = useState<DateRange | undefined>();
  const [tipo, setTipo] = useState<string>("");

  const handlePeriodoChange = (novaRange: DateRange | undefined) => {
    setPeriodo(novaRange);
    onPeriodoChange?.(novaRange);
  };

  const handleTipoChange = (novoTipo: string) => {
    setTipo(novoTipo);
    onTipoChange?.(novoTipo);
  };

  const limparFiltros = () => {
    setPeriodo(undefined);
    setTipo("");
    onPeriodoChange?.(undefined);
    onTipoChange?.("");
  };

  const temFiltrosAtivos = periodo || tipo;

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onToggleFiltros}
            className={mostrarFiltros ? "bg-primary text-primary-foreground" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {temFiltrosAtivos && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
          
          {temFiltrosAtivos && (
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => onExportar?.('pdf')}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => onExportar?.('excel')}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Painel de filtros */}
      {mostrarFiltros && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <DatePickerWithRange 
                  date={periodo}
                  onDateChange={handlePeriodoChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select value={tipo} onValueChange={handleTipoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="clientes">Clientes</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Formato</label>
                <Select defaultValue="mensal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros ativos */}
            {temFiltrosAtivos && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                  
                  {periodo && (
                    <Badge variant="secondary">
                      Período: {periodo.from?.toLocaleDateString()} - {periodo.to?.toLocaleDateString()}
                    </Badge>
                  )}
                  
                  {tipo && (
                    <Badge variant="secondary">
                      Tipo: {tipo}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}