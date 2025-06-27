
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
    return `# PROMPT PARA ANÁLISE DE CONTRATOS DE INTERNET

## CONTEXTO
Você é um especialista em análise de contratos de provedores de internet. Sua função é identificar erros, inconsistências e problemas em contratos baseado em um modelo de referência.

## INSTRUÇÕES DE ANÁLISE

### 1. CAMPOS OBRIGATÓRIOS A VERIFICAR:

**Dados Pessoais:**
- Nome completo (sem abreviações)
- CPF/CNPJ (formato e validade)
- RG/IE (quando aplicável)
- Endereço completo (rua, número, bairro, cidade, UF, CEP)
- Telefone (formato brasileiro)
- Email (formato válido)
- Data de nascimento/fundação

**Dados do Contrato:**
- Razão social da operadora
- CNPJ da operadora
- Endereço da operadora
- Autorização ANATEL
- Número do contrato de referência

**Dados do Plano:**
- Descrição do plano
- Velocidade de download/upload
- Valor da mensalidade
- Tipo de plano (residencial/corporativo)
- Garantia de banda

**Fidelidade e Pagamento:**
- Prazo de fidelidade (12 meses PF / 24 meses PJ)
- Opção de fidelidade marcada corretamente
- Valor da taxa de instalação
- Forma de pagamento
- Data de vencimento

### 2. VALIDAÇÕES ESPECÍFICAS:

**Validação de CPF/CNPJ:**
- Formato correto (XXX.XXX.XXX-XX ou XX.XXX.XXX/XXXX-XX)
- Dígitos verificadores válidos
- Consistência com tipo de pessoa

**Validação de Consistência:**
- Se pessoa física → fidelidade 12 meses
- Se pessoa jurídica → fidelidade 24 meses
- Valores monetários em formato brasileiro (R$ X.XXX,XX)
- Datas no formato DD/MM/AAAA
- CEP no formato XXXXX-XXX

**Validação de Campos Relacionados:**
- Endereço de instalação vs endereço de cobrança
- Velocidade contratada vs valor do plano
- Tipo de pessoa vs documentos apresentados
- Equipamentos vs valor de mercado

### 3. TIPOS DE ERRO E SEVERIDADE:

**CRÍTICO:**
- CPF/CNPJ inválido
- Campos obrigatórios em branco
- Inconsistência entre tipo pessoa e fidelidade
- Valores monetários incorretos

**ALTO:**
- Formato de data incorreto
- Email inválido
- Telefone incompleto
- Endereço incompleto

**MÉDIO:**
- Abreviações em nomes
- CEP sem hífen
- Valores sem centavos
- Campos de observação vazios

**BAIXO:**
- Espaços extras
- Maiúsculas/minúsculas inconsistentes
- Formatação de texto

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

### 5. CONTEXTO DO PROVEDOR:

**CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA**
- CNPJ: 10.731.345/0001-79
- Endereço: Avenida João Pessoa, n. 2660, sala 02, São Pedro
- Cidade: Porto União/SC, CEP: 89.400-000
- Autorização ANATEL: Termo de Autorização Ato n.º 444/2009

### 6. REGRAS DE NEGÓCIO:

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
