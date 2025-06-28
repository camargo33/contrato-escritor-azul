
import ContractAnalysisSection from '../components/ContractAnalysisSection';

const ContractAnalysis = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Análise de Contratos</h1>
          <p className="text-muted-foreground">Analise contratos usando inteligência artificial</p>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <ContractAnalysisSection />
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysis;
