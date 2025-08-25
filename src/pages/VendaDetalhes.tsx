import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Calendar, Building2, FileText, Edit, Trash2, CreditCard, Hash, Phone, Mail, MapPin, Package, User } from "lucide-react";
import { useVenda } from "@/hooks/useVendas";
import { VendaDialog } from "@/components/Vendas/VendaDialog";
import { DeleteVendaDialog } from "@/components/Vendas/DeleteVendaDialog";
import { QuickStatusChanger } from "@/components/Vendas/QuickStatusChanger";
import { useState } from "react";

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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Venda */}
            <Card className="shadow-premium border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Informações da Venda</CardTitle>
                  <QuickStatusChanger venda={venda} />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valor Total */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-medium">Valor Total</span>
                    </div>
                    <p className="text-2xl font-bold text-accent pl-7">
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

                  {/* Forma de Pagamento */}
                  {venda.forma_pagamento && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Forma de Pagamento</span>
                      </div>
                      <p className="text-lg pl-7 capitalize">
                        {venda.forma_pagamento.replace('_', ' ')}
                      </p>
                    </div>
                  )}

                  {/* Parcelas */}
                  {venda.parcelas && venda.parcelas > 1 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-5 w-5" />
                        <span className="font-medium">Parcelas</span>
                      </div>
                      <p className="text-lg pl-7">{venda.parcelas}x</p>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                {venda.descricao && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Descrição</span>
                    </div>
                    <p className="text-base pl-7 bg-muted/50 p-4 rounded-lg">{venda.descricao}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Serviços */}
            {venda.venda_servicos && venda.venda_servicos.length > 0 && (
              <Card className="shadow-premium border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venda.venda_servicos.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{item.servico.nome}</h4>
                          {item.servico.descricao && (
                            <p className="text-sm text-muted-foreground">{item.servico.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Qtd: {item.quantidade}</span>
                            <span>Valor unit: {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.valor_unitario)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-accent">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.valor_total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cliente */}
            <Card className="shadow-premium border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{venda.cliente?.nome}</h3>
                </div>
                
                {venda.cliente?.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{venda.cliente.email}</span>
                  </div>
                )}
                
                {venda.cliente?.telefone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{venda.cliente.telefone}</span>
                  </div>
                )}
                
                {venda.cliente?.endereco && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="text-sm">{venda.cliente.endereco}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações de Auditoria */}
            <Card className="shadow-premium border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Auditoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Criado em:</span>
                  <br />
                  {new Date(venda.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  <span className="font-medium">Atualizado em:</span>
                  <br />
                  {new Date(venda.updated_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
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