
import { CheckCircle, AlertCircle } from "lucide-react";

interface FallbackAnalysisViewProps {
  errorCount: number;
  fullContent: string;
}

const FallbackAnalysisView = ({ errorCount, fullContent }: FallbackAnalysisViewProps) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <h4 key={index} className="text-lg font-semibold text-slate-700 mt-4 mb-2">
            {trimmedLine.replace(/\*\*/g, '')}
          </h4>
        );
      }
      
      if (/^\d+\./.test(trimmedLine)) {
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
    }).filter(Boolean);
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
          errorCount === 0 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {errorCount === 0 ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {errorCount === 0 
            ? 'Nenhum erro encontrado - Contrato aprovado!' 
            : `Análise concluída - Verificar pontos destacados`
          }
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
          Resultado da Análise:
        </h3>
        
        <div className="space-y-3">
          {formatContent(fullContent)}
        </div>
      </div>
    </div>
  );
};

export default FallbackAnalysisView;
