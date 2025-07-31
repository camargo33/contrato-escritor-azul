import { supabase } from '@/integrations/supabase/client';
import { contractService } from './contractService';

export interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
  debug?: any;
}

export const openaiService = {
  async analyzeContract(contractText: string, filename: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log("=== INICIANDO ANÁLISE COM OPENROUTER ===");
      console.log("📁 Arquivo:", filename);
      console.log("📊 Tamanho:", contractText.length, "caracteres");
      console.log("📝 Preview:", contractText.substring(0, 200) + "...");

      // Validações básicas
      if (!contractText || contractText.trim().length < 50) {
        throw new Error("Texto do contrato muito curto ou vazio");
      }

      console.log("📡 Enviando para função Supabase 'analyze-contract'...");
      
      const response = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText: contractText.trim(),
          filename: filename
        }
      });

      console.log("=== RESPOSTA DA FUNÇÃO SUPABASE ===");
      console.log("🔴 Erro:", response.error);
      console.log("🟢 Dados:", response.data);
      console.log("📊 Response:", response);
      
      if (response.error) {
        console.error("❌ Erro direto da função:", response.error);
        
        let errorMessage = "Erro na análise";
        
        // Identificar tipos específicos de erro
        if (response.error.message) {
          const errorMsg = response.error.message.toLowerCase();
          
          if (errorMsg.includes('api key') || errorMsg.includes('unauthorized')) {
            errorMessage = "❌ API Key OpenRouter não configurada ou inválida. Verifique nos secrets do Supabase.";
          } else if (errorMsg.includes('timeout') || errorMsg.includes('60s')) {
            errorMessage = "⏱️ Timeout (60s). Tente arquivo menor.";
          } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
            errorMessage = "🚫 Limite de uso atingido. Aguarde alguns minutos.";
          } else if (errorMsg.includes('400') || errorMsg.includes('bad request')) {
            errorMessage = "📝 Erro no formato. Verifique o arquivo.";
          } else if (errorMsg.includes('503') || errorMsg.includes('service unavailable')) {
            errorMessage = "🔧 Serviço indisponível. Tente novamente.";
          } else {
            errorMessage = response.error.message;
          }
        }
        
        return {
          success: false,
          error: errorMessage,
          timestamp: new Date().toLocaleString('pt-BR'),
          filename,
          debug: {
            response_error: response.error
          }
        };
      }

      if (!response.data) {
        console.error("❌ Resposta vazia");
        return {
          success: false,
          error: "Resposta vazia da função. Tente novamente.",
          timestamp: new Date().toLocaleString('pt-BR'),
          filename,
          debug: { empty_response: true }
        };
      }

      if (response.data && response.data.success) {
        console.log("✅ Análise concluída!");
        
        const analysisResult = response.data;
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 🔄 SALVAMENTO ROBUSTO NO HISTÓRICO
        console.log("💾 Iniciando salvamento no histórico...");
        
        let historySaved = false;
        let historyError = null;
        
        try {
          const saveResult = await this.saveAnalysisToHistory(
            filename,
            analysisResult.content,
            duration
          );
          
          if (saveResult) {
            console.log("✅ Salvo no histórico com sucesso!");
            historySaved = true;
          } else {
            console.warn("⚠️ Falha ao salvar no histórico (continuando)");
            historyError = "Falha no salvamento";
          }
          
        } catch (saveError) {
          console.error("❌ Erro ao salvar no histórico:", saveError);
          historyError = saveError;
        }

        // Aguardar um pouco para garantir que foi salvo
        if (historySaved) {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log("⏱️ Aguardado 500ms para garantir salvamento");
        }

        return {
          ...analysisResult,
          debug: {
            duration_ms: duration,
            saved_to_history: historySaved,
            history_error: historyError,
            save_timestamp: new Date().toISOString()
          }
        };
      } else {
        console.error("❌ Falha indicada:", response.data);
        return {
          success: false,
          error: response.data?.error || "Erro desconhecido",
          timestamp: new Date().toLocaleString('pt-BR'),
          filename,
          debug: response.data
        };
      }
    } catch (error: any) {
      console.error("=== ERRO CRÍTICO ===");
      console.error("Tipo:", error.name);
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
      
      let errorMessage = "Erro inesperado";
      
      if (error.message?.includes('fetch')) {
        errorMessage = "🌐 Erro de conexão. Verifique internet.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "⏱️ Timeout na requisição.";
      } else if (error.message?.includes('JSON')) {
        errorMessage = "📄 Erro ao processar resposta.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toLocaleString('pt-BR'),
        filename,
        debug: {
          error_name: error.name,
          error_message: error.message,
          error_stack: error.stack?.substring(0, 500)
        }
      };
    }
  },

  async saveAnalysisToHistory(filename: string, analysisContent: string, duration: number): Promise<boolean> {
    try {
      console.log("💾 Salvando análise no histórico...");
      console.log("📁 Arquivo:", filename);
      console.log("⏱️ Duração:", duration, "ms");
      
      // Extrair número de erros com múltiplas estratégias
      let errorsFound = 0;
      
      try {
        // Estratégia 1: JSON block
        const jsonMatch = analysisContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[1]);
          errorsFound = analysisData.resumo?.total_erros || 
                       analysisData.erros?.length || 
                       analysisData.total_erros || 
                       analysisData.errors?.length || 0;
          console.log("📊 Erros extraídos (JSON block):", errorsFound);
        } else {
          // Estratégia 2: Regex patterns
          const patterns = [
            /"total_erros":\s*(\d+)/,
            /"errors_found":\s*(\d+)/,
            /total de erros:\s*(\d+)/i,
            /erros encontrados:\s*(\d+)/i
          ];
          
          for (const pattern of patterns) {
            const match = analysisContent.match(pattern);
            if (match) {
              errorsFound = parseInt(match[1]);
              console.log("📊 Erros extraídos (regex):", errorsFound);
              break;
            }
          }
        }
      } catch (parseError) {
        console.warn("⚠️ Não foi possível extrair erros automaticamente, usando 0");
        errorsFound = 0;
      }

      // Dados para salvar
      const historyData = {
        analyzed_filename: filename,
        analysis_content: {
          raw_content: analysisContent,
          parsed_at: new Date().toISOString(),
          analysis_duration_ms: duration,
          errors_extracted: errorsFound
        },
        errors_found: errorsFound,
        base_contracts_used: [], // TODO: implementar tracking de contratos base usados
        analysis_duration_ms: duration,
        openai_tokens_used: 0 // TODO: implementar tracking de tokens
      };

      console.log("💾 Dados para salvar:", {
        filename: historyData.analyzed_filename,
        errors_found: historyData.errors_found,
        duration: historyData.analysis_duration_ms
      });

      // Tentar salvar com retry
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`💾 Tentativa ${attempts}/${maxAttempts} de salvamento...`);
        
        try {
          const result = await contractService.saveAnalysisHistory(historyData);

          if (result.success) {
            console.log(`✅ Salvo no histórico na tentativa ${attempts}!`);
            console.log("📊 ID salvo:", result.data?.id);
            return true;
          } else {
            console.error(`❌ Erro na tentativa ${attempts}:`, result.error);
            
            if (attempts < maxAttempts) {
              console.log(`⏱️ Aguardando 1s antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (attemptError) {
          console.error(`❌ Erro crítico na tentativa ${attempts}:`, attemptError);
          
          if (attempts < maxAttempts) {
            console.log(`⏱️ Aguardando 1s antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      console.error("❌ Falha em todas as tentativas de salvamento");
      return false;
      
    } catch (error) {
      console.error("❌ Erro crítico no salvamento:", error);
      return false;
    }
  },

  // Método para testar configuração
  async testConfiguration(): Promise<{ success: boolean; message: string; debug?: any }> {
    try {
      console.log("🧪 Testando OpenRouter...");
      
      const response = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText: "TESTE DE CONFIGURAÇÃO - Este é um contrato de teste para verificar se a API do OpenRouter está funcionando. CIABRASNET - Valor: R$ 129,99 - Plano: 2024 Combo 600Mbps.",
          filename: "teste_configuracao.pdf"
        }
      });

      console.log("🧪 Resposta:", response);

      if (response.error) {
        return {
          success: false,
          message: `❌ Erro: ${response.error.message}`,
          debug: response.error
        };
      }

      if (response.data?.success) {
        return {
          success: true,
          message: "✅ OpenRouter funcionando!",
          debug: response.data
        };
      } else {
        return {
          success: false,
          message: `❌ Falha: ${response.data?.error || 'Resposta inválida'}`,
          debug: response.data
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erro no teste: ${error.message}`,
        debug: error
      };
    }
  }
};