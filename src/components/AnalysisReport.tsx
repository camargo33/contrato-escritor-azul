
import { Card, CardContent } from "@/components/ui/card";
import AnalysisHeader from "./analysis/AnalysisHeader";
import ModelIdentificationCard from "./analysis/ModelIdentificationCard";
import StatusBadge from "./analysis/StatusBadge";
import ErrorSummaryGrid from "./analysis/ErrorSummaryGrid";
import ErrorListCard from "./analysis/ErrorListCard";
import FallbackAnalysisView from "./analysis/FallbackAnalysisView";
import AnalysisFooter from "./analysis/AnalysisFooter";

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

interface ModeloIdentificado {
  nome: string;
  confianca: number;
  criterios_identificacao?: string[];
  caracteristicas_esperadas?: {
    valor?: string;
    tipo?: string;
    vigencia?: string;
    taxa_instalacao?: string;
    rescisao?: string;
  };
  observacao?: string;
}

interface AnalysisData {
  modelo_identificado?: ModeloIdentificado;
  erros: ErrorAnalysis[];
  resumo: {
    total_erros: number;
    criticos: number;
    altos: number;
    medios: number;
    baixos: number;
    plano_identificado?: string;
  };
  status_geral: 'aprovado' | 'aprovado_com_restricoes' | 'reprovado';
}

const AnalysisReport = ({ content, timestamp, filename, onNewAnalysis }: AnalysisReportProps) => {
  // Função para verificar se é um erro real (mesma lógica do ErrorListCard)
  const isRealError = (erro: ErrorAnalysis): boolean => {
    const encontrado = erro.valor_encontrado?.toString().trim() || '';
    const esperado = erro.valor_esperado?.toString().trim() || '';
    
    if (encontrado === esperado) {
      return false;
    }
    
    const normalizeMoney = (value: string) => {
      return value.replace(/[R$\s]/g, '').replace(',', '.');
    };
    
    if (encontrado.includes('R$') && esperado.includes('R$')) {
      const encontradoNum = normalizeMoney(encontrado);
      const esperadoNum = normalizeMoney(esperado);
      if (encontradoNum === esperadoNum) {
        return false;
      }
    }
    
    const normalizeText = (text: string) => {
      return text.toLowerCase().replace(/\s+/g, ' ').trim();
    };
    
    if (normalizeText(encontrado) === normalizeText(esperado)) {
      return false;
    }
    
    return true;
  };

  const parseAnalysisContent = (content: string): { analysisData: AnalysisData | null; errorCount: number; fullContent: string } => {
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const analysisData = JSON.parse(jsonStr) as AnalysisData;
        
        // Filtrar apenas erros reais
        const errosReais = analysisData.erros.filter(isRealError);
        
        // Recalcular estatísticas baseadas nos erros reais
        const resumoAtualizado = {
          ...analysisData.resumo,
          total_erros: errosReais.length,
          criticos: errosReais.filter(e => e.severidade === 'critico').length,
          altos: errosReais.filter(e => e.severidade === 'alto').length,
          medios: errosReais.filter(e => e.severidade === 'medio').length,
          baixos: errosReais.filter(e => e.severidade === 'baixo').length,
        };

        // Atualizar status baseado nos erros reais
        let statusAtualizado = analysisData.status_geral;
        if (errosReais.length === 0) {
          statusAtualizado = 'aprovado';
        } else if (errosReais.some(e => e.severidade === 'critico')) {
          statusAtualizado = 'reprovado';
        } else {
          statusAtualizado = 'aprovado_com_restricoes';
        }
        
        return {
          analysisData: {
            ...analysisData,
            erros: errosReais,
            resumo: resumoAtualizado,
            status_geral: statusAtualizado
          },
          errorCount: errosReais.length,
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

  const { analysisData, errorCount, fullContent } = parseAnalysisContent(content);

  return (
    <Card className="mt-6 bg-white border-2">
      <AnalysisHeader timestamp={timestamp} filename={filename} />
      
      <CardContent className="p-6">
        {analysisData ? (
          <div className="space-y-6">
            {/* Modelo Identificado */}
            {analysisData.modelo_identificado && (
              <ModelIdentificationCard modelo={analysisData.modelo_identificado} />
            )}

            {/* Status Geral */}
            <StatusBadge status={analysisData.status_geral} />

            {/* Resumo de Erros */}
            {analysisData.resumo && (
              <ErrorSummaryGrid resumo={analysisData.resumo} />
            )}

            {/* Lista de Erros - agora só mostra erros reais */}
            <ErrorListCard erros={analysisData.erros} />

            {/* Mensagem quando não há erros reais */}
            {analysisData.erros.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="font-medium">Contrato Aprovado</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Todos os campos estão corretos conforme esperado. Nenhuma correção é necessária.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Fallback para análises não estruturadas
          <FallbackAnalysisView errorCount={errorCount} fullContent={fullContent} />
        )}

        <AnalysisFooter 
          statusGeral={analysisData?.status_geral}
          errorCount={errorCount}
          onNewAnalysis={onNewAnalysis}
        />
      </CardContent>
    </Card>
  );
};

export default AnalysisReport;
