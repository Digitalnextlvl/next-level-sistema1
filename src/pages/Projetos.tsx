import { useState } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjetos } from "@/hooks/useProjetos";
import { KanbanBoard } from "@/components/Kanban/KanbanBoard";
import { ProjetoDialog } from "@/components/Kanban/ProjetoDialog";

export default function Projetos() {
  const [selectedProjeto, setSelectedProjeto] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProjetoDialog, setShowProjetoDialog] = useState(false);
  const { projetos, isLoading } = useProjetos();

  const filteredProjetos = projetos.filter(projeto =>
    projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projeto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProjeto) {
    const projeto = projetos.find(p => p.id === selectedProjeto);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedProjeto("")}
            >
              ← Voltar aos Projetos
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{projeto?.nome}</h1>
              {projeto?.descricao && (
                <p className="text-muted-foreground mt-1">{projeto.descricao}</p>
              )}
            </div>
          </div>
        </div>
        
        <KanbanBoard projetoId={selectedProjeto} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus projetos e tarefas em boards Kanban
          </p>
        </div>
        <Button onClick={() => setShowProjetoDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjetos.map((projeto) => (
            <Card 
              key={projeto.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProjeto(projeto.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: projeto.cor }}
                    />
                    {projeto.nome}
                  </CardTitle>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                {projeto.descricao && (
                  <CardDescription>{projeto.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Criado em {new Date(projeto.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredProjetos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm ? "Nenhum projeto encontrado." : "Você ainda não tem projetos."}
          </div>
          <Button 
            onClick={() => setShowProjetoDialog(true)}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Projeto
          </Button>
        </div>
      )}

      <ProjetoDialog 
        open={showProjetoDialog}
        onOpenChange={setShowProjetoDialog}
      />
    </div>
  );
}