import { Card, CardContent } from "@/components/ui/card";
import AnalysisHeader from "./analysis/AnalysisHeader";
import ModelIdentificationCard from "./analysis/ModelIdentificationCard";
import StatusBadge from "./analysis/StatusBadge";
import ErrorListCard from "./analysis/ErrorListCard";
import AlertListCard from "./analysis/AlertListCard";
import FallbackAnalysisView from "./analysis/FallbackAnalysisView";
import AnalysisFooter from "./analysis/AnalysisFooter";
import FidelityAnalysisCard from "./analysis/FidelityAnalysisCard";
import TaxValidationCard from "./analysis/TaxValidationCard";

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
  explicacao?: string;
  localizacao?: string;
  local_origem?: string;
  severidade?: 'critico' | 'alto' | 'medio' | 'baixo';
  origem_erro?: string;
  correcao_necessaria?: string;
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
  caracteristicas_esperadas?: {
    valor: string;
    tipo: string;
    vigencia: string;
    taxa_instalacao: string;
    ip_fixo: string;
    rescisao: string;
  };
}

interface AlertItem {
  tipo: 'campo_vazio' | 'erro_digitacao' | 'formato_invalido' | 'valor_suspeito';
  campo: string;
  valor_encontrado: string;
  sugestao: string;
}

interface FidelityAnalysisData {
  opcao_fidelidade: string;
  valor_desconto_extraido?: string;
  texto_origem?: string;
  regra_aplicada?: string;
  marcacao_encontrada?: string;
  secao_ignorada?: string;
}

interface TaxValidationData {
  fidelidade: string;
  valor_desconto_fidelidade?: string;
  taxa_instalacao_encontrada: string;
  taxa_instalacao_status: string;
  taxa_instalacao_explicacao: string;
  taxa_rescisao_esperada: string;
  taxa_rescisao_encontrada: string;
  taxa_rescisao_status: string;
  taxa_rescisao_explicacao: string;
}

interface AnalysisData {
  modelo_identificado?: ModeloIdentificado;
  erros?: ErrorAnalysis[];
  alertas?: AlertItem[];
  validacoes_corretas?: ValidacaoCorreta[];
  resumo?: {
    total_erros: number;
    total_alertas?: number;
    criticos?: number;
    altos?: number;
    medios?: number;
    baixos?: number;
    plano_identificado?: string;
  };
  status_geral?: 'aprovado' | 'reprovado';
  observacoes?: string[];
  analise_fidelidade?: FidelityAnalysisData;
  validacao_taxas?: TaxValidationData;
}

const AnalysisReport = ({ content, timestamp, filename, onNewAnalysis }: AnalysisReportProps) => {
  console.log("🔍 [AnalysisReport] Iniciando processamento do content:", content?.substring(0, 200));

  const parseAnalysisContent = (content: string): { analysisData: AnalysisData | null; errorCount: number; fullContent: string } => {
    console.log("🔍 [DEBUG] Iniciando parseAnalysisContent...");
    console.log("📄 Content recebido (primeiros 300 chars):", content?.substring(0, 300));
    
    try {
      let jsonData: any = null;
      
      // Tentar diferentes métodos de parsing
      
      // 1. Se já é um objeto JSON
      if (typeof content === 'object') {
        console.log("✅ Content já é objeto JSON");
        jsonData = content;
      }
      // 2. Tentar parse direto
      else if (content.trim().startsWith('{')) {
        console.log("🔄 Tentando parse direto...");
        jsonData = JSON.parse(content);
        console.log("✅ Parse direto funcionou!");
      }
      // 3. Procurar JSON em markdown
      else {
        console.log("🔍 Procurando JSON em markdown...");
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*(\{[\s\S]*?\})\s*```/) || content.match(/(\{[\s\S]*\})/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          console.log("📋 JSON extraído (primeiros 200 chars):", jsonStr.substring(0, 200));
          
          // Limpar caracteres de escape
          let cleanJsonStr = jsonStr
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .trim();
          
          jsonData = JSON.parse(cleanJsonStr);
          console.log("✅ Parse do markdown funcionou!");
        }
      }
      
      if (jsonData) {
        console.log("📊 Estrutura dos dados parseados:", {
          hasModelo: !!jsonData.modelo_identificado,
          hasAnalyseFidelidade: !!jsonData.analise_fidelidade,
          hasValidacaoTaxas: !!jsonData.validacao_taxas,
          hasErros: !!jsonData.erros,
          numErros: jsonData.erros?.length || 0,
          hasAlertas: !!jsonData.alertas,
          numAlertas: jsonData.alertas?.length || 0,
          statusGeral: jsonData.status_geral
        });
        
        // 🚨 CORREÇÃO CRÍTICA: NÃO FILTRAR NENHUM ERRO!
        // Aceitar TODOS os erros que vieram do backend
        const errosOriginais = jsonData.erros || [];
        const alertasOriginais = jsonData.alertas || [];
        
        console.log("🔍 ERROS ORIGINAIS (SEM FILTRAGEM):", errosOriginais);
        console.log("🔍 ALERTAS ORIGINAIS (SEM FILTRAGEM):", alertasOriginais);
        
        // Criar dados padronizados SEM FILTRAGEM
        const analysisData: AnalysisData = {
          modelo_identificado: jsonData.modelo_identificado,
          erros: errosOriginais, // 🚨 USAR TODOS OS ERROS ORIGINAIS
          alertas: alertasOriginais, // 🚨 USAR TODOS OS ALERTAS ORIGINAIS
          validacoes_corretas: jsonData.validacoes_corretas || [],
          resumo: jsonData.resumo || { total_erros: 0 },
          status_geral: jsonData.status_geral || 'aprovado',
          observacoes: jsonData.observacoes || [],
          analise_fidelidade: jsonData.analise_fidelidade,
          validacao_taxas: jsonData.validacao_taxas
        };
        
        // Calcular contadores por severidade (usando erros originais)
        const contadores = errosOriginais.reduce((acc: Record<string, number>, erro: ErrorAnalysis) => {
          const sev = erro.severidade || 'medio';
          acc[sev] = (acc[sev] || 0) + 1;
          return acc;
        }, {});
        
        // Atualizar resumo com dados reais
        analysisData.resumo = {
          ...analysisData.resumo,
          total_erros: errosOriginais.length,
          total_alertas: alertasOriginais.length,
          criticos: contadores.critico || 0,
          altos: contadores.alto || 0,
          medios: contadores.medio || 0,
          baixos: contadores.baixo || 0
        };
        
        // Status baseado em erros críticos e altos
        const temErrosCriticos = (contadores.critico || 0) > 0 || (contadores.alto || 0) > 0;
        analysisData.status_geral = temErrosCriticos ? 'reprovado' : (jsonData.status_geral || 'aprovado');
        
        console.log("✅ Análise processada SEM FILTRAGEM!");
        console.log("📈 Estatísticas finais:", {
          erros: errosOriginais.length,
          alertas: alertasOriginais.length,
          status: analysisData.status_geral,
          criticos: contadores.critico || 0,
          altos: contadores.alto || 0,
          medios: contadores.medio || 0,
          baixos: contadores.baixo || 0
        });
        
        return {
          analysisData,
          errorCount: errosOriginais.length,
          fullContent: content
        };
      }
    } catch (error) {
      console.error("❌ Erro no parsing:", error);
      console.log("📄 Content que falhou (primeiros 500 chars):", content?.substring(0, 500));
    }

    // Fallback
    console.log("⚠️ Usando fallback para análises não estruturadas");
    const errorPatterns = [/\d+\.\s*(.+)$/gm, /[-•]\s*(.+)$/gm, /erro/gi, /incorreto/gi];
    let errorCount = 0;
    errorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) errorCount += matches.length;
    });

    return { analysisData: null, errorCount, fullContent: content };
  };

  const { analysisData, errorCount, fullContent } = parseAnalysisContent(content);

  console.log("🔍 [AnalysisReport] Dados finais para renderização:", {
    hasAnalysisData: !!analysisData,
    numErros: analysisData?.erros?.length || 0,
    numAlertas: analysisData?.alertas?.length || 0,
    statusGeral: analysisData?.status_geral,
    errorCount
  });

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
            {analysisData.status_geral && (
              <StatusBadge status={analysisData.status_geral} />
            )}

            {/* Análise da Fidelidade */}
            {analysisData.analise_fidelidade && (
              <FidelityAnalysisCard fidelityData={analysisData.analise_fidelidade} />
            )}

            {/* Validação de Taxas */}
            {analysisData.validacao_taxas && (
              <TaxValidationCard taxData={analysisData.validacao_taxas} />
            )}

            {/* Resumo Detalhado */}
            {(analysisData.resumo && (analysisData.resumo.total_erros > 0 || (analysisData.alertas && analysisData.alertas.length > 0))) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resumo de Erros */}
                {analysisData.resumo.total_erros > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-red-700">{analysisData.resumo.total_erros}</div>
                      <div className="text-sm text-red-600">Erros Encontrados</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-red-600">{analysisData.resumo.criticos || 0}</div>
                        <div className="text-red-500">Críticos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-600">{analysisData.resumo.altos || 0}</div>
                        <div className="text-orange-500">Altos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">{analysisData.resumo.medios || 0}</div>
                        <div className="text-yellow-500">Médios</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{analysisData.resumo.baixos || 0}</div>
                        <div className="text-blue-500">Baixos</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumo de Alertas */}
                {analysisData.alertas && analysisData.alertas.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-yellow-700">{analysisData.alertas.length}</div>
                      <div className="text-sm text-yellow-600">Alertas Detectados</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lista de Erros - SEMPRE MOSTRAR SE EXISTIR */}
            {analysisData.erros && analysisData.erros.length > 0 && (
              <ErrorListCard erros={analysisData.erros} />
            )}

            {/* Lista de Alertas - SEMPRE MOSTRAR SE EXISTIR */}
            {analysisData.alertas && analysisData.alertas.length > 0 && (
              <AlertListCard alertas={analysisData.alertas} />
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
            {(!analysisData.erros || analysisData.erros.length === 0) && (
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