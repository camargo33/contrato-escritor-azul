
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  validateOpenAIApiKey, 
  createErrorResponse, 
  createSuccessResponse,
  handleOpenAIError,
  handleGenericError
} from './utils.ts';
import { analyzeContractWithOpenAI } from './openai-service.ts';

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
    const analysisResult = await analyzeContractWithOpenAI({
      contractText,
      filename,
      apiKey: apiKeyValidation.apiKey!
    });

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
    
    const errorInfo = handleGenericError(error);
    const result = createErrorResponse(
      errorInfo.message,
      '',
      errorInfo.debug
    );

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
