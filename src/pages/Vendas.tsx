import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, DollarSign, Calendar, Building2, Edit, Trash2, TrendingUp } from "lucide-react";
import { useVendas, type Venda } from "@/hooks/useVendas";
import { VendaDialog } from "@/components/Vendas/VendaDialog";
import { DeleteVendaDialog } from "@/components/Vendas/DeleteVendaDialog";
import { QuickStatusChanger } from "@/components/Vendas/QuickStatusChanger";
const getStatusColor = (status: string) => {
  return "bg-black text-white";
};
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
export default function Vendas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Venda | undefined>();
  const {
    data: vendas = [],
    isLoading,
    error
  } = useVendas(searchTerm);
  const handleEditVenda = (venda: Venda) => {
    setSelectedVenda(venda);
    setDialogOpen(true);
  };
  const handleDeleteVenda = (venda: Venda) => {
    setSelectedVenda(venda);
    setDeleteDialogOpen(true);
  };
  const handleNewVenda = () => {
    navigate("/vendas/nova");
  };

  // Calcular estatísticas
  const totalVendas = vendas.reduce((sum, venda) => sum + venda.valor, 0);
  const vendasFechadas = vendas.filter(venda => venda.status === 'fechada').length;
  const vendasNegociacao = vendas.filter(venda => venda.status === 'negociacao').length;
  if (error) {
    return <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar vendas: {error.message}</p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Vendas</h1>
        <Button className="gradient-premium border-0 text-background w-full sm:w-auto" onClick={handleNewVenda}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {/* Stats rápidas */}
      

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar vendas..." className="pl-10 text-sm sm:text-base" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? <div className="space-y-4">
              {Array.from({
            length: 3
          }).map((_, i) => <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </Card>)}
            </div> : vendas.length === 0 ? <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Não encontramos vendas com os termos buscados." : "Comece adicionando sua primeira venda."}
              </p>
              {!searchTerm && <Button className="gradient-premium border-0 text-background" onClick={handleNewVenda}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Venda
                </Button>}
            </div> : <div className="space-y-4">
              {vendas.map(venda => <Card key={venda.id} className="p-3 sm:p-4 hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate(`/vendas/${venda.id}`)}>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
                          <h3 className="font-semibold text-base sm:text-lg truncate">{venda.cliente?.nome}</h3>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <QuickStatusChanger venda={venda} size="sm" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="font-semibold text-accent">
                            {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(venda.valor)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {venda.descricao && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{venda.descricao}</p>}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => handleEditVenda(venda)}>
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => handleDeleteVenda(venda)}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>)}
            </div>}
        </CardContent>
      </Card>

      <VendaDialog open={dialogOpen} onOpenChange={setDialogOpen} venda={selectedVenda} />

      <DeleteVendaDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} venda={selectedVenda} />
    </div>;
}