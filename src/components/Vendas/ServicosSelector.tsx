import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Package } from "lucide-react";
import { useServicos } from "@/hooks/useServicos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ServicoSelecionado {
  servico_id: string;
  nome: string;
  valor_unitario: number;
  quantidade: number;
  valor_total: number;
}

interface ServicosSelectorProps {
  servicosSelecionados: ServicoSelecionado[];
  onServicosChange: (servicos: ServicoSelecionado[]) => void;
}

export function ServicosSelector({ servicosSelecionados, onServicosChange }: ServicosSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: servicos = [], isLoading } = useServicos(searchTerm);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const adicionarServico = (servico: any) => {
    const servicoExistente = servicosSelecionados.find(s => s.servico_id === servico.id);
    
    if (servicoExistente) {
      // Se já existe, aumenta a quantidade
      const novosServicos = servicosSelecionados.map(s => 
        s.servico_id === servico.id 
          ? { ...s, quantidade: s.quantidade + 1, valor_total: (s.quantidade + 1) * s.valor_unitario }
          : s
      );
      onServicosChange(novosServicos);
    } else {
      // Se não existe, adiciona novo
      const novoServico: ServicoSelecionado = {
        servico_id: servico.id,
        nome: servico.nome,
        valor_unitario: servico.valor,
        quantidade: 1,
        valor_total: servico.valor,
      };
      onServicosChange([...servicosSelecionados, novoServico]);
    }
    setDialogOpen(false);
  };

  const removerServico = (servicoId: string) => {
    const novosServicos = servicosSelecionados.filter(s => s.servico_id !== servicoId);
    onServicosChange(novosServicos);
  };

  const atualizarQuantidade = (servicoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerServico(servicoId);
      return;
    }

    const novosServicos = servicosSelecionados.map(s => 
      s.servico_id === servicoId 
        ? { ...s, quantidade: novaQuantidade, valor_total: novaQuantidade * s.valor_unitario }
        : s
    );
    onServicosChange(novosServicos);
  };

  const valorTotal = servicosSelecionados.reduce((total, servico) => total + servico.valor_total, 0);

  return (
    <Card className="p-4 md:p-6">
      <CardHeader className="pb-4 px-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Selecionar Serviços *</Label>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 touch-manipulation">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Selecionar Serviços</DialogTitle>
                  <DialogDescription>
                    Escolha os serviços para adicionar à venda
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 text-base"
                  />

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">Carregando serviços...</div>
                    </div>
                  ) : servicos.length > 0 ? (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {servicos.map((servico) => (
                        <Card key={servico.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-base mb-1 truncate">{servico.nome}</h4>
                                {servico.descricao && (
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {servico.descricao}
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-base px-2 py-1">
                                    {formatCurrency(servico.valor)}
                                  </Badge>
                                  {servico.categoria && (
                                    <Badge variant="secondary" className="text-xs">
                                      {servico.categoria}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => adicionarServico(servico)}
                                className="h-10 px-3 touch-manipulation shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-base mb-2">Nenhum serviço encontrado</p>
                      <p className="text-sm">Tente ajustar sua busca ou cadastre novos serviços</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {servicosSelecionados.length > 0 ? (
            <div className="space-y-3">
              {servicosSelecionados.map((servico) => (
                <Card key={servico.servico_id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base mb-1 truncate">{servico.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(servico.valor_unitario)} por unidade
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`qty-${servico.servico_id}`} className="text-sm whitespace-nowrap">
                            Qtd:
                          </Label>
                          <Input
                            id={`qty-${servico.servico_id}`}
                            type="number"
                            min="1"
                            value={servico.quantidade}
                            onChange={(e) => 
                              atualizarQuantidade(servico.servico_id, parseInt(e.target.value) || 1)
                            }
                            className="w-20 h-10 text-center"
                          />
                        </div>
                        
                        <div className="text-right sm:min-w-0">
                          <p className="font-bold text-lg text-primary">
                            {formatCurrency(servico.valor_total)}
                          </p>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerServico(servico.servico_id)}
                          className="h-10 px-3 touch-manipulation shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-muted/30 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-lg">Valor Total dos Serviços:</span>
                    <span className="text-2xl md:text-3xl font-bold text-primary">
                      {formatCurrency(valorTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground text-base mb-2">
                  Nenhum serviço selecionado
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Adicionar Serviço" para começar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}