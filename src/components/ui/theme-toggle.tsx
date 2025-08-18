import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

export function ThemeToggle() {
  const { theme } = useTheme();
  const { toast } = useToast();

  const handleThemeClick = () => {
    if (theme === 'light') {
      toast({
        title: "Em desenvolvimento",
        description: "Tema escuro em breve!",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeClick}
      className="h-9 w-9"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}