import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import NovoCliente from "./pages/NovoCliente";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import Vendas from "./pages/Vendas";
import NovaVenda from "./pages/NovaVenda";
import VendaDetalhes from "./pages/VendaDetalhes";
import Contratos from "./pages/Contratos";
import ContratoDetalhes from "./pages/ContratoDetalhes";
import Servicos from "./pages/Servicos";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Metas from "./pages/Metas";
import NotFound from "./pages/NotFound";
import HealthCheck from "./pages/HealthCheck";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
              <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/landing" element={<LandingPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clientes" element={
                  <ProtectedRoute>
                    <Layout>
                      <Clientes />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clientes/novo" element={
                  <ProtectedRoute>
                    <NovoCliente />
                  </ProtectedRoute>
                 } />
                 <Route path="/clientes/:id" element={
                   <ProtectedRoute>
                     <ClienteDetalhes />
                   </ProtectedRoute>
                 } />
                 <Route path="/vendas" element={
                   <ProtectedRoute>
                     <Layout>
                       <Vendas />
                     </Layout>
                   </ProtectedRoute>
                 } />
                 <Route path="/vendas/nova" element={
                   <ProtectedRoute>
                     <NovaVenda />
                   </ProtectedRoute>
                 } />
                 <Route path="/vendas/:id" element={
                   <ProtectedRoute>
                     <VendaDetalhes />
                   </ProtectedRoute>
                 } />
                   <Route path="/contratos" element={
                     <ProtectedRoute>
                       <Layout>
                         <Contratos />
                       </Layout>
                     </ProtectedRoute>
                   } />
                   <Route path="/contratos/:id" element={
                     <ProtectedRoute>
                       <ContratoDetalhes />
                     </ProtectedRoute>
                   } />
                   <Route path="/servicos" element={
                    <ProtectedRoute>
                      <Layout>
                        <Servicos />
                      </Layout>
                    </ProtectedRoute>
                  } />
                 <Route path="/financeiro" element={
                   <ProtectedRoute requiredRole="admin">
                     <Layout>
                       <Financeiro />
                     </Layout>
                   </ProtectedRoute>
                 } />
                 <Route path="/relatorios" element={
                   <ProtectedRoute requiredRole="admin">
                     <Layout>
                       <Relatorios />
                     </Layout>
                   </ProtectedRoute>
                 } />
                  <Route path="/configuracoes" element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <Configuracoes />
                      </Layout>
                    </ProtectedRoute>
                  } />
                   <Route path="/metas" element={
                     <ProtectedRoute>
                       <Layout>
                         <Metas />
                       </Layout>
                     </ProtectedRoute>
                   } />
                   <Route path="/health" element={<HealthCheck />} />
                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                 <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
