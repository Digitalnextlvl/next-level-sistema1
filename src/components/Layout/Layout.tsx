import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLocation } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAgendaPage = location.pathname === '/agenda';
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
            <div className={isAgendaPage ? "h-full" : "p-3 sm:p-4 md:p-6 lg:p-8"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}