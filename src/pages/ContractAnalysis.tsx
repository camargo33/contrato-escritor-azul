
import ContractAnalysisSection from '../components/ContractAnalysisSection';

const ContractAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative px-6 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Sistema Online</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Análise Inteligente de Contratos
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Análise completa e precisa de documentos contratuais usando inteligência artificial avançada
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <ContractAnalysisSection />
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysis;
