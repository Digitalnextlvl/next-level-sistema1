import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDashboardImages } from "@/hooks/useDashboardImages";
import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";
import banner3 from "@/assets/banner3.jpg";

// Imagens padrão como fallback
const defaultBanners = [
  {
    id: 1,
    image: banner1,
    title: "Acelere suas Vendas",
    description: "Gerencie oportunidades e feche mais negócios",
    url_imagem: banner1,
    titulo: "Acelere suas Vendas",
    descricao: "Gerencie oportunidades e feche mais negócios"
  },
  {
    id: 2,
    image: banner2,
    title: "Analytics Avançados", 
    description: "Tome decisões baseadas em dados precisos",
    url_imagem: banner2,
    titulo: "Analytics Avançados",
    descricao: "Tome decisões baseadas em dados precisos"
  },
  {
    id: 3,
    image: banner3,
    title: "Relacionamento Premium",
    description: "Construa conexões duradouras com seus clientes",
    url_imagem: banner3,
    titulo: "Relacionamento Premium", 
    descricao: "Construa conexões duradouras com seus clientes"
  }
];

export function BannerCarousel() {
  const { data: images, isLoading, error } = useDashboardImages();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Usar imagens do banco ou fallback para as padrão
  const bannersToShow = images && images.length > 0 ? images : defaultBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % bannersToShow.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannersToShow.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + bannersToShow.length) % bannersToShow.length);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % bannersToShow.length);
  };

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden shadow-premium">
        <div className="h-64 md:h-80 flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error) {
    // Using default banners on error
  }

  return (
    <Card className="relative overflow-hidden shadow-premium group">
      <div className="relative h-48 sm:h-64 lg:h-80">
        {bannersToShow.map((banner, index) => (
          <div 
            key={banner.id || index} 
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentIndex ? "translate-x-0" : 
              index < currentIndex ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <img 
              src={banner.url_imagem || banner.image} 
              alt={banner.titulo || banner.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback para imagem padrão se houver erro
                const target = e.target as HTMLImageElement;
                target.src = defaultBanners[index % defaultBanners.length]?.image || banner1;
              }}
            />
          </div>
        ))}
        
        {bannersToShow.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 sm:w-10 sm:h-10" 
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 sm:w-10 sm:h-10" 
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {bannersToShow.map((_, index) => (
                <button 
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  }`} 
                  onClick={() => setCurrentIndex(index)} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}