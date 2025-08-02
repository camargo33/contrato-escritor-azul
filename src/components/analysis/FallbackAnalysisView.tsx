import { CheckCircle, AlertCircle } from "lucide-react";

interface FallbackAnalysisViewProps {
  errorCount: number;
  fullContent: string;
}

const FallbackAnalysisView = ({ errorCount, fullContent }: FallbackAnalysisViewProps) => {
  // 🎯 INTERFACE ULTRA LIMPA - NUNCA MOSTRAR JSON BRUTO
  console.log("🔍 [FallbackAnalysisView] errorCount:", errorCount);
  console.log("🔍 [FallbackAnalysisView] Modo interface LIMPA ativado");

  // ✅ SEMPRE MOSTRAR INTERFACE LIMPA, INDEPENDENTE DO CONTEÚDO
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

  // 🎨 INTERFACE LIMPA PARA ERROS - SEM JSON BRUTO
  const extractCleanErrors = (text: string): string[] => {
    if (!text || typeof text !== 'string') {
      return [`Detectados ${errorCount} problema${errorCount !== 1 ? 's' : ''} durante a análise`];
    }

    // 🧹 FILTRAR APENAS MENSAGENS LEGÍVEIS - NUNCA JSON
    const cleanLines: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // ❌ PULAR completamente linhas que parecem JSON
      if (
        trimmed.startsWith('{') ||
        trimmed.startsWith('}') ||
        trimmed.includes('"erro":') ||
        trimmed.includes('"campo":') ||
        trimmed.includes('"status":') ||
        trimmed.includes('":') ||
        trimmed.includes('",') ||
        trimmed.match(/^\s*".*":\s*/) ||
        trimmed.match(/^\s*\[\s*$/) ||
        trimmed.match(/^\s*\]\s*$/) ||
        trimmed.length > 200 // Linhas muito longas provavelmente são JSON
      ) {
        continue;
      }

      // ✅ INCLUIR apenas mensagens legíveis
      if (
        trimmed.length > 5 &&
        trimmed.length < 150 &&
        (
          trimmed.match(/erro/i) ||
          trimmed.match(/incorreto/i) ||
          trimmed.match(/inválido/i) ||
          trimmed.match(/problema/i) ||
          trimmed.match(/formato/i) ||
          trimmed.match(/telefone/i) ||
          trimmed.match(/data/i) ||
          trimmed.match(/valor/i) ||
          trimmed.includes('deve') ||
          trimmed.includes('esperado') ||
          trimmed.match(/^[-•\d+\.]\s/) // Listas numeradas ou com bullet
        )
      ) {
        cleanLines.push(trimmed);
      }
    }

    // Se não conseguiu extrair nada útil, retornar mensagem genérica
    if (cleanLines.length === 0) {
      return [
        `Detectados ${errorCount} problema${errorCount !== 1 ? 's' : ''} na análise`,
        "Revise o contrato e tente uma nova análise"
      ];
    }

    return cleanLines.slice(0, 5); // Máximo 5 linhas para manter limpo
  };

  const cleanErrors = extractCleanErrors(fullContent);

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
          {cleanErrors.map((error, index) => (
            <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          ))}
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