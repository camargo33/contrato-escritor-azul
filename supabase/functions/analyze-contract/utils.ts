
// 🔧 CORREÇÃO CRÍTICA: CORS mais permissivo para resolver problemas de headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name, accept, accept-language, cache-control, pragma',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
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
  
  if (!openRouterApiKey) {
    openRouterApiKey = Deno.env.get('OPENAI_API_KEY'); // Fallback para OpenAI
    usedVariable = 'OPENAI_API_KEY';
  }
  
  // Listar todas as variáveis de ambiente disponíveis (sem mostrar valores)
  const allEnvVars = Object.keys(Deno.env.toObject());
  console.log("Variáveis de ambiente disponíveis:", allEnvVars);
  console.log("Tentando usar variável:", usedVariable);
  
  if (!openRouterApiKey) {
    console.error("❌ ERRO CRÍTICO: API key não encontrada");
    return {
      isValid: false,
      error: "API key não configurada. Verifique se 'OPEN_ROUTER', 'OpenRouter' ou 'OPENAI_API_KEY' está definida nos secrets",
      debug: {
        available_env_vars: allEnvVars,
        checked_keys: ['OPEN_ROUTER', 'OpenRouter', 'OPENAI_API_KEY']
      }
    };
  }

  // Validar formato da API key (mais flexível)
  const isOpenRouterKey = openRouterApiKey.startsWith('sk-or-');
  const isOpenAIKey = openRouterApiKey.startsWith('sk-');
  
  if (!isOpenRouterKey && !isOpenAIKey) {
    console.error("❌ ERRO: API key não tem formato reconhecido");
    console.log("Formato atual:", openRouterApiKey.substring(0, 15) + "...");
    
    return {
      isValid: false,
      error: "API key inválida. A chave deve começar com 'sk-or-' (OpenRouter) ou 'sk-' (OpenAI).",
      debug: {
        used_variable: usedVariable,
        key_prefix: openRouterApiKey.substring(0, 10)
      }
    };
  }

  console.log(`✅ API key validada com sucesso usando variável: ${usedVariable} (tipo: ${isOpenRouterKey ? 'OpenRouter' : 'OpenAI'})`);
  return {
    isValid: true,
    apiKey: openRouterApiKey,
    debug: {
      used_variable: usedVariable,
      key_type: isOpenRouterKey ? 'OpenRouter' : 'OpenAI'
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
    errorMessage = 'API key inválida ou expirada. Verifique se a chave está correta e ativa.';
  } else if (response.status === 429) {
    errorMessage = 'Limite de uso da API atingido. Tente novamente em alguns minutos.';
  } else if (response.status === 400) {
    errorMessage = 'Erro na requisição. O formato dos dados pode estar incorreto.';
  } else if (response.status === 503) {
    errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
  } else {
    errorMessage = `Erro na API: ${response.status} - ${response.statusText}`;
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
  } else if (error.message.includes('API key')) {
    errorMessage = "API key não configurada ou inválida. Verifique os secrets do Supabase.";
  } else if (error.message.includes('401') || error.message.includes('inválida')) {
    errorMessage = "API key inválida. Verifique sua chave nos secrets do Supabase.";
  } else if (error.message.includes('429')) {
    errorMessage = "Limite de uso da API atingido. Tente novamente em alguns minutos.";
  } else if (error.message.includes('400')) {
    errorMessage = "Erro no formato da requisição. Tente novamente com um contrato diferente.";
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
  } else {
    errorMessage = error.message || "Erro na comunicação com o serviço de IA";
  }

  return {
    message: errorMessage,
    debug: {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500)
    }
  };
};

// 🔧 NOVA FUNÇÃO: Teste de conectividade da Edge Function
export const createHealthCheckResponse = () => {
  return {
    success: true,
    message: "Edge Function está funcionando corretamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    available_endpoints: [
      "POST /analyze-contract - Analisar contrato PDF"
    ],
    status: "healthy"
  };
};
