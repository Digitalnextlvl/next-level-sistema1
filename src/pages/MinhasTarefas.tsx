import { useState } from "react";
import { CheckSquare, Filter, Search, Calendar, List, Kanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserTasks } from "@/hooks/useUserTasks";
import { TasksWidget } from "@/components/Dashboard/TasksWidget";
import { Badge } from "@/components/ui/badge";

export default function MinhasTarefas() {
  const { tasks, isLoading, markAsCompleted } = useUserTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedPriority, setSelectedPriority] = useState<string>("todas");

  // Filtrar tarefas
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === "todos" || task.projeto_nome === selectedProject;
    const matchesStatus = selectedStatus === "todos" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "todas" || task.prioridade === selectedPriority;
    
    return matchesSearch && matchesProject && matchesStatus && matchesPriority;
  }) || [];

  // Estatísticas das tarefas
  const taskStats = {
    total: tasks?.length || 0,
    pendentes: tasks?.filter(task => task.status !== 'concluida').length || 0,
    concluidas: tasks?.filter(task => task.status === 'concluida').length || 0,
    vencidas: tasks?.filter(task => 
      task.data_vencimento && new Date(task.data_vencimento) < new Date() && task.status !== 'concluida'
    ).length || 0,
  };

  const projetos = [...new Set(tasks?.map(task => task.projeto_nome) || [])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CheckSquare className="w-6 h-6 text-primary" />
            Minhas Tarefas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{taskStats.pendentes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{taskStats.concluidas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{taskStats.vencidas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os projetos</SelectItem>
                {projetos.map(projeto => (
                  <SelectItem key={projeto} value={projeto}>{projeto}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedProject("todos");
                setSelectedStatus("todos");
                setSelectedPriority("todas");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="widget" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Widget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.titulo}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`
                              ${task.prioridade === 'alta' ? 'bg-destructive/10 text-destructive' : ''}
                              ${task.prioridade === 'media' ? 'bg-warning/10 text-warning' : ''}
                              ${task.prioridade === 'baixa' ? 'bg-success/10 text-success' : ''}
                            `}
                          >
                            {task.prioridade}
                          </Badge>
                        </div>
                        
                        {task.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Projeto: {task.projeto_nome}</span>
                          {task.data_vencimento && (
                            <span className={`flex items-center gap-1 ${
                              new Date(task.data_vencimento) < new Date() ? 'text-destructive font-medium' : ''
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {new Date(task.data_vencimento).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.status !== 'concluida' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsCompleted(task.id)}
                            className="hover:bg-success/20 hover:border-success"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedProject !== "todos" || selectedStatus !== "todos" || selectedPriority !== "todas" 
                    ? "Tente ajustar os filtros para ver mais tarefas."
                    : "Você não tem tarefas no momento."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="widget">
          <TasksWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
}