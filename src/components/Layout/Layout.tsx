import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
            <div className="fixed top-20 left-3 z-50 lg:hidden">
              <SidebarTrigger className="bg-card/90 backdrop-blur-sm border shadow-premium transition-all duration-200 hover:bg-card text-foreground" />
            </div>
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}