import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Package, DollarSign } from "lucide-react";
import { useServicos, useDeleteServico } from "@/hooks/useServicos";
import { ServicoDialog } from "@/components/Servicos/ServicoDialog";
import { DeleteServicoDialog } from "@/components/Servicos/DeleteServicoDialog";

export default function Servicos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServico, setSelectedServico] = useState<any>(null);
  
  const { data: servicos, isLoading, error } = useServicos(searchTerm);
  const deleteServico = useDeleteServico();

  const handleEdit = (servico: any) => {
    setSelectedServico(servico);
    setDialogOpen(true);
  };

  const handleDelete = (servico: any) => {
    setSelectedServico(servico);
    setDeleteDialogOpen(true);
  };

  const handleNewServico = () => {
    setSelectedServico(null);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedServico) {
      deleteServico.mutate(selectedServico.id);
      setDeleteDialogOpen(false);
      setSelectedServico(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de serviços disponíveis
          </p>
        </div>
        <Button onClick={handleNewServico} className="w-full sm:w-auto gradient-premium border-0 text-background">
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviços..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600">Erro ao carregar serviços: {error.message}</div>
            </div>
          ) : servicos && servicos.length > 0 ? (
            <div className="space-y-4">
              {servicos.map((servico) => (
                <Card 
                  key={servico.id} 
                  className="p-4 hover:shadow-premium transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-accent" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-semibold text-lg">{servico.nome}</h3>
                          <Badge variant={servico.ativo ? "default" : "secondary"}>
                            {servico.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-lg font-semibold text-primary">
                            {formatCurrency(servico.valor)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(servico)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(servico)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Não encontramos serviços com os termos buscados." 
                  : "Comece criando seu primeiro serviço."
                }
              </p>
              {!searchTerm && (
                <Button 
                  className="gradient-premium border-0 text-background"
                  onClick={handleNewServico}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Serviço
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ServicoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        servico={selectedServico}
      />

      <DeleteServicoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        servico={selectedServico}
        onConfirm={confirmDelete}
        isLoading={deleteServico.isPending}
      />
    </div>
  );
}