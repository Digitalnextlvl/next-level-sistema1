import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Mail, Phone, Building2, Edit, Trash2 } from "lucide-react";
import { useClientes, type Cliente, type ClienteWithVendedor } from "@/hooks/useClientes";
import { useAuth } from "@/contexts/AuthContext";
import { ClienteDialog } from "@/components/Clientes/ClienteDialog";
import { DeleteClienteDialog } from "@/components/Clientes/DeleteClienteDialog";

export default function Clientes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>();

  const { data: clientes = [], isLoading, error } = useClientes(searchTerm);

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDialogOpen(true);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDeleteDialogOpen(true);
  };

  const handleNewCliente = () => {
    navigate("/clientes/novo");
  };

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 space-y-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar clientes: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Clientes</h1>
        <Button 
          className="gradient-premium border-0 text-background w-full sm:w-auto"
          onClick={handleNewCliente}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-3 sm:p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Skeleton className="h-4 w-full sm:w-40" />
                      <Skeleton className="h-4 w-24 sm:w-32" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
                {searchTerm 
                  ? "Não encontramos clientes com os termos buscados." 
                  : "Comece adicionando seu primeiro cliente."
                }
              </p>
              {!searchTerm && (
                <Button 
                  className="gradient-premium border-0 text-background w-full sm:w-auto"
                  onClick={handleNewCliente}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {clientes.map((cliente) => (
                <Card 
                  key={cliente.id} 
                  className="p-3 sm:p-4 hover:shadow-premium transition-shadow cursor-pointer"
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                >
                  <div className="flex flex-col gap-3 sm:gap-4">
                     <div className="space-y-2 flex-1">
                       <div className="flex items-center gap-2 sm:gap-3">
                         <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
                         <h3 className="font-semibold text-base sm:text-lg truncate">{cliente.nome}</h3>
                       </div>
                       
                      <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
                         <div className="flex items-center gap-2">
                           <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                           <span className="truncate">{cliente.email}</span>
                         </div>
                         {cliente.telefone && (
                           <div className="flex items-center gap-2">
                             <Phone className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                             <span>{cliente.telefone}</span>
                           </div>
                         )}
                       </div>
                     </div>
                    
                     <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                       <Button 
                         variant="outline" 
                         size="sm"
                         className="flex-1 sm:flex-none text-sm h-9 sm:h-8 px-4 sm:px-3"
                         onClick={() => handleEditCliente(cliente)}
                       >
                         <Edit className="h-4 w-4 mr-2 sm:mr-1" />
                         Editar
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         className="flex-1 sm:flex-none text-sm h-9 sm:h-8 px-4 sm:px-3"
                         onClick={() => handleDeleteCliente(cliente)}
                       >
                         <Trash2 className="h-4 w-4 mr-2 sm:mr-1" />
                         Excluir
                       </Button>
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ClienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cliente={selectedCliente}
      />

      <DeleteClienteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cliente={selectedCliente}
      />
    </div>
  );
}