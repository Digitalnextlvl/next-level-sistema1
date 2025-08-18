import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Calendar, Building2, FileText, Edit, Trash2 } from "lucide-react";
import { useVenda } from "@/hooks/useVendas";
import { VendaDialog } from "@/components/Vendas/VendaDialog";
import { DeleteVendaDialog } from "@/components/Vendas/DeleteVendaDialog";
import { useState } from "react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "fechada":
      return "bg-green-500 text-white";
    case "negociacao":
      return "bg-yellow-500 text-white";
    case "proposta":
      return "bg-blue-500 text-white";
    case "perdida":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
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

export default function VendaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: venda, isLoading, error } = useVenda(id!);

  const handleEditVenda = () => {
    setDialogOpen(true);
  };

  const handleDeleteVenda = () => {
    setDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-elegant">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/vendas")}
              className="hover:shadow-premium transition-shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Erro ao carregar venda: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-elegant">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/vendas")}
              className="hover:shadow-premium transition-shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-premium border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="min-h-screen bg-gradient-elegant">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/vendas")}
              className="hover:shadow-premium transition-shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Venda não encontrada.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/vendas")}
              className="hover:shadow-premium transition-shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Venda - {venda.cliente?.nome}</h1>
                <p className="text-muted-foreground">Detalhes da venda</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleEditVenda}
              className="hover:shadow-premium transition-shadow"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline"
              onClick={handleDeleteVenda}
              className="hover:shadow-premium transition-shadow text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-premium border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Informações da Venda</CardTitle>
                <Badge className={getStatusColor(venda.status)}>
                  {getStatusLabel(venda.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">Cliente</span>
                  </div>
                  <p className="text-lg pl-7">{venda.cliente?.nome}</p>
                </div>

                {/* Valor Total */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Valor Total</span>
                  </div>
                  <p className="text-lg pl-7 font-semibold text-accent">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(venda.valor)}
                  </p>
                </div>

                {/* Data da Venda */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Data da Venda</span>
                  </div>
                  <p className="text-lg pl-7">
                    {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Descrição */}
                {venda.descricao && (
                  <div className="space-y-3 lg:col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Descrição</span>
                    </div>
                    <p className="text-lg pl-7">{venda.descricao}</p>
                  </div>
                )}
              </div>

              {/* Informações de criação/atualização */}
              <div className="mt-8 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Criado em:</span>{" "}
                    {new Date(venda.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>
                    <span className="font-medium">Atualizado em:</span>{" "}
                    {new Date(venda.updated_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <VendaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          venda={venda}
        />

        <DeleteVendaDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          venda={venda}
        />
      </div>
    </div>
  );
}