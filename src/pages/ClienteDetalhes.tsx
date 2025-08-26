import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { useCliente } from "@/hooks/useClientes";
import { ClienteDialog } from "@/components/Clientes/ClienteDialog";
import { DeleteClienteDialog } from "@/components/Clientes/DeleteClienteDialog";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: cliente, isLoading, error } = useCliente(id!);

  const handleEditCliente = () => {
    setDialogOpen(true);
  };

  const handleDeleteCliente = () => {
    setDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen gradient-premium-subtle">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/clientes")}
              className="hover:shadow-premium transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <Card className="shadow-premium">
            <CardContent className="p-6">
              <p className="text-destructive">Erro ao carregar cliente: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-premium-subtle">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/clientes")}
              className="hover:shadow-premium transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <Card className="shadow-premium">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Info Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="shadow-premium">
                  <CardContent className="p-4">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen gradient-premium-subtle">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/clientes")}
              className="hover:shadow-premium transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <Card className="shadow-premium">
            <CardContent className="p-6">
              <p className="text-muted-foreground">Cliente não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-premium-subtle">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Back Button and Actions */}
        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/clientes")}
                    className="hover:shadow-premium transition-all duration-200 shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{cliente.nome}</h1>
                      <p className="text-muted-foreground">Informações do cliente</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleEditCliente}
                    className="hover:shadow-premium transition-all duration-200 flex-1 sm:flex-none"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDeleteCliente}
                    className="hover:shadow-premium transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/5 flex-1 sm:flex-none"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email Card */}
            <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm hover:shadow-gold transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors duration-200">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base font-medium text-foreground break-words">{cliente.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            {cliente.telefone && (
              <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm hover:shadow-gold transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors duration-200">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <p className="text-base font-medium text-foreground">{cliente.telefone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CNPJ Card */}
            {cliente.cnpj && (
              <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm hover:shadow-gold transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors duration-200">
                      <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                      <p className="text-base font-medium text-foreground">{cliente.cnpj}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address Card */}
            {cliente.endereco && (
              <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm hover:shadow-gold transition-all duration-200 group sm:col-span-2 lg:col-span-3">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors duration-200">
                      <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                      <p className="text-base font-medium text-foreground">{cliente.endereco}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Created Date Card */}
            <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm hover:shadow-gold transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors duration-200">
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                    <p className="text-base font-medium text-foreground">
                      {new Date(cliente.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(cliente.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updated Date Card */}
            <Card className="shadow-premium border-0 bg-card/95 backdrop-blur-sm hover:shadow-gold transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors duration-200">
                    <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                    <p className="text-base font-medium text-foreground">
                      {new Date(cliente.updated_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(cliente.updated_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ClienteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          cliente={cliente}
        />

        <DeleteClienteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          cliente={cliente}
        />
      </div>
    </div>
  );
}