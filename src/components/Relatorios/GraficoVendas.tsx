import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRelatorioVendas } from "@/hooks/useRelatorios";
import { Loader2 } from "lucide-react";

export function GraficoVendas() {
  const { data: dadosVendas, isLoading } = useRelatorioVendas(6);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas dos Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosVendas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'valor' ? `R$ ${Number(value).toLocaleString('pt-BR')}` : value,
                name === 'valor' ? 'Faturamento' : 'Quantidade'
              ]}
            />
            <Bar dataKey="valor" fill="hsl(var(--primary))" name="valor" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}