
import { supabase } from '@/integrations/supabase/client';
import { contractService } from './contractService';

export interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
}

export const openaiService = {
  async analyzeContract(contractText: string, filename: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log("=== INICIANDO ANÁLISE DIRETA COM OPENAI ===");
      console.log("Tamanho do texto:", contractText.length, "caracteres");

      const response = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText: contractText,
          filename: filename
        }
      });

      console.log("Resposta da função:", response);
      
      if (response.error) {
        console.error("Erro na função:", response.error);
        return {
          success: false,
          error: response.error.message || "Erro na análise",
          timestamp: new Date().toLocaleString('pt-BR'),
          filename
        };
      }

      if (response.data && response.data.success) {
        console.log("Análise concluída com sucesso!");
        
        const analysisResult = response.data;
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Salvar no histórico de análises
        await this.saveAnalysisToHistory(
          filename,
          analysisResult.content,
          duration
        );

        return analysisResult;
      } else {
        console.error("Resposta inválida da função:", response.data);
        return {
          success: false,
          error: response.data?.error || "Erro desconhecido na análise",
          timestamp: new Date().toLocaleString('pt-BR'),
          filename
        };
      }
    } catch (error: any) {
      console.error("Erro na análise:", error);
      return {
        success: false,
        error: error.message || "Erro inesperado na análise",
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };
    }
  },

  async saveAnalysisToHistory(filename: string, analysisContent: string, duration: number) {
    try {
      console.log("Salvando análise no histórico...");
      
      // Tentar extrair número de erros do conteúdo
      let errorsFound = 0;
      try {
        // Procurar por JSON no conteúdo
        const jsonMatch = analysisContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[1]);
          errorsFound = analysisData.resumo?.total_erros || 0;
        }
      } catch (parseError) {
        console.log("Não foi possível extrair número de erros, usando 0");
      }

      const result = await contractService.saveAnalysisHistory({
        analyzed_filename: filename,
        analysis_content: {
          raw_content: analysisContent,
          parsed_at: new Date().toISOString()
        },
        errors_found: errorsFound,
        base_contracts_used: [], // Por enquanto vazio, pode ser implementado depois
        analysis_duration_ms: duration,
        openai_tokens_used: 0 // Não temos essa informação ainda
      });

      if (result.success) {
        console.log("Análise salva no histórico com sucesso!");
      } else {
        console.error("Erro ao salvar no histórico:", result.error);
      }
    } catch (error) {
      console.error("Erro ao salvar análise no histórico:", error);
    }
  }
};
