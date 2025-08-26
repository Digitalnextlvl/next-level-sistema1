import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Calendar, Clock } from "lucide-react";
import { useCliente } from "@/hooks/useClientes";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: cliente, isLoading, error } = useCliente(id!);

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/clientes")}
            className="shrink-0 self-start sm:self-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Voltar</span>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Cliente</h1>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-destructive">Erro ao carregar cliente: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/clientes")}
            className="shrink-0 self-start sm:self-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Voltar</span>
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card">
                  <Skeleton className="h-16 sm:h-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/clientes")}
            className="shrink-0 self-start sm:self-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Voltar</span>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Cliente</h1>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-muted-foreground">Cliente não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={() => navigate("/clientes")}
          className="shrink-0 self-start sm:self-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2 sm:mr-0" />
          <span className="sm:hidden">Voltar</span>
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-lg bg-accent/10 shrink-0">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{cliente.nome}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Informações do cliente</p>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email Card */}
            <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base font-medium break-words">{cliente.email}</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            {cliente.telefone && (
              <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p className="text-base font-medium">{cliente.telefone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CNPJ Card */}
            {cliente.cnpj && (
              <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                    <p className="text-base font-medium">{cliente.cnpj}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Card */}
            {cliente.endereco && (
              <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors sm:col-span-2 lg:col-span-3">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                    <p className="text-base font-medium">{cliente.endereco}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Created Date Card */}
            <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="text-base font-medium">
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
            </div>

            {/* Updated Date Card */}
            <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base font-medium">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}