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
      console.log("📊 Status:", response.status || 'unknown');
      
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
            response_error: response.error,
            response_status: response.status
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

        // Salvar no histórico (não bloquear se falhar)
        try {
          await this.saveAnalysisToHistory(
            filename,
            analysisResult.content,
            duration
          );
          console.log("💾 Salvo no histórico");
        } catch (historyError) {
          console.warn("⚠️ Erro ao salvar (continuando):", historyError);
        }

        return {
          ...analysisResult,
          debug: {
            duration_ms: duration,
            saved_to_history: true
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

  async saveAnalysisToHistory(filename: string, analysisContent: string, duration: number) {
    try {
      console.log("💾 Salvando no histórico...");
      
      // Extrair número de erros
      let errorsFound = 0;
      try {
        const jsonMatch = analysisContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[1]);
          errorsFound = analysisData.resumo?.total_erros || analysisData.erros?.length || 0;
          console.log("📊 Erros extraídos:", errorsFound);
        } else {
          const errorPattern = /"total_erros":\s*(\d+)/;
          const match = analysisContent.match(errorPattern);
          if (match) {
            errorsFound = parseInt(match[1]);
            console.log("📊 Erros (alt):", errorsFound);
          }
        }
      } catch (parseError) {
        console.log("⚠️ Não foi possível extrair erros, usando 0");
      }

      const result = await contractService.saveAnalysisHistory({
        analyzed_filename: filename,
        analysis_content: {
          raw_content: analysisContent,
          parsed_at: new Date().toISOString(),
          analysis_duration_ms: duration
        },
        errors_found: errorsFound,
        base_contracts_used: [],
        analysis_duration_ms: duration,
        openai_tokens_used: 0
      });

      if (result.success) {
        console.log("✅ Salvo no histórico!");
        return true;
      } else {
        console.error("❌ Erro ao salvar:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro crítico ao salvar:", error);
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