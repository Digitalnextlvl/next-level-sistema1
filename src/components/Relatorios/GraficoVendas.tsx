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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl">Vendas dos Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={dadosVendas}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="mes" 
              fontSize={12}
              className="text-muted-foreground"
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
            />
            <YAxis 
              fontSize={12}
              className="text-muted-foreground"
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'valor' ? `R$ ${Number(value).toLocaleString('pt-BR')}` : value,
                name === 'valor' ? 'Faturamento' : 'Quantidade'
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="valor" fill="hsl(var(--primary))" name="valor" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}