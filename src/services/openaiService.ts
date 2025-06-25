
interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
}

export class OpenAIService {
  private openaiApiKey = 'sk-proj-5M2J8f9dGVQZ3QP4K7HL6mN8bV2nF3yW9qC5xR7tA1oL4pX6zK8vM3nB9qW2eR5yT7uP4mN6bV8cX1zK3gH5jL9pQ2wE4rT6yU8iO0aS3dF6gH9jK2lM5nP8qV1bN4xZ7cR9tY3uI6oA2sD5fG8hJ1kL4mP7qW0eR3tY6uI9oA2sD5f';

  async analyzeContract(contractText: string, filename: string): Promise<AnalysisResult> {
    console.log("=== INICIANDO ANÁLISE DIRETA COM OPENAI ===");
    console.log("Tamanho do texto:", contractText.length, "caracteres");
    
    try {
      const prompt = this.createPrompt(contractText);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        })
      });

      console.log("Status da resposta OpenAI:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
        
        let errorMessage = "Erro na análise do contrato";
        if (response.status === 401) {
          errorMessage = "Erro de autenticação com OpenAI";
        } else if (response.status === 429) {
          errorMessage = "Limite de uso atingido. Tente novamente em alguns minutos.";
        } else if (response.status === 400) {
          errorMessage = "Erro no formato da requisição";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Resposta inválida da OpenAI');
      }

      console.log("Análise concluída com sucesso!");

      return {
        success: true,
        content: data.choices[0].message.content,
        timestamp: new Date().toLocaleString('pt-BR'),
        filename: filename || 'arquivo.pdf'
      };

    } catch (error: any) {
      console.error("=== ERRO NA ANÁLISE ===");
      console.error("Erro:", error.message);
      
      return {
        success: false,
        error: error.message || "Erro na comunicação com OpenAI",
        timestamp: new Date().toLocaleString('pt-BR'),
        filename
      };
    }
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

  // Métodos mantidos para compatibilidade
  hasApiKey(): boolean {
    return true;
  }

  setApiKey(key: string) {
    console.log("API key já está configurada internamente");
  }
}

export const openaiService = new OpenAIService();
