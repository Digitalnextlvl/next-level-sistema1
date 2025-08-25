import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateVenda, type Venda } from "@/hooks/useVendas";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface QuickStatusChangerProps {
  venda: Venda;
  disabled?: boolean;
  size?: "sm" | "default";
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "fechada":
      return "Fechada";
    case "negociacao":
      return "Negociação";
    case "proposta":
      return "Proposta";
    case "perdida":
      return "Perdida";
    default:
      return status;
  }
};

export function QuickStatusChanger({ venda, disabled, size = "default" }: QuickStatusChangerProps) {
  const updateVenda = useUpdateVenda();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === venda.status) return;
    
    updateVenda.mutate({
      id: venda.id,
      cliente_id: venda.cliente_id,
      valor: venda.valor,
      status: newStatus as "proposta" | "negociacao" | "fechada" | "perdida",
      descricao: venda.descricao,
      data_venda: venda.data_venda,
      forma_pagamento: venda.forma_pagamento,
      parcelas: venda.parcelas,
    });
  };

  const sizeClasses = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <Select 
      value={venda.status} 
      onValueChange={handleStatusChange}
      disabled={disabled || updateVenda.isPending}
    >
      <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0">
        <div className={`bg-black text-white rounded-full cursor-pointer hover:bg-black/80 transition-colors flex items-center gap-1.5 ${sizeClasses}`}>
          <span className="font-medium">{getStatusLabel(venda.status)}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </div>
      </SelectTrigger>
      <SelectContent 
        className="min-w-[120px] bg-background border shadow-lg z-50"
        align="end"
        sideOffset={4}
      >
        <SelectItem 
          value="proposta" 
          className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          Proposta
        </SelectItem>
        <SelectItem 
          value="negociacao" 
          className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          Negociação
        </SelectItem>
        <SelectItem 
          value="fechada" 
          className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          Fechada
        </SelectItem>
        <SelectItem 
          value="perdida" 
          className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          Perdida
        </SelectItem>
      </SelectContent>
    </Select>
  );
}