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
  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedVenda(undefined);
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setSelectedVenda(undefined);
    }
  };

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
  return <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div className="flex flex-row justify-between items-center gap-4 sm:gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Vendas</h1>
        <Button className="gradient-premium border-0 text-background h-10 px-4 text-sm shrink-0" onClick={handleNewVenda}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-muted-foreground">Total em Vendas</p>
              <p className="text-xl sm:text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalVendas)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-muted-foreground">Vendas Fechadas</p>
              <p className="text-xl sm:text-2xl font-bold">{vendasFechadas}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 xs:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-muted-foreground">Em Negociação</p>
              <p className="text-xl sm:text-2xl font-bold">{vendasNegociacao}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar vendas..." className="pl-12 h-12 sm:h-10 text-base" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-5 sm:p-6">
          {isLoading ? <div className="space-y-5">
              {Array.from({
            length: 3
          }).map((_, i) => <Card key={i} className="p-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-7 w-48" />
                    </div>
                    <div className="flex gap-6">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </Card>)}
            </div> : vendas.length === 0 ? <div className="text-center py-16">
              <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Não encontramos vendas com os termos buscados." : "Comece adicionando sua primeira venda."}
              </p>
              {!searchTerm && <Button className="gradient-premium border-0 text-background h-12" onClick={handleNewVenda}>
                  <Plus className="mr-2 h-5 w-5" />
                  Adicionar Venda
                </Button>}
            </div> : <div className="space-y-5">
              {vendas.map(venda => <Card key={venda.id} className="p-5 sm:p-6 hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate(`/vendas/${venda.id}`)}>
                  <div className="flex flex-col gap-4 sm:gap-5">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent shrink-0" />
                          <h3 className="font-semibold text-lg sm:text-xl truncate">{venda.cliente?.nome}</h3>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <QuickStatusChanger venda={venda} size="sm" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 text-sm sm:text-base text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                          <span className="font-semibold text-accent text-base sm:text-lg">
                            {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(venda.valor)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                          <span>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {venda.descricao && <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mt-2">{venda.descricao}</p>}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="default" className="flex-1 sm:flex-none h-11 sm:h-10 text-sm sm:text-base" onClick={() => handleEditVenda(venda)}>
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="default" className="flex-1 sm:flex-none h-11 sm:h-10 text-sm sm:text-base" onClick={() => handleDeleteVenda(venda)}>
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>)}
            </div>}
        </CardContent>
      </Card>

      <VendaDialog open={dialogOpen} onOpenChange={handleDialogChange} venda={selectedVenda} />

      <DeleteVendaDialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange} venda={selectedVenda} />
    </div>;
}