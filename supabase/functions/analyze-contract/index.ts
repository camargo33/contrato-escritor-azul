import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// API Key validation
const validateOpenAIApiKey = () => {
  console.log("=== VERIFICANDO CONFIGURAÇÃO DA API KEY ===");
  
  const possibleKeys = ['OPENAI_API_KEY', 'OpenAI', 'OPENAI'];
  let openAIApiKey = null;
  
  for (const keyName of possibleKeys) {
    const key = Deno.env.get(keyName);
    if (key) {
      console.log(`✓ Encontrada API key: ${keyName}`);
      openAIApiKey = key;
      break;
    } else {
      console.log(`✗ Não encontrada: ${keyName}`);
    }
  }
  
  const allEnvVars = Object.keys(Deno.env.toObject());
  console.log("Variáveis de ambiente disponíveis:", allEnvVars);
  
  if (!openAIApiKey) {
    console.error("❌ ERRO CRÍTICO: Nenhuma API key da OpenAI encontrada");
    return {
      isValid: false,
      error: "API key da OpenAI não configurada. Verifique se uma das seguintes variáveis está definida nos secrets: OPENAI_API_KEY, OpenAI, ou OPENAI",
      debug: {
        available_env_vars: allEnvVars,
        checked_keys: possibleKeys
      }
    };
  }

  if (!openAIApiKey.startsWith('sk-')) {
    console.error("❌ ERRO: API key não tem o formato correto");
    console.log("Formato atual:", openAIApiKey.substring(0, 10) + "...");
    
    return {
      isValid: false,
      error: "API key da OpenAI inválida. A chave deve começar com 'sk-'. Verifique se a chave foi copiada corretamente."
    };
  }

  console.log("✅ API key validada com sucesso");
  return {
    isValid: true,
    apiKey: openAIApiKey
  };
};

// Response helpers
const createErrorResponse = (error: string, filename: string, debug?: any) => {
  return {
    success: false,
    error,
    timestamp: new Date().toLocaleString('pt-BR'),
    filename: filename || 'arquivo.pdf',
    debug
  };
};

const createSuccessResponse = (content: string, filename: string) => {
  return {
    success: true,
    content,
    timestamp: new Date().toLocaleString('pt-BR'),
    filename: filename || 'arquivo.pdf'
  };
};

// Minimal contract analysis (embedding all dependencies inline)
const analyzeContractWithOpenAI = async (contractText: string, filename: string, apiKey: string) => {
  console.log("Iniciando análise para arquivo:", filename);
  console.log("Tamanho do texto:", contractText.length, "caracteres");
  console.log("🔄 Testando conectividade com OpenAI usando GPT-4o-mini...");
  
  const prompt = `# ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Analise o contrato fornecido identificando erros, inconsistências e problemas de formatação.

## INSTRUÇÕES
1. Identifique o tipo de contrato (residencial ou corporativo)
2. Verifique se os valores estão corretos
3. Analise a taxa de rescisão baseada na fidelidade
4. Identifique erros de digitação e formatação

## FORMATO DE RESPOSTA
Responda em formato JSON com:
- modelo_identificado: informações do modelo
- erros: lista de erros encontrados
- resumo: totais dos erros por severidade

**Contrato para análise:**
${contractText}`;
  
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
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(60000)
    });

    console.log("📡 Status da resposta OpenAI:", response.status);

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

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log("=== ANALYZE CONTRACT FUNCTION STARTED ===");
    console.log("Method:", req.method);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    const { contractText, filename } = await req.json();

    if (!contractText) {
      console.error("Erro: Texto do contrato não fornecido");
      const result = createErrorResponse('Texto do contrato é obrigatório', filename);
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar API key
    const apiKeyValidation = validateOpenAIApiKey();
    if (!apiKeyValidation.isValid) {
      const result = createErrorResponse(
        apiKeyValidation.error!, 
        filename, 
        apiKeyValidation.debug
      );
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analisar contrato com OpenAI
    const analysisResult = await analyzeContractWithOpenAI(
      contractText,
      filename,
      apiKeyValidation.apiKey!
    );

    if (!analysisResult.success) {
      const result = createErrorResponse(
        analysisResult.error!, 
        filename, 
        analysisResult.debug
      );
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = createSuccessResponse(analysisResult.content!, filename);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("=== ERRO NA ANÁLISE ===");
    console.error("Tipo do erro:", error.name);
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
    
    const result = createErrorResponse(
      error.message || "Erro inesperado na análise",
      '',
      {
        error_name: error.name,
        error_message: error.message
      }
    );

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});