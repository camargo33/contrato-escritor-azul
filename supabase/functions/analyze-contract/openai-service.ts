
import { createContractAnalysisPrompt } from './prompt.ts';

export interface OpenAIAnalysisRequest {
  contractText: string;
  filename: string;
  apiKey: string;
}

export interface OpenAIAnalysisResponse {
  success: boolean;
  content?: string;
  error?: string;
  debug?: any;
}

export const analyzeContractWithOpenAI = async (
  request: OpenAIAnalysisRequest
): Promise<OpenAIAnalysisResponse> => {
  const { contractText, filename, apiKey } = request;
  
  console.log("Iniciando análise para arquivo:", filename);
  console.log("Tamanho do texto:", contractText.length, "caracteres");
  console.log("🔄 Testando conectividade com OpenAI usando GPT-4o-mini...");
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    console.log("📡 Status da resposta OpenAI:", response.status);
    console.log("📡 Headers da resposta:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro na API OpenAI: ${response.status} - ${errorText}`);
      
      return {
        success: false,
        error: `Erro na API OpenAI: ${response.status}`,
        debug: {
          status: response.status,
          response_text: errorText.substring(0, 500)
        }
      };
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("❌ Resposta inválida da OpenAI:", data);
      
      return {
        success: false,
        error: 'Resposta inválida da OpenAI. Tente novamente.'
      };
    }

    console.log("✅ Análise concluída com sucesso usando GPT-4o-mini!");

    return {
      success: true,
      content: data.choices[0].message.content
    };

  } catch (error: any) {
    console.error("Erro na chamada da OpenAI:", error);
    
    return {
      success: false,
      error: error.message || "Erro na comunicação com OpenAI",
      debug: {
        error_name: error.name,
        error_message: error.message
      }
    };
  }
};
