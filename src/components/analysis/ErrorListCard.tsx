import { AlertCircle, AlertTriangle, XCircle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ErrorAnalysis {
  severidade?: string;
  campo: string;
  valor_encontrado: string;
  valor_esperado: string;
  sugestao_correcao: string;
  explicacao?: string;
  localizacao?: string;
  local_origem?: string;
  confianca?: number;
  origem_erro?: string;
  correcao_necessaria?: string;
}

interface ErrorListCardProps {
  erros: ErrorAnalysis[];
}

const ErrorListCard = ({ erros }: ErrorListCardProps) => {
  // Função para verificar se é um erro real (valores diferentes)
  const isRealError = (erro: ErrorAnalysis): boolean => {
    const encontrado = erro.valor_encontrado?.toString().trim() || '';
    const esperado = erro.valor_esperado?.toString().trim() || '';
    
    // Se os valores são idênticos, não é um erro real
    if (encontrado === esperado) {
      return false;
    }
    
    // Normalizar valores monetários para comparação
    const normalizeMoney = (value: string) => {
      return value.replace(/[R$\s]/g, '').replace(',', '.');
    };
    
    // Se ambos parecem ser valores monetários, comparar numericamente
    if (encontrado.includes('R$') && esperado.includes('R$')) {
      const encontradoNum = normalizeMoney(encontrado);
      const esperadoNum = normalizeMoney(esperado);
      if (encontradoNum === esperadoNum) {
        return false;
      }
    }
    
    // Normalizar texto (maiúsculas, espaços)
    const normalizeText = (text: string) => {
      return text.toLowerCase().replace(/\s+/g, ' ').trim();
    };
    
    if (normalizeText(encontrado) === normalizeText(esperado)) {
      return false;
    }
    
    return true;
  };

  // Função para obter ícone baseado na severidade
  const getSeverityIcon = (severidade?: string) => {
    switch (severidade?.toLowerCase()) {
      case 'critico':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'alto':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medio':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'baixo':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  // Função para obter cores baseadas na severidade
  const getSeverityColors = (severidade?: string) => {
    switch (severidade?.toLowerCase()) {
      case 'critico':
        return {
          border: 'border-red-400',
          bg: 'bg-red-50',
          badge: 'bg-red-600 text-white',
          text: 'text-red-800'
        };
      case 'alto':
        return {
          border: 'border-orange-400',
          bg: 'bg-orange-50',
          badge: 'bg-orange-600 text-white',
          text: 'text-orange-800'
        };
      case 'medio':
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-600 text-white',
          text: 'text-yellow-800'
        };
      case 'baixo':
        return {
          border: 'border-blue-400',
          bg: 'bg-blue-50',
          badge: 'bg-blue-600 text-white',
          text: 'text-blue-800'
        };
      default:
        return {
          border: 'border-red-400',
          bg: 'bg-red-50',
          badge: 'bg-red-600 text-white',
          text: 'text-red-800'
        };
    }
  };

  // Filtrar apenas erros reais
  const errosReais = erros.filter(isRealError);

  // Se não há erros reais, não mostrar a seção
  if (!errosReais || errosReais.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <XCircle className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-slate-700">Erros Detectados ({errosReais.length})</h3>
      </div>
      
      <div className="space-y-4">
        {errosReais.map((erro, index) => {
          const colors = getSeverityColors(erro.severidade);
          
          return (
            <Card key={index} className={`border-2 ${colors.border} ${colors.bg}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getSeverityIcon(erro.severidade)}
                    <span className={colors.text}>{erro.campo}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {erro.severidade && (
                      <Badge variant="default" className={`text-xs font-medium ${colors.badge}`}>
                        {erro.severidade.toUpperCase()}
                      </Badge>
                    )}
                    {erro.confianca && (
                      <Badge variant="outline" className="text-xs">
                        {erro.confianca}% confiança
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Comparação de Valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-700 mb-1">❌ Valor Encontrado</div>
                    <div className="text-lg font-semibold text-red-800">{erro.valor_encontrado}</div>
                  </div>
                  
                  <div className="p-3 bg-white border border-green-200 rounded-lg">
                    <div className="text-sm font-medium text-green-700 mb-1">✅ Valor Esperado</div>
                    <div className="text-lg font-semibold text-green-800">{erro.valor_esperado}</div>
                  </div>
                </div>

                {/* Explicação (se disponível) */}
                {erro.explicacao && (
                  <div className="p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">💡 Explicação</div>
                    <div className="text-sm text-blue-800">{erro.explicacao}</div>
                  </div>
                )}

                {/* Sugestão de Correção */}
                <div className="p-3 bg-white border border-purple-200 rounded-lg">
                  <div className="text-sm font-medium text-purple-700 mb-1">🔧 Correção Necessária</div>
                  <div className="text-sm text-purple-800">
                    {erro.correcao_necessaria || erro.sugestao_correcao}
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {(erro.localizacao || erro.local_origem) && (
                    <div className="p-2 bg-white border border-gray-200 rounded">
                      <span className="font-medium text-gray-700">📍 Localização:</span>
                      <div className="text-gray-800 mt-1">{erro.local_origem || erro.localizacao}</div>
                    </div>
                  )}
                  
                  {erro.origem_erro && (
                    <div className="p-2 bg-white border border-gray-200 rounded">
                      <span className="font-medium text-gray-700">🔍 Origem do Erro:</span>
                      <div className="text-gray-800 mt-1">{erro.origem_erro}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo de Ações */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-800">📋 Próximos Passos</span>
        </div>
        <div className="text-sm text-gray-700">
          {errosReais.length === 1 ? (
            'Corrija o erro identificado acima antes de aprovar o contrato.'
          ) : (
            `Corrija os ${errosReais.length} erros identificados acima antes de aprovar o contrato.`
          )}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          💡 Dica: Use as sugestões de correção para ajustar os valores no contrato.
        </div>
      </div>
    </div>
  );
};

export default ErrorListCard;