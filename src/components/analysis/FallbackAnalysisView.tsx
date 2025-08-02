import { CheckCircle, AlertCircle } from "lucide-react";

interface FallbackAnalysisViewProps {
  errorCount: number;
  fullContent: string;
}

const FallbackAnalysisView = ({ errorCount, fullContent }: FallbackAnalysisViewProps) => {
  // 🎯 SÓ MOSTRAR CONTEÚDO SE REALMENTE HOUVER ERROS OU PROBLEMAS
  console.log("🔍 [FallbackAnalysisView] errorCount:", errorCount);
  console.log("🔍 [FallbackAnalysisView] Tamanho do conteúdo:", fullContent?.length || 0);

  // Se não há erros detectados, mostrar apenas interface limpa
  if (errorCount === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="h-5 w-5" />
            Análise concluída - Nenhum erro encontrado
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="font-medium">Contrato Aprovado</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            A análise foi concluída e nenhum problema foi identificado no contrato.
          </p>
        </div>
      </div>
    );
  }

  // 🚨 SÓ MOSTRAR DETALHES SE HOUVER ERROS
  const formatContent = (text: string) => {
    // Filtrar apenas linhas que parecem ser erros reais
    const lines = text.split('\n').filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      
      // Incluir apenas linhas que parecem ser erros ou observações importantes
      return (
        trimmed.match(/erro/i) ||
        trimmed.match(/incorreto/i) ||
        trimmed.match(/inválido/i) ||
        trimmed.match(/crítico/i) ||
        trimmed.match(/\\d+\\./)||
        trimmed.startsWith('**') ||
        trimmed.startsWith('-') ||
        trimmed.startsWith('•')
      );
    });

    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <h4 key={index} className="text-lg font-semibold text-slate-700 mt-4 mb-2">
            {trimmedLine.replace(/\\*\\*/g, '')}
          </h4>
        );
      }
      
      if (/^\\d+\\./.test(trimmedLine)) {
        return (
          <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 mb-2 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700 font-medium">{trimmedLine}</p>
            </div>
          </div>
        );
      }
      
      if (/^[-•]/.test(trimmedLine)) {
        return (
          <div key={index} className="ml-4 mb-1">
            <p className="text-gray-700">{trimmedLine}</p>
          </div>
        );
      }
      
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
          {trimmedLine}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          Análise concluída - {errorCount} problema{errorCount !== 1 ? 's' : ''} detectado{errorCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
          Problemas Identificados:
        </h3>
        
        <div className="space-y-3">
          {formatContent(fullContent)}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Recomendação</h4>
          <p className="text-blue-700 text-sm">
            Revise os pontos destacados acima e faça as correções necessárias antes de aprovar o contrato.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FallbackAnalysisView;