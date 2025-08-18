import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useServicos } from "@/hooks/useServicos";

interface ServicoSelecionado {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface ServicosSelectorProps {
  servicosSelecionados: ServicoSelecionado[];
  onServicosChange: (servicos: ServicoSelecionado[]) => void;
}

export function ServicosSelector({ servicosSelecionados, onServicosChange }: ServicosSelectorProps) {
  const [busca, setBusca] = useState("");
  const { data: servicos = [] } = useServicos(busca);

  const adicionarServico = (servicoId: string) => {
    const servico = servicos.find(s => s.id === servicoId);
    if (!servico) return;

    const servicoExistente = servicosSelecionados.find(s => s.id === servicoId);
    if (servicoExistente) {
      // Se já existe, incrementa a quantidade
      const novosServicos = servicosSelecionados.map(s => 
        s.id === servicoId 
          ? { 
              ...s, 
              quantidade: s.quantidade + 1,
              valor_total: (s.quantidade + 1) * s.valor_unitario
            }
          : s
      );
      onServicosChange(novosServicos);
    } else {
      // Se não existe, adiciona novo
      const novoServico: ServicoSelecionado = {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        quantidade: 1,
        valor_unitario: servico.valor,
        valor_total: servico.valor,
      };
      onServicosChange([...servicosSelecionados, novoServico]);
    }
  };

  const alterarQuantidade = (servicoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerServico(servicoId);
      return;
    }

    const novosServicos = servicosSelecionados.map(s => 
      s.id === servicoId 
        ? { 
            ...s, 
            quantidade: novaQuantidade,
            valor_total: novaQuantidade * s.valor_unitario
          }
        : s
    );
    onServicosChange(novosServicos);
  };

  const alterarValorUnitario = (servicoId: string, novoValor: number) => {
    const novosServicos = servicosSelecionados.map(s => 
      s.id === servicoId 
        ? { 
            ...s, 
            valor_unitario: novoValor,
            valor_total: s.quantidade * novoValor
          }
        : s
    );
    onServicosChange(novosServicos);
  };

  const removerServico = (servicoId: string) => {
    const novosServicos = servicosSelecionados.filter(s => s.id !== servicoId);
    onServicosChange(novosServicos);
  };

  const valorTotal = servicosSelecionados.reduce((total, servico) => total + servico.valor_total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Serviços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar Serviço */}
        <div className="space-y-2">
          <Label>Adicionar Serviço</Label>
          <div className="flex gap-2">
            <Select value="" onValueChange={adicionarServico}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Buscar serviço..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {servicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{servico.nome}</span>
                      <span className="text-sm text-muted-foreground">
                        R$ {servico.valor.toFixed(2)}
                        {servico.descricao && ` - ${servico.descricao}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Serviços Selecionados */}
        {servicosSelecionados.length > 0 && (
          <div className="space-y-3">
            <Label>Serviços Selecionados</Label>
            {servicosSelecionados.map((servico) => (
              <Card key={servico.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{servico.nome}</h4>
                      {servico.descricao && (
                        <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removerServico(servico.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Quantidade */}
                    <div className="space-y-1">
                      <Label className="text-xs">Quantidade</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => alterarQuantidade(servico.id, servico.quantidade - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={servico.quantidade}
                          onChange={(e) => alterarQuantidade(servico.id, parseInt(e.target.value) || 1)}
                          className="text-center h-8"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => alterarQuantidade(servico.id, servico.quantidade + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Valor Unitário */}
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={servico.valor_unitario}
                        onChange={(e) => alterarValorUnitario(servico.id, parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>

                    {/* Valor Total */}
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Total</Label>
                      <div className="h-8 flex items-center">
                        <Badge variant="secondary" className="font-mono">
                          R$ {servico.valor_total.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Total Geral */}
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total dos Serviços:</span>
                <Badge variant="default" className="font-mono text-base px-3 py-1">
                  R$ {valorTotal.toFixed(2)}
                </Badge>
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}