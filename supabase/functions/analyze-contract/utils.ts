
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: string;
  error?: string;
  debug?: any;
}

export const validateOpenRouterApiKey = (): ApiKeyValidationResult => {
  console.log("=== VERIFICANDO CONFIGURAÇÃO DA API KEY OPENROUTER ===");
  
  // Buscar pela chave OpenRouter (tentando ambas as variáveis)
  let openRouterApiKey = Deno.env.get('OPEN_ROUTER'); // Primeiro tenta OPEN_ROUTER (padrão)
  let usedVariable = 'OPEN_ROUTER';
  
  if (!openRouterApiKey) {
    openRouterApiKey = Deno.env.get('OpenRouter'); // Fallback para OpenRouter
    usedVariable = 'OpenRouter';
  }
  
  // Listar todas as variáveis de ambiente disponíveis (sem mostrar valores)
  const allEnvVars = Object.keys(Deno.env.toObject());
  console.log("Variáveis de ambiente disponíveis:", allEnvVars);
  console.log("Tentando usar variável:", usedVariable);
  
  if (!openRouterApiKey) {
    console.error("❌ ERRO CRÍTICO: API key do OpenRouter não encontrada");
    return {
      isValid: false,
      error: "API key do OpenRouter não configurada. Verifique se a variável 'OPEN_ROUTER' ou 'OpenRouter' está definida nos secrets",
      debug: {
        available_env_vars: allEnvVars,
        checked_keys: ['OPEN_ROUTER', 'OpenRouter']
      }
    };
  }

  // Validar formato da API key OpenRouter
  if (!openRouterApiKey.startsWith('sk-or-')) {
    console.error("❌ ERRO: API key OpenRouter não tem o formato correto");
    console.log("Formato atual:", openRouterApiKey.substring(0, 15) + "...");
    
    return {
      isValid: false,
      error: "API key do OpenRouter inválida. A chave deve começar com 'sk-or-'. Verifique se a chave foi copiada corretamente.",
      debug: {
        used_variable: usedVariable,
        key_prefix: openRouterApiKey.substring(0, 10)
      }
    };
  }

  console.log("✅ API key OpenRouter validada com sucesso usando variável:", usedVariable);
  return {
    isValid: true,
    apiKey: openRouterApiKey,
    debug: {
      used_variable: usedVariable
    }
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

export const handleOpenRouterError = (response: Response, errorText: string) => {
  let errorMessage = "Erro na comunicação com OpenRouter";
  
  if (response.status === 401) {
    errorMessage = 'API key do OpenRouter inválida ou expirada. Verifique se a chave está correta e ativa em sua conta OpenRouter.';
  } else if (response.status === 429) {
    errorMessage = 'Limite de uso da API OpenRouter atingido. Tente novamente em alguns minutos ou verifique seu plano OpenRouter.';
  } else if (response.status === 400) {
    errorMessage = 'Erro na requisição para OpenRouter. O formato dos dados pode estar incorreto.';
  } else if (response.status === 503) {
    errorMessage = 'Serviço do OpenRouter temporariamente indisponível. Tente novamente em alguns minutos.';
  } else {
    errorMessage = `Erro na API OpenRouter: ${response.status} - ${response.statusText}`;
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
  } else if (error.message.includes('API key do OpenRouter não configurada')) {
    errorMessage = "API key do OpenRouter não configurada. Verifique os secrets do Supabase.";
  } else if (error.message.includes('401') || error.message.includes('inválida')) {
    errorMessage = "API key do OpenRouter inválida. Verifique sua chave do OpenRouter nos secrets do Supabase.";
  } else if (error.message.includes('429')) {
    errorMessage = "Limite de uso da API atingido. Tente novamente em alguns minutos.";
  } else if (error.message.includes('400')) {
    errorMessage = "Erro no formato da requisição. Tente novamente com um contrato diferente.";
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
  } else {
    errorMessage = error.message || "Erro na comunicação com OpenRouter";
  }

  return {
    message: errorMessage,
    debug: {
      error_name: error.name,
      error_message: error.message
    }
  };
};
