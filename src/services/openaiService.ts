
interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
}

export class OpenAIService {
  private supabaseUrl = 'https://kwwqyfvkpjatckvngtur.supabase.co';
  private supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d3F5ZnZrcGphdGNrdm5ndHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MzE0NTMsImV4cCI6MjA0OTAwNzQ1M30.6ILKEVFIWuRNiWvpVZaJVj8QO6nqIaHgVl8KsxBrGE0';

  async analyzeContract(contractText: string, filename: string): Promise<AnalysisResult> {
    console.log("=== INICIANDO ANÁLISE VIA EDGE FUNCTION ===");
    console.log("URL da Edge Function:", `${this.supabaseUrl}/functions/v1/analyze-contract`);
    console.log("Tamanho do texto:", contractText.length, "caracteres");
    
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/analyze-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'apikey': this.supabaseAnonKey,
          'x-client-info': 'contract-analyzer'
        },
        body: JSON.stringify({
          contractText,
          filename
        })
      });

      console.log("Status da resposta:", response.status);
      
      const data = await response.json();
      console.log("Dados recebidos:", data);
      
      if (!response.ok) {
        console.error("Erro na resposta:", data);
        throw new Error(data.error || `Erro ${response.status}`);
      }

      return data;

    } catch (error: any) {
      console.error("=== ERRO NA COMUNICAÇÃO ===");
      console.error("Tipo:", error.name);
      console.error("Mensagem:", error.message);
      
      return {
        success: false,
        error: error.message || "Erro na comunicação com o servidor",
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };
    }
  }

  // Método mantido para compatibilidade
  hasApiKey(): boolean {
    return true; // Sempre true pois usa edge function
  }

  // Método mantido para compatibilidade
  setApiKey(key: string) {
    console.log("API key configurada via Supabase Secrets");
  }
}

export const openaiService = new OpenAIService();
