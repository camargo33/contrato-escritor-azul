import { Card, CardContent } from "@/components/ui/card";
import AnalysisHeader from "./analysis/AnalysisHeader";
import ModelIdentificationCard from "./analysis/ModelIdentificationCard";
import StatusBadge from "./analysis/StatusBadge";
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
  campo: string;
  valor_encontrado: string;
  valor_esperado: string;
  sugestao_correcao: string;
  localizacao: string;
  severidade: 'critico' | 'alto' | 'medio' | 'baixo';
}

interface ValidacaoCorreta {
  campo: string;
  valor: string;
  status: string;
}

interface ModeloIdentificado {
  nome: string;
  confianca: number;
  criterios_identificacao: string[];
  caracteristicas_esperadas: {
    valor: string;
    tipo: string;
    vigencia: string;
    taxa_instalacao: string;
    ip_fixo: string;
    rescisao: string;
  };
}

interface AlertaAnalysis {
  tipo: 'erro_digitacao' | 'formato_invalido' | 'campo_suspeito';
  campo: string;
  valor_encontrado: string;
  sugestao: string;
}

interface CalculoTaxaRescisao {
  fidelidade_marcada: boolean;
  taxa_instalacao_encontrada: string;
  taxa_instalacao_correta?: string;
  calculo_incorreto?: string;
  calculo_correto: string;
  observacao: string;
}

interface AnalysisData {
  modelo_identificado: ModeloIdentificado;
  erros: ErrorAnalysis[];
  alertas: AlertaAnalysis[];
  validacoes_corretas: ValidacaoCorreta[];
  calculo_taxa_rescisao?: CalculoTaxaRescisao;
  resumo: {
    total_erros: number;
    total_alertas?: number;
    criticos: number;
    altos: number;
    medios: number;
    baixos: number;
    plano_identificado: string;
    principais_problemas?: string[];
  };
  status_geral: 'aprovado' | 'reprovado';
  observacoes: string[];
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
      if (!value || typeof value !== 'string') return '';
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
      if (!text || typeof text !== 'string') return '';
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
        
        // Garantir que erros é um array válido
        const errosArray = Array.isArray(analysisData.erros) ? analysisData.erros : [];
        
        // Filtrar apenas erros reais com verificação de segurança
        const errosReais = errosArray.filter(erro => {
          // Verificar se o erro tem as propriedades necessárias
          if (!erro || typeof erro !== 'object') return false;
          if (!erro.hasOwnProperty('valor_encontrado') || !erro.hasOwnProperty('valor_esperado')) return false;
          return isRealError(erro);
        });
        
        // Recalcular estatísticas baseadas nos erros reais
        const resumoAtualizado = {
          ...analysisData.resumo,
          total_erros: errosReais.length,
        };

        // Atualizar status baseado nos erros reais
        let statusAtualizado = analysisData.status_geral;
        if (errosReais.length === 0) {
          statusAtualizado = 'aprovado';
        } else {
          statusAtualizado = 'reprovado';
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

            {/* Resumo Detalhado de Erros */}
            {analysisData.resumo && analysisData.resumo.total_erros > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-red-700">{analysisData.resumo.total_erros}</div>
                  <div className="text-sm text-red-600">Erros Encontrados</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-red-600">{analysisData.resumo.criticos}</div>
                    <div className="text-red-500">Críticos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">{analysisData.resumo.altos}</div>
                    <div className="text-orange-500">Altos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">{analysisData.resumo.medios}</div>
                    <div className="text-yellow-500">Médios</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{analysisData.resumo.baixos}</div>
                    <div className="text-blue-500">Baixos</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Erros */}
            {analysisData.erros.length > 0 && (
              <ErrorListCard erros={analysisData.erros} />
            )}

            {/* Alertas */}
            {analysisData.alertas && analysisData.alertas.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">⚠️ Alertas Detectados ({analysisData.alertas.length})</h4>
                <div className="space-y-3">
                  {analysisData.alertas.map((alerta, index) => (
                    <div key={index} className="border-l-4 border-yellow-400 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-yellow-800">{alerta.campo || 'Campo não identificado'}</span>
                        <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded">
                          {alerta.tipo ? alerta.tipo.replace('_', ' ') : 'Alerta'}
                        </span>
                      </div>
                      <div className="text-sm text-yellow-700 mb-1">
                        <span className="font-medium">Encontrado:</span> {alerta.valor_encontrado || 'Não informado'}
                      </div>
                      <div className="text-sm text-yellow-600">
                        <span className="font-medium">Sugestão:</span> {alerta.sugestao || 'Verificar campo'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cálculo Taxa de Rescisão */}
            {analysisData.calculo_taxa_rescisao && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">🧮 Cálculo da Taxa de Rescisão</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-700">Fidelidade Marcada:</span>
                    <span className="text-blue-600">
                      {analysisData.calculo_taxa_rescisao.fidelidade_marcada ? "✅ Sim" : "❌ Não"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-700">Taxa de Instalação Encontrada:</span>
                    <span className="text-blue-600">{analysisData.calculo_taxa_rescisao.taxa_instalacao_encontrada}</span>
                  </div>
                  {analysisData.calculo_taxa_rescisao.taxa_instalacao_correta && (
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-700">Taxa de Instalação Correta:</span>
                      <span className="text-blue-600">{analysisData.calculo_taxa_rescisao.taxa_instalacao_correta}</span>
                    </div>
                   )}
                   {analysisData.calculo_taxa_rescisao.calculo_incorreto && (
                     <div className="flex justify-between text-red-600">
                       <span className="font-medium">Cálculo Incorreto:</span>
                       <span className="font-mono">{analysisData.calculo_taxa_rescisao.calculo_incorreto}</span>
                     </div>
                   )}
                   <div className="flex justify-between border-t pt-2">
                     <span className="font-medium text-blue-700">Cálculo Correto:</span>
                     <span className="text-blue-600 font-mono">{analysisData.calculo_taxa_rescisao.calculo_correto}</span>
                   </div>
                  <div className="text-blue-600 text-xs mt-2 italic">
                    {analysisData.calculo_taxa_rescisao.observacao}
                  </div>
                </div>
              </div>
            )}

            {/* Principais Problemas */}
            {analysisData.resumo.principais_problemas && analysisData.resumo.principais_problemas.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">🚨 Principais Problemas Detectados</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                  {analysisData.resumo.principais_problemas.map((problema, index) => (
                    <li key={index}>{problema}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validações Corretas */}
            {analysisData.validacoes_corretas && analysisData.validacoes_corretas.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">✅ Campos Validados Corretamente</h4>
                <div className="space-y-2">
                  {analysisData.validacoes_corretas.map((validacao, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-green-700">{validacao.campo}:</span>
                      <span className="text-green-600">{validacao.valor}</span>
                      <span className="text-green-500 text-xs">{validacao.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            {analysisData.observacoes && analysisData.observacoes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">📋 Observações da Análise</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                  {analysisData.observacoes.map((obs, index) => (
                    <li key={index}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mensagem quando não há erros */}
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
