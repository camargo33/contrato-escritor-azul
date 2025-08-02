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
  console.log("🔍 [AnalysisReport] INTERFACE ULTRA LIMPA - CONTADORES CORRETOS");

  // 🔧 FUNÇÃO PARA VALIDAR SE UM ERRO É REALMENTE VÁLIDO
  const isValidError = (error: any): boolean => {
    return (
      error &&
      typeof error === 'object' &&
      error.campo &&
      error.valor_encontrado &&
      typeof error.campo === 'string' &&
      error.campo.trim() !== '' &&
      error.campo !== 'undefined' &&
      error.campo !== 'null'
    );
  };

  // 🔧 FUNÇÃO PARA VALIDAR SE UM ALERTA É REALMENTE VÁLIDO
  const isValidAlert = (alert: any): boolean => {
    return (
      alert &&
      typeof alert === 'object' &&
      alert.campo &&
      alert.tipo &&
      typeof alert.campo === 'string' &&
      alert.campo.trim() !== '' &&
      alert.campo !== 'undefined' &&
      alert.campo !== 'null'
    );
  };

  const parseAnalysisContent = (content: string): { analysisData: AnalysisData | null; errorCount: number; fullContent: string } => {
    console.log("🔍 [FRONTEND] PARSING COM VALIDAÇÃO RIGOROSA DE CONTADORES");
    
    // 🛡️ PROTEÇÃO: Verificar se content existe
    if (!content) {
      console.error("❌ [FRONTEND] Content é null/undefined");
      return { analysisData: null, errorCount: 0, fullContent: '' };
    }
    
    try {
      let rawData: any = null;
      
      // 🔍 ETAPA 1: EXTRAIR DADOS - MÚLTIPLAS ESTRATÉGIAS, SEM EXIBIR JSON
      console.log("🔍 Tentando extrair dados...");
      
      // Estratégia 1: Se já é um objeto
      if (typeof content === 'object') {
        console.log("✅ Content já é objeto");
        rawData = content;
      }
      // Estratégia 2: Parse direto
      else if (content.trim().startsWith('{')) {
        console.log("🔄 Parse direto do JSON...");
        rawData = JSON.parse(content);
      }
      // Estratégia 3: Buscar JSON em markdown
      else {
        console.log("🔍 Procurando JSON em texto...");
        const patterns = [
          /```json\s*([^`]*?)\s*```/s,
          /```\s*(\{[^`]*?\})\s*```/s,
          /(\{[\s\S]*?\})/
        ];
        
        for (const pattern of patterns) {
          const match = content.match(pattern);
          if (match) {
            const jsonStr = match[1] || match[0];
            console.log("📋 JSON encontrado, parseando...");
            
            // Limpar o JSON
            const cleanJsonStr = jsonStr
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\\\/g, '\\')
              .trim();
            
            rawData = JSON.parse(cleanJsonStr);
            break;
          }
        }
      }
      
      if (!rawData) {
        console.warn("⚠️ [FRONTEND] JSON não encontrado, usando fallback limpo...");
        throw new Error("JSON não encontrado");
      }
      
      console.log("✅ [FRONTEND] Dados extraídos - validando rigorosamente");
      
      // 🔍 ETAPA 2: IDENTIFICAR FORMATO E EXTRAIR CAMPOS COM VALIDAÇÃO RIGOROSA
      let errosOriginais: ErrorAnalysis[] = [];
      let alertasOriginais: AlertItem[] = [];
      let modeloIdentificado: ModeloIdentificado | undefined;
      let statusGeral: 'aprovado' | 'reprovado' = 'aprovado';
      
      // 🧩 BUSCA INTELIGENTE POR ERROS E ALERTAS EM MÚLTIPLOS LOCAIS
      const possibleErrorFields = ['erros', 'errors', 'erro_list', 'validacoes', 'problems'];
      const possibleAlertFields = ['alertas', 'alerts', 'warnings', 'avisos', 'observacoes'];
      
      // Buscar erros COM VALIDAÇÃO
      for (const field of possibleErrorFields) {
        if (rawData[field] && Array.isArray(rawData[field])) {
          console.log(`🔍 [FRONTEND] Validando erros em '${field}':`, rawData[field].length);
          const validErrors = rawData[field].filter(isValidError);
          console.log(`✅ [FRONTEND] Erros válidos em '${field}':`, validErrors.length);
          if (validErrors.length > 0) {
            errosOriginais = validErrors;
            break;
          }
        }
      }
      
      // Buscar alertas COM VALIDAÇÃO
      for (const field of possibleAlertFields) {
        if (rawData[field] && Array.isArray(rawData[field])) {
          console.log(`🔍 [FRONTEND] Validando alertas em '${field}':`, rawData[field].length);
          const validAlerts = rawData[field].filter(isValidAlert);
          console.log(`✅ [FRONTEND] Alertas válidos em '${field}':`, validAlerts.length);
          if (validAlerts.length > 0) {
            alertasOriginais = validAlerts;
            break;
          }
        }
      }
      
      // Buscar modelo identificado
      const possibleModelFields = ['modelo_identificado', 'model_identified', 'modelo', 'auto_identified_model'];
      for (const field of possibleModelFields) {
        if (rawData[field]) {
          console.log(`✅ [FRONTEND] Modelo encontrado em '${field}'`);
          modeloIdentificado = rawData[field];
          break;
        }
      }
      
      // Buscar status
      const possibleStatusFields = ['status_geral', 'status', 'resultado', 'aprovado'];
      for (const field of possibleStatusFields) {
        if (rawData[field]) {
          console.log(`✅ [FRONTEND] Status encontrado em '${field}':`, rawData[field]);
          statusGeral = rawData[field] === 'aprovado' || rawData[field] === 'approved' ? 'aprovado' : 'reprovado';
          break;
        }
      }
      
      // 🧮 BUSCA EM METADATA COM VALIDAÇÃO
      if (rawData.metadata && typeof rawData.metadata === 'object') {
        console.log("🔍 [FRONTEND] Verificando metadata...");
        
        if (rawData.metadata.auto_identified_model) {
          console.log("✅ [FRONTEND] Modelo encontrado em metadata");
          modeloIdentificado = rawData.metadata.auto_identified_model;
        }
        
        if (rawData.metadata.additional_validations) {
          console.log("✅ [FRONTEND] Validações adicionais encontradas");
          const validations = rawData.metadata.additional_validations;
          
          if (validations.errors && Array.isArray(validations.errors)) {
            const validErrors = validations.errors.filter(isValidError);
            if (validErrors.length > 0) {
              errosOriginais = validErrors;
            }
          }
          if (validations.warnings && Array.isArray(validations.warnings)) {
            const validAlerts = validations.warnings.filter(isValidAlert);
            if (validAlerts.length > 0) {
              alertasOriginais = validAlerts;
            }
          }
        }
      }
      
      // 🔍 EXTRAÇÃO FINAL COM VALIDAÇÃO RIGOROSA
      if (errosOriginais.length === 0 && alertasOriginais.length === 0) {
        console.log("🔍 [FRONTEND] Tentando extração profunda com validação...");
        
        // Buscar em todos os objetos aninhados
        const searchInObject = (obj: any, depth = 0): void => {
          if (depth > 3) return; // Evitar recursão infinita
          
          for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value) && value.length > 0) {
              // Validar se é array de erros
              const validErrors = value.filter(isValidError);
              if (validErrors.length > 0 && errosOriginais.length === 0) {
                console.log(`🔍 [FRONTEND] Erros válidos em '${key}':`, validErrors.length);
                errosOriginais = validErrors;
              }
              
              // Validar se é array de alertas
              const validAlerts = value.filter(isValidAlert);
              if (validAlerts.length > 0 && alertasOriginais.length === 0) {
                console.log(`🔍 [FRONTEND] Alertas válidos em '${key}':`, validAlerts.length);
                alertasOriginais = validAlerts;
              }
            } else if (typeof value === 'object' && value !== null) {
              searchInObject(value, depth + 1);
            }
          }
        };
        
        searchInObject(rawData);
      }
      
      console.log("📊 [FRONTEND] EXTRAÇÃO COM VALIDAÇÃO RIGOROSA:");
      console.log(`  - Erros válidos: ${errosOriginais.length}`);
      console.log(`  - Alertas válidos: ${alertasOriginais.length}`);
      console.log(`  - Modelo: ${modeloIdentificado ? 'SIM' : 'NÃO'}`);
      console.log(`  - Status: ${statusGeral}`);
      
      // 🏗️ CONSTRUIR ANÁLISE FINAL LIMPA COM CONTADORES CORRETOS
      const analysisData: AnalysisData = {
        modelo_identificado: modeloIdentificado,
        erros: errosOriginais,
        alertas: alertasOriginais,
        validacoes_corretas: rawData.validacoes_corretas || [],
        resumo: {
          total_erros: errosOriginais.length, // CONTAGEM CORRETA
          total_alertas: alertasOriginais.length, // CONTAGEM CORRETA
          criticos: errosOriginais.filter(e => e.severidade === 'critico').length,
          altos: errosOriginais.filter(e => e.severidade === 'alto').length,
          medios: errosOriginais.filter(e => e.severidade === 'medio').length,
          baixos: errosOriginais.filter(e => e.severidade === 'baixo').length
        },
        status_geral: statusGeral,
        observacoes: rawData.observacoes || [],
        analise_fidelidade: rawData.analise_fidelidade,
        validacao_taxas: rawData.validacao_taxas
      };
      
      // Atualizar status baseado em erros críticos REAIS
      const temErrosCriticos = analysisData.resumo!.criticos! > 0 || analysisData.resumo!.altos! > 0;
      if (temErrosCriticos) {
        analysisData.status_geral = 'reprovado';
      }
      
      console.log("✅ [FRONTEND] ANÁLISE COM CONTADORES CORRETOS CONSTRUÍDA!");
      
      return {
        analysisData,
        errorCount: errosOriginais.length, // CONTAGEM CORRETA
        fullContent: '' // 🚨 CRÍTICO: NÃO PASSAR JSON BRUTO
      };
      
    } catch (error) {
      console.error("❌ [FRONTEND] Erro no parsing:", error);
      
      // 🆘 FALLBACK FINAL LIMPO - SEM JSON
      console.log("🆘 [FRONTEND] Usando fallback ultra limpo");
      
      // Contar possíveis erros sem mostrar JSON
      const errorPatterns = [/erro/gi, /incorreto/gi, /inválido/gi, /crítico/gi];
      let errorCount = 0;
      errorPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) errorCount += matches.length;
      });
      
      return { 
        analysisData: null, 
        errorCount, 
        fullContent: content // Só para fallback, que agora filtra JSON
      };
    }
  };

  const { analysisData, errorCount, fullContent } = parseAnalysisContent(content);

  // 🧮 CONTADORES FINAIS RIGOROSAMENTE VALIDADOS
  const errosValidos = analysisData?.erros?.filter(isValidError) || [];
  const alertasValidos = analysisData?.alertas?.filter(isValidAlert) || [];
  const temErrosReais = errosValidos.length > 0;
  const temAlertasReais = alertasValidos.length > 0;

  console.log("🎯 [FRONTEND] RENDERIZAÇÃO COM CONTADORES CORRETOS:");
  console.log("  - analysisData exists:", !!analysisData);
  console.log("  - erros válidos:", errosValidos.length);
  console.log("  - alertas válidos:", alertasValidos.length);
  console.log("  - tem erros reais:", temErrosReais);
  console.log("  - tem alertas reais:", temAlertasReais);
  console.log("  - status:", analysisData?.status_geral);

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

            {/* 🚨 APENAS MOSTRAR RESUMO SE HOUVER ERROS OU ALERTAS REAIS */}
            {(temErrosReais || temAlertasReais) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resumo de Erros - SÓ SE TIVER ERROS REAIS */}
                {temErrosReais && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-red-700">{errosValidos.length}</div>
                      <div className="text-sm text-red-600">Erros Encontrados</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-red-600">{errosValidos.filter(e => e.severidade === 'critico').length}</div>
                        <div className="text-red-500">Críticos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-600">{errosValidos.filter(e => e.severidade === 'alto').length}</div>
                        <div className="text-orange-500">Altos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">{errosValidos.filter(e => e.severidade === 'medio').length}</div>
                        <div className="text-yellow-500">Médios</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{errosValidos.filter(e => e.severidade === 'baixo').length}</div>
                        <div className="text-blue-500">Baixos</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumo de Alertas - SÓ SE TIVER ALERTAS REAIS */}
                {temAlertasReais && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-yellow-700">{alertasValidos.length}</div>
                      <div className="text-sm text-yellow-600">Alertas Detectados</div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Lista de Erros - APENAS SE EXISTIR ERROS REAIS */}
            {temErrosReais && (
              <ErrorListCard erros={errosValidos} />
            )}

            {/* Lista de Alertas - APENAS SE EXISTIR ALERTAS REAIS */}
            {temAlertasReais && (
              <AlertListCard alertas={alertasValidos} />
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

            {/* Observações - APENAS SE EXISTIR E SEM JSON */}
            {analysisData.observacoes && analysisData.observacoes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">📋 Observações da Análise</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                  {analysisData.observacoes
                    .filter(obs => !obs.includes('{') && !obs.includes('"') && obs.length < 200) // Filtrar JSON
                    .map((obs, index) => (
                      <li key={index}>{obs}</li>
                    ))}
                </ul>
              </div>
            )}

            {/* 🎉 MENSAGEM QUANDO NÃO HÁ ERROS REAIS - INTERFACE LIMPA */}
            {!temErrosReais && !temAlertasReais && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="font-medium">Nenhum alerta foi detectado</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Todos os campos estão dentro do padrão esperado.
                </p>
              </div>
            )}
          </div>
        ) : (
          // 🆘 Fallback ULTRA LIMPO - SEM JSON BRUTO
          <FallbackAnalysisView errorCount={errorCount} fullContent={fullContent} />
        )}

        <AnalysisFooter 
          statusGeral={analysisData?.status_geral}
          errorCount={errosValidos.length} // USAR CONTAGEM CORRETA
          onNewAnalysis={onNewAnalysis}
        />
      </CardContent>
    </Card>
  );
};

export default AnalysisReport;