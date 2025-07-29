
import { createContractAnalysisPrompt } from './prompt.ts';

export interface OpenRouterAnalysisRequest {
  contractText: string;
  filename: string;
  apiKey: string;
}

export interface OpenRouterAnalysisResponse {
  success: boolean;
  content?: string;
  error?: string;
  debug?: any;
}

export const analyzeContractWithOpenRouter = async (
  request: OpenRouterAnalysisRequest
): Promise<OpenRouterAnalysisResponse> => {
  const { contractText, filename, apiKey } = request;
  
  console.log("Iniciando análise para arquivo:", filename);
  console.log("Tamanho do texto:", contractText.length, "caracteres");
  console.log("🔄 Conectando com OpenRouter usando GPT-4o-mini...");
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kwwqyfvkpjatckvngtur.supabase.co',
        'X-Title': 'Contract Analysis System'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: createContractAnalysisPrompt(contractText)
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(60000)
    });

    console.log("📡 Status da resposta OpenRouter:", response.status);
    console.log("📡 Headers da resposta:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro na API OpenRouter: ${response.status} - ${errorText}`);
      
      return {
        success: false,
        error: `Erro na API OpenRouter: ${response.status}`,
        debug: {
          status: response.status,
          response_text: errorText.substring(0, 500)
        }
      };
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("❌ Resposta inválida da OpenRouter:", data);
      
      return {
        success: false,
        error: 'Resposta inválida da OpenRouter. Tente novamente.'
      };
    }

    console.log("✅ Análise concluída com sucesso usando OpenRouter GPT-4o-mini!");

    return {
      success: true,
      content: data.choices[0].message.content
    };

  } catch (error: any) {
    console.error("Erro na chamada da OpenRouter:", error);
    
    return {
      success: false,
      error: error.message || "Erro na comunicação com OpenRouter",
      debug: {
        error_name: error.name,
        error_message: error.message
      }
    };
  }
};
