import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTransacoesMes } from "@/hooks/useFinanceiro";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { MonthYearPicker } from "@/components/Financeiro/MonthYearPicker";

const COLORS = {
  receita: 'hsl(var(--primary))',
  despesa: 'hsl(var(--destructive))',
};

export function GraficoFinanceiro() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: transacoes, isLoading } = useTransacoesMes(selectedDate);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const dadosFinanceiros = transacoes?.reduce((acc, transacao) => {
    const tipo = transacao.tipo;
    const valorExistente = acc.find(item => item.name === tipo);
    
    if (valorExistente) {
      valorExistente.value += Number(transacao.valor);
    } else {
      acc.push({
        name: tipo,
        value: Number(transacao.valor),
        label: tipo === 'receita' ? 'Receitas' : 'Despesas'
      });
    }
    
    return acc;
  }, [] as Array<{ name: string; value: number; label: string }>) || [];

  const totalReceitas = dadosFinanceiros.find(item => item.name === 'receita')?.value || 0;
  const totalDespesas = dadosFinanceiros.find(item => item.name === 'despesa')?.value || 0;
  const lucro = totalReceitas - totalDespesas;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financeiro</CardTitle>
          <MonthYearPicker
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Receitas</p>
            <p className="font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceitas)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Despesas</p>
            <p className="font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Lucro</p>
            <p className={`font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucro)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dadosFinanceiros.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosFinanceiros}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {dadosFinanceiros.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                  ''
                ]}
                labelFormatter={(label) => dadosFinanceiros.find(item => item.name === label)?.label}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhuma transação encontrada para este período
          </div>
        )}
      </CardContent>
    </Card>
  );
}