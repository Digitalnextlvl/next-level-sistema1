import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Star, TrendingUp, Zap } from "lucide-react";
const ofertas = [{
  id: 1,
  titulo: "Consultoria Premium",
  descricao: "Transforme seu negócio com nossa consultoria especializada",
  preco: "R$ 15.000",
  tags: ["Relevante", "Recomendado"],
  video: "https://example.com/video1",
  icon: Star
}, {
  id: 2,
  titulo: "Automação Comercial",
  descricao: "Sistema completo de automação para aumentar suas vendas",
  preco: "R$ 8.500",
  tags: ["Tendência", "Popular"],
  video: "https://example.com/video2",
  icon: TrendingUp
}, {
  id: 3,
  titulo: "CRM Enterprise",
  descricao: "Solução corporativa para grandes empresas",
  preco: "R$ 25.000",
  tags: ["Exclusivo", "Destaque"],
  video: "https://example.com/video3",
  icon: Zap
}];
const getTagColor = (tag: string) => {
  switch (tag) {
    case "Relevante":
      return "bg-primary text-primary-foreground";
    case "Recomendado":
      return "bg-accent text-accent-foreground";
    case "Tendência":
      return "bg-muted text-muted-foreground";
    case "Popular":
      return "bg-secondary text-secondary-foreground";
    case "Exclusivo":
      return "bg-primary/10 text-primary border border-primary/20";
    case "Destaque":
      return "bg-accent/10 text-accent border border-accent/20";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};
export function OfertasDestaque() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Ofertas em Destaque</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ofertas.map((oferta) => {
          const IconComponent = oferta.icon;
          return (
            <Card key={oferta.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <div className="flex gap-2">
                    {oferta.tags.map((tag) => (
                      <Badge key={tag} className={getTagColor(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl">{oferta.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{oferta.descricao}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{oferta.preco}</span>
                  <Button size="sm" className="gap-2">
                    <Play className="h-4 w-4" />
                    Ver Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}