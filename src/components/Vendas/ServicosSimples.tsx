import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface ServicoSimples {
  id: string;
  descricao: string;
  valor: number;
}

interface ServicosSimpllesProps {
  servicos: ServicoSimples[];
  onServicosChange: (servicos: ServicoSimples[]) => void;
}

export function ServicosSimples({ servicos, onServicosChange }: ServicosSimpllesProps) {
  const [novoServico, setNovoServico] = useState({
    descricao: "",
    valor: ""
  });

  const adicionarServico = () => {
    if (!novoServico.descricao.trim() || !novoServico.valor.trim()) return;
    
    const valor = parseFloat(novoServico.valor);
    if (valor <= 0) return;

    const servico: ServicoSimples = {
      id: Date.now().toString(),
      descricao: novoServico.descricao.trim(),
      valor: valor
    };

    onServicosChange([...servicos, servico]);
    setNovoServico({ descricao: "", valor: "" });
  };

  const removerServico = (id: string) => {
    onServicosChange(servicos.filter(s => s.id !== id));
  };

  const editarServico = (id: string, campo: 'descricao' | 'valor', valor: string) => {
    const novosServicos = servicos.map(s => {
      if (s.id === id) {
        if (campo === 'descricao') {
          return { ...s, descricao: valor };
        } else {
          const valorNumerico = parseFloat(valor) || 0;
          return { ...s, valor: valorNumerico };
        }
      }
      return s;
    });
    onServicosChange(novosServicos);
  };

  const valorTotal = servicos.reduce((total, servico) => total + servico.valor, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Serviços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar Novo Serviço */}
        <div className="space-y-3">
          <Label>Adicionar Serviço</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Descrição do serviço"
                value={novoServico.descricao}
                onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor"
                value={novoServico.valor}
                onChange={(e) => setNovoServico({ ...novoServico, valor: e.target.value })}
                className="h-10"
              />
              <Button
                type="button"
                onClick={adicionarServico}
                size="icon"
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Serviços */}
        {servicos.length > 0 && (
          <div className="space-y-3">
            <Label>Serviços Adicionados</Label>
            {servicos.map((servico) => (
              <Card key={servico.id} className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <Input
                      value={servico.descricao}
                      onChange={(e) => editarServico(servico.id, 'descricao', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={servico.valor}
                      onChange={(e) => editarServico(servico.id, 'valor', e.target.value)}
                      className="h-9"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removerServico(servico.id)}
                      className="h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Total */}
            <Card className="p-3 bg-muted/30">
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