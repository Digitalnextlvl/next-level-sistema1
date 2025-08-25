import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateVenda, type Venda } from "@/hooks/useVendas";
import { Badge } from "@/components/ui/badge";

interface QuickStatusChangerProps {
  venda: Venda;
  disabled?: boolean;
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

export function QuickStatusChanger({ venda, disabled }: QuickStatusChangerProps) {
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

  return (
    <Select 
      value={venda.status} 
      onValueChange={handleStatusChange}
      disabled={disabled || updateVenda.isPending}
    >
      <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0">
        <Badge className="bg-black text-white cursor-pointer hover:bg-black/80">
          {getStatusLabel(venda.status)}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="proposta" className="cursor-pointer">Proposta</SelectItem>
        <SelectItem value="negociacao" className="cursor-pointer">Negociação</SelectItem>
        <SelectItem value="fechada" className="cursor-pointer">Fechada</SelectItem>
        <SelectItem value="perdida" className="cursor-pointer">Perdida</SelectItem>
      </SelectContent>
    </Select>
  );
}