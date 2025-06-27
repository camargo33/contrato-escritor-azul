
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const createPrompt = (contractText: string): string => {
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
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== ANALYZE CONTRACT FUNCTION STARTED ===");
    
    const { contractText, filename } = await req.json();

    if (!contractText) {
      console.error("Erro: Texto do contrato não fornecido");
      throw new Error('Texto do contrato é obrigatório');
    }

    console.log("Verificando API key da OpenAI...");
    
    // Tenta diferentes formas de acessar a API key
    let openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      openAIApiKey = Deno.env.get('OpenAI');
    }
    
    if (!openAIApiKey) {
      console.error("ERRO CRÍTICO: Nenhuma API key encontrada");
      console.log("Variáveis disponíveis:", Object.keys(Deno.env.toObject()));
      throw new Error('API key da OpenAI não configurada. Verifique se OPENAI_API_KEY ou OpenAI está definida nos secrets do Supabase.');
    }

    console.log("API key encontrada, iniciando análise...");
    console.log("Arquivo:", filename);
    console.log("Tamanho do texto:", contractText.length, "caracteres");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: createPrompt(contractText)
          }
        ],
        max_tokens: 6000,
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(60000)
    });

    console.log("Status da resposta OpenAI:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('API key da OpenAI inválida ou expirada. Verifique se a chave está correta nos secrets do Supabase.');
      } else if (response.status === 429) {
        throw new Error('Limite de uso da API OpenAI atingido. Tente novamente em alguns minutos.');
      } else if (response.status === 400) {
        throw new Error('Erro na requisição para OpenAI. Verifique o formato dos dados enviados.');
      } else {
        throw new Error(`Erro na API OpenAI: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Resposta inválida da OpenAI:", data);
      throw new Error('Resposta inválida da OpenAI');
    }

    console.log("Análise concluída com sucesso!");

    const result = {
      success: true,
      content: data.choices[0].message.content,
      timestamp: new Date().toLocaleString('pt-BR'),
      filename: filename || 'arquivo.pdf'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("=== ERRO NA ANÁLISE ===");
    console.error("Tipo do erro:", error.name);
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
    
    let errorMessage = "Erro desconhecido na análise";
    
    if (error.name === 'AbortError') {
      errorMessage = "Timeout na análise (60s). Tente novamente com um arquivo menor.";
    } else if (error.message.includes('API key da OpenAI não configurada')) {
      errorMessage = "API key da OpenAI não configurada. Verifique os secrets do Supabase.";
    } else if (error.message.includes('401') || error.message.includes('inválida')) {
      errorMessage = "API key da OpenAI inválida. Verifique sua chave da OpenAI nos secrets do Supabase.";
    } else if (error.message.includes('429')) {
      errorMessage = "Limite de uso da API atingido. Tente novamente em alguns minutos.";
    } else if (error.message.includes('400')) {
      errorMessage = "Erro no formato da requisição. Tente novamente com um contrato diferente.";
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
    } else {
      errorMessage = error.message || "Erro na comunicação com OpenAI";
    }

    const result = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toLocaleString('pt-BR'),
      filename: ''
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
