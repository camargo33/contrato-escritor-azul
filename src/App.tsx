
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ContractAnalysis from "./pages/ContractAnalysis";
import BaseContracts from "./pages/BaseContracts";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              Analisador de Contratos CIABRASNET
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            {/* Redirecionar página inicial para análise */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/analise" replace />
              </ProtectedRoute>
            } />
            <Route path="/analise" element={
              <ProtectedRoute>
                <AppLayout>
                  <ContractAnalysis />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/contratos-base" element={
              <ProtectedRoute>
                <AppLayout>
                  <BaseContracts />
                </AppLayout>
              </ProtectedRoute>
            } />
            {/* Rotas removidas: Dashboard, Reports, AnalysisDetails */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
