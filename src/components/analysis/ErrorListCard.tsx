
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface ErrorAnalysis {
  severidade: 'critico' | 'alto' | 'medio' | 'baixo';
  campo: string;
  valor_encontrado: string;
  valor_esperado: string;
  sugestao_correcao: string;
  localizacao?: string;
  confianca: number;
}

interface ErrorListCardProps {
  erros: ErrorAnalysis[];
}

const ErrorListCard = ({ erros }: ErrorListCardProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critico':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'alto':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medio':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'baixo':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critico':
        return 'border-red-400 bg-red-50';
      case 'alto':
        return 'border-orange-400 bg-orange-50';
      case 'medio':
        return 'border-yellow-400 bg-yellow-50';
      case 'baixo':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critico':
        return 'text-red-700';
      case 'alto':
        return 'text-orange-700';
      case 'medio':
        return 'text-yellow-700';
      case 'baixo':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  if (!erros || erros.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
        Erros Detectados:
      </h3>
      
      {erros.map((erro, index) => (
        <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(erro.severidade)}`}>
          <div className="flex items-start gap-3">
            {getSeverityIcon(erro.severidade)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${getSeverityTextColor(erro.severidade)}`}>
                  {erro.severidade.toUpperCase()}
                </span>
                <span className="text-gray-600">•</span>
                <span className="font-medium text-gray-800">{erro.campo}</span>
                {erro.confianca && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-600">Confiança: {erro.confianca}%</span>
                  </>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Encontrado:</span>
                  <span className="ml-2 text-gray-800">{erro.valor_encontrado}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Esperado:</span>
                  <span className="ml-2 text-gray-800">{erro.valor_esperado}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sugestão:</span>
                  <span className="ml-2 text-gray-800">{erro.sugestao_correcao}</span>
                </div>
                {erro.localizacao && (
                  <div>
                    <span className="font-medium text-gray-700">Localização:</span>
                    <span className="ml-2 text-gray-800">{erro.localizacao}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ErrorListCard;
