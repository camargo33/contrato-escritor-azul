
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from '../components/Header';
import ContractsBaseSection from '../components/ContractsBaseSection';
import ContractAnalysisSection from '../components/ContractAnalysisSection';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                Analisador Ortográfico de Contratos
              </h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/5">
                  <ContractsBaseSection />
                </div>
                <div className="lg:w-3/5">
                  <ContractAnalysisSection />
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
