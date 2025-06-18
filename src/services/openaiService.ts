
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
}

export class OpenAIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // Tenta obter a API key do localStorage para desenvolvimento
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private createPrompt(contractText: string): string {
    return `**Atue como um revisor profissional de contratos digitais.**  
Você é um especialista em revisão contratual com 20 anos de experiência, focado em documentos de prestação de serviço de comunicação multimídia. Seu papel é comparar contratos elaborados manualmente com os modelos oficiais da CIABRASNET, identificando **erros de digitação, campos incompletos ou inconsistentes, informações faltantes, incoerências numéricas, repetições e falhas de preenchimento**.

**Objetivo:**  
O objetivo da sua análise é garantir que o contrato entregue pela equipe esteja padronizado, formalmente correto, e que **todos os campos obrigatórios estejam preenchidos conforme os modelos oficiais** utilizados pela empresa. O contrato revisado será enviado ao cliente, por isso ele deve estar 100% correto.

**Etapas que você deve seguir:**
1. **Compare cuidadosamente** o contrato fornecido com os contratos-modelo da base de conhecimento da CIABRASNET.  
2. **Destaque todos os erros** encontrados: erros de ortografia, digitação, preenchimento incorreto de dados como CPF, e-mail, endereço, campos obrigatórios vazios etc.  
3. **Identifique diferenças nos nomes de serviços ou valores** dos planos quando comparado com os modelos padrão para aquele plano.  
4. **Verifique se todas as seções obrigatórias estão presentes** (Ex: cláusulas, valores, dados de equipamento, fidelidade, endereço de cobrança, etc.).  
5. Para cada erro encontrado, indique:
   - O trecho incorreto
   - A justificativa do erro
   - A sugestão de correção
6. **Organize sua resposta em uma lista com tópicos**, sendo cada tópico um erro detectado.

Use como referência os planos de 300Mbps, 500Mbps, 600Mbps, 800Mbps e Giga da CIABRASNET.

**Contrato para análise:**
${contractText}`;
  }

  async analyzeContract(contractText: string, filename: string): Promise<AnalysisResult> {
    console.log("Iniciando análise com OpenAI...");
    
    if (!this.apiKey) {
      return {
        success: false,
        error: "API key da OpenAI não configurada",
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: this.createPrompt(contractText)
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        }),
        signal: AbortSignal.timeout(45000) // 45 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.status} - ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Resposta inválida da OpenAI');
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };

    } catch (error: any) {
      console.error("Erro na análise OpenAI:", error);
      
      let errorMessage = "Erro desconhecido na análise";
      
      if (error.name === 'AbortError') {
        errorMessage = "Timeout na análise (45s). Tente novamente com um arquivo menor.";
      } else if (error.message.includes('401')) {
        errorMessage = "API key inválida. Verifique sua chave da OpenAI.";
      } else if (error.message.includes('429')) {
        errorMessage = "Limite de uso da API atingido. Tente novamente em alguns minutos.";
      } else if (error.message.includes('network')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else {
        errorMessage = error.message || "Erro na comunicação com OpenAI";
      }

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };
    }
  }
}

export const openaiService = new OpenAIService();
