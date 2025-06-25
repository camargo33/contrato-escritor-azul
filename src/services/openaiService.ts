
interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
}

export class OpenAIService {
  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  async analyzeContract(contractText: string, filename: string): Promise<AnalysisResult> {
    console.log("Iniciando análise via Edge Function...");
    
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/analyze-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractText,
          filename
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      return data;

    } catch (error: any) {
      console.error("Erro na análise:", error);
      
      return {
        success: false,
        error: error.message || "Erro na comunicação com o servidor",
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };
    }
  }

  // Método legado mantido para compatibilidade
  hasApiKey(): boolean {
    return true; // Sempre true pois agora usa edge function
  }

  // Método legado mantido para compatibilidade
  setApiKey(key: string) {
    // Não faz nada pois agora usa edge function
    console.log("API key será configurada via Supabase Secrets");
  }
}

export const openaiService = new OpenAIService();
