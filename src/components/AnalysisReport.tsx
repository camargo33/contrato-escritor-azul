
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, RotateCcw, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

interface AnalysisReportProps {
  content: string;
  timestamp: string;
  filename: string;
  onNewAnalysis: () => void;
}

interface ErrorAnalysis {
  severidade: 'critico' | 'alto' | 'medio' | 'baixo';
  campo: string;
  valor_encontrado: string;
  valor_esperado: string;
  sugestao_correcao: string;
  localizacao?: string;
  confianca: number;
}

interface AnalysisData {
  erros: ErrorAnalysis[];
  resumo: {
    total_erros: number;
    criticos: number;
    altos: number;
    medios: number;
    baixos: number;
  };
  status_geral: 'aprovado' | 'aprovado_com_restricoes' | 'reprovado';
}

const AnalysisReport = ({ content, timestamp, filename, onNewAnalysis }: AnalysisReportProps) => {
  const parseAnalysisContent = (content: string): { analysisData: AnalysisData | null; errorCount: number; fullContent: string } => {
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const analysisData = JSON.parse(jsonStr) as AnalysisData;
        return {
          analysisData,
          errorCount: analysisData.resumo?.total_erros || 0,
          fullContent: content
        };
      }
    } catch (error) {
      console.log("Erro ao parsear JSON, usando método de fallback:", error);
    }

    // Fallback para análises não estruturadas
    const errorPatterns = [
      /\d+\.\s*(.+)$/gm,
      /[-•]\s*(.+)$/gm,
      /erro/gi,
      /incorreto/gi,
      /faltando/gi,
      /inconsistente/gi,
      /problema/gi
    ];
    
    let errorCount = 0;
    errorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        errorCount += matches.length;
      }
    });

    if (errorCount === 0 && (content.toLowerCase().includes('erro') || content.toLowerCase().includes('incorreto'))) {
      errorCount = 1;
    }

    return { analysisData: null, errorCount, fullContent: content };
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'aprovado_com_restricoes':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'reprovado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

  const { analysisData, errorCount, fullContent } = parseAnalysisContent(content);

  return (
    <Card className="mt-6 bg-white border-2">
      <CardHeader className="bg-slate-700 text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Relatório de Revisão Contratual - CIABRASNET
        </CardTitle>
        <div className="text-sm text-slate-200 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Análise realizada em: {timestamp}
          </div>
          <div>Arquivo: {filename}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {analysisData ? (
          <div className="space-y-6">
            {/* Status Geral */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border ${getStatusColor(analysisData.status_geral)}`}>
                {analysisData.status_geral === 'aprovado' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                Status: {analysisData.status_geral.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Resumo de Erros */}
            {analysisData.resumo && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">{analysisData.resumo.total_erros}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700">{analysisData.resumo.criticos}</div>
                  <div className="text-sm text-red-600">Críticos</div>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-700">{analysisData.resumo.altos}</div>
                  <div className="text-sm text-orange-600">Altos</div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-700">{analysisData.resumo.medios}</div>
                  <div className="text-sm text-yellow-600">Médios</div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">{analysisData.resumo.baixos}</div>
                  <div className="text-sm text-blue-600">Baixos</div>
                </div>
              </div>
            )}

            {/* Lista de Erros */}
            {analysisData.erros && analysisData.erros.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
                  Erros Detectados:
                </h3>
                
                {analysisData.erros.map((erro, index) => (
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
            )}
          </div>
        ) : (
          // Fallback para análises não estruturadas
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
        )}

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <div className={`text-lg font-bold ${
              (analysisData?.status_geral === 'aprovado' || errorCount === 0) ? 'text-green-600' : 'text-slate-600'
            }`}>
              Status: {analysisData?.status_geral ? 
                analysisData.status_geral.replace('_', ' ') : 
                (errorCount === 0 ? 'Aprovado' : 'Análise concluída')
              }
            </div>
            
            <Button 
              onClick={onNewAnalysis}
              className="bg-slate-700 hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Gerar Nova Análise
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisReport;
