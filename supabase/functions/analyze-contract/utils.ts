
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: string;
  error?: string;
  debug?: any;
}

export const validateOpenAIApiKey = (): ApiKeyValidationResult => {
  console.log("=== VERIFICANDO CONFIGURAÇÃO DA API KEY ===");
  
  // Verificar todas as possíveis configurações da API key
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
  
  // Listar todas as variáveis de ambiente disponíveis (sem mostrar valores)
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

  // Validar formato da API key
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

export const createErrorResponse = (error: string, filename: string, debug?: any) => {
  return {
    success: false,
    error,
    timestamp: new Date().toLocaleString('pt-BR'),
    filename: filename || 'arquivo.pdf',
    debug
  };
};

export const createSuccessResponse = (content: string, filename: string) => {
  return {
    success: true,
    content,
    timestamp: new Date().toLocaleString('pt-BR'),
    filename: filename || 'arquivo.pdf'
  };
};

export const handleOpenAIError = (response: Response, errorText: string) => {
  let errorMessage = "Erro na comunicação com OpenAI";
  
  if (response.status === 401) {
    errorMessage = 'API key da OpenAI inválida ou expirada. Verifique se a chave está correta e ativa em sua conta OpenAI.';
  } else if (response.status === 429) {
    errorMessage = 'Limite de uso da API OpenAI atingido. Tente novamente em alguns minutos ou verifique seu plano OpenAI.';
  } else if (response.status === 400) {
    errorMessage = 'Erro na requisição para OpenAI. O formato dos dados pode estar incorreto.';
  } else if (response.status === 503) {
    errorMessage = 'Serviço da OpenAI temporariamente indisponível. Tente novamente em alguns minutos.';
  } else {
    errorMessage = `Erro na API OpenAI: ${response.status} - ${response.statusText}`;
  }
  
  return {
    message: errorMessage,
    debug: {
      status: response.status,
      response_text: errorText.substring(0, 500)
    }
  };
};

export const handleGenericError = (error: any) => {
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

  return {
    message: errorMessage,
    debug: {
      error_name: error.name,
      error_message: error.message
    }
  };
};
