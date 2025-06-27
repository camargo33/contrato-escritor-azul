
interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  filename: string;
}

export class OpenAIService {
  private openaiApiKey = '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';

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
          max_tokens: 6000,
          temperature: 0.1
        })
      });

      console.log("Status da resposta OpenAI:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
        
        let errorMessage = "Erro na análise do contrato";
        if (response.status === 401) {
          errorMessage = "Erro de autenticação com OpenAI - API key inválida";
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
    return `# PROMPT PARA ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Analise APENAS os campos destacados/grifados nos contratos, focando exclusivamente em inconsistências, erros de digitação e problemas de formatação dos campos importantes.

## CAMPOS ESPECÍFICOS PARA ANALISAR:

### 1. DADOS DO ASSINANTE:
- **Nome**: Verificar se está completo e sem erros de digitação
- **CPF/CNPJ**: Consistência com tipo de pessoa (PF=CPF, PJ=CNPJ)
- **Email**: Verificar erros de digitação (ex: letras duplicadas)
- **Endereço**: Completude dos dados
- **Telefone**: Formato (XX) XXXXX-XXXX

### 2. DADOS DO PLANO E VALORES:
- **Valor do plano**: Verificar se valor numérico está correto
- **Valor por extenso**: Consistência entre R$ 700,00 e valor escrito
- **Tipo de plano vs Fidelidade**: 
  - Residencial = 12 meses
  - Corporativo = 24 meses
- **Endereço eletrônico**: Deve incluir protocolo https://

### 3. VALIDAÇÕES CRÍTICAS:

**Erros de Digitação:**
- Email com letras duplicadas: "samaraa" → "samara"
- Valores escritos errados: "Quinhentos" vs "Setecentos"

**Inconsistências de Dados:**
- Plano corporativo com 12 meses (deve ser 24)
- Valor R$ 700,00 escrito como "Quinhentos reais" (deve ser "Setecentos")
- URL sem protocolo: "ciabrasnet.com.br" → "https://ciabrasnet.com.br"

**Campos Obrigatórios:**
- Verificar se campos essenciais estão preenchidos
- Consistência entre documentos e tipo de pessoa

### 5. VALIDAÇÕES ESPECÍFICAS:

**Erros de Digitação Comuns:**
- Email duplicado: "samaraa" em vez de "samara"
- Números escritos errados: "Quinhentos" vs "Setecentos"
- CEP sem hífen: "89400000" deve ser "89400-000"
- URL incompleta: "ciabrasnet.com.br" deve ser "https://ciabrasnet.com.br"

**Inconsistências de Dados:**
- Valor em número vs valor por extenso diferentes
- Tipo de pessoa não bate com prazo de fidelidade
- Documentos não condizem com tipo de pessoa

### 6. NÃO ANALISAR:
- Campos não grifados no contrato original
- Dados da operadora (já são padrão)
- Termos e condições gerais
- Informações de equipamentos
- Dados de testemunhas

### 7. TIPOS DE ERRO E SEVERIDADE:

**CRÍTICO:**
- Inconsistência valor numérico vs escrito
- Tipo pessoa vs fidelidade incorreta
- CPF/CNPJ com formato inválido

**ALTO:**
- Email com erros de digitação
- URL sem protocolo (https://)
- Data em formato incorreto

**MÉDIO:**
- CEP sem hífen
- Telefone incompleto
- Nome com abreviações

**BAIXO:**
- Espaços extras
- Maiúsculas/minúsculas

### 4. FORMATO DE RESPOSTA:

Para cada erro encontrado, retorne:

\`\`\`json
{
  "erros": [
    {
      "severidade": "critico|alto|medio|baixo",
      "campo": "nome_do_campo",
      "valor_encontrado": "valor atual no contrato",
      "valor_esperado": "valor correto esperado",
      "sugestao_correcao": "como corrigir o erro",
      "localizacao": "página X, seção Y",
      "confianca": 95
    }
  ],
  "resumo": {
    "total_erros": 5,
    "criticos": 1,
    "altos": 2,
    "medios": 1,
    "baixos": 1
  },
  "status_geral": "aprovado|aprovado_com_restricoes|reprovado"
}
\`\`\`

### 8. EXEMPLOS DE ERROS REAIS:

**Inconsistência Valor Numérico vs Escrito:**
\`\`\`json
{
  "severidade": "critico",
  "campo": "Valor da Taxa de Instalação",
  "valor_encontrado": "R$ 700,00 (Quinhentos reais)",
  "valor_esperado": "R$ 700,00 (Setecentos reais)",
  "sugestao_correcao": "Corrigir valor por extenso para 'Setecentos reais'",
  "confianca": 100
}
\`\`\`

**Email com Erro de Digitação:**
\`\`\`json
{
  "severidade": "alto",
  "campo": "Email",
  "valor_encontrado": "Samaraa.geronco@gmail.com",
  "valor_esperado": "samara.geronco@gmail.com",
  "sugestao_correcao": "Remover 'a' duplicado e corrigir maiúscula",
  "confianca": 95
}
\`\`\`

**CEP sem Formatação:**
\`\`\`json
{
  "severidade": "medio",
  "campo": "CEP",
  "valor_encontrado": "89400000",
  "valor_esperado": "89400-000",
  "sugestao_correcao": "Adicionar hífen no CEP",
  "confianca": 100
}
\`\`\`

**URL Incompleta:**
\`\`\`json
{
  "severidade": "alto",
  "campo": "Endereço Eletrônico",
  "valor_encontrado": "ciabrasnet.com.br",
  "valor_esperado": "https://ciabrasnet.com.br",
  "sugestao_correcao": "Adicionar protocolo HTTPS ao endereço",
  "confianca": 100
}
\`\`\`

### 6. CONTEXTO DO PROVEDOR:

**CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA**
- CNPJ: 10.731.345/0001-79
- Endereço: Avenida João Pessoa, n. 2660, sala 02, São Pedro
- Cidade: Porto União/SC, CEP: 89.400-000
- Autorização ANATEL: Termo de Autorização Ato n.º 444/2009

### 7. REGRAS DE NEGÓCIO:

- Planos residenciais: fidelidade 12 meses
- Planos corporativos: fidelidade 24 meses
- Taxa de instalação: R$ 700,00 (com desconto na fidelidade)
- Valores devem estar em reais com duas casas decimais
- Todas as assinaturas devem estar presentes

## INSTRUÇÕES FINAIS:

1. Seja preciso e detalhado na identificação de erros
2. Priorize erros que podem causar problemas legais ou operacionais
3. Forneça sugestões claras e acionáveis
4. Use um score de confiança baseado na certeza da detecção
5. Mantenha consistência na análise entre diferentes contratos

Analise o contrato fornecido e retorne o JSON com todos os erros encontrados seguindo exatamente este formato.

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
