import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Plus } from "lucide-react";
import { useCreateCategoria, CreateCategoriaData } from "@/hooks/useFinanceiro";

interface CategoriaDialogProps {
  children?: React.ReactNode;
}

const coresDisponiveis = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16', '#F43F5E', '#06B6D4'
];

export function CategoriaDialog({ children }: CategoriaDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCategoriaData>({
    nome: '',
    tipo: 'despesa',
    cor: '#3B82F6',
  });

  const createCategoria = useCreateCategoria();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo) {
      return;
    }

    try {
      await createCategoria.mutateAsync(formData);
      setOpen(false);
      setFormData({
        nome: '',
        tipo: 'despesa',
        cor: '#3B82F6',
      });
    } catch (error) {
      // Error already handled by mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Categorias
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Categoria</Label>
            <Input
              id="nome"
              placeholder="Ex: Marketing, Infraestrutura..."
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: 'receita' | 'despesa') => 
                setFormData(prev => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-6 gap-2">
              {coresDisponiveis.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.cor === cor ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: cor }}
                  onClick={() => setFormData(prev => ({ ...prev, cor }))}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createCategoria.isPending}>
              {createCategoria.isPending ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}