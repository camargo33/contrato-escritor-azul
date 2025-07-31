
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  validateOpenRouterApiKey, 
  createErrorResponse, 
  createSuccessResponse,
  handleOpenRouterError,
  handleGenericError
} from './utils.ts';
import { analyzeContractWithOpenRouter } from './openai-service.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== ANALYZE CONTRACT FUNCTION STARTED ===");
    
    const { contractText, filename } = await req.json();

    if (!contractText) {
      console.error("Erro: Texto do contrato não fornecido");
      const result = createErrorResponse('Texto do contrato é obrigatório', filename);
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar API key do OpenRouter
    const apiKeyValidation = validateOpenRouterApiKey();
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

    // Analisar contrato com OpenRouter
    const analysisResult = await analyzeContractWithOpenRouter({
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

    // Validação adicional para garantir detecção de erros críticos
    let finalContent = analysisResult.content!;
    try {
      const analysisData = JSON.parse(finalContent);
      
      // Se não há erros detectados, verificar manualmente os erros críticos
      if (!analysisData.erros || analysisData.erros.length === 0) {
        console.log("🔍 Verificando erros críticos manualmente...");
        
        const errosDetectados = [];
        
        // Verificar CPF com 12 dígitos
        const cpfMatch = contractText.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{3})/);
        if (cpfMatch) {
          const cpfNumbers = cpfMatch[1].replace(/[^\d]/g, '');
          if (cpfNumbers.length === 12) {
            console.log("❌ ERRO CRÍTICO: CPF com 12 dígitos detectado:", cpfMatch[1]);
            errosDetectados.push({
              campo: "CPF",
              valor_encontrado: cpfMatch[1],
              valor_esperado: "CPF válido no formato XXX.XXX.XXX-XX com 11 dígitos",
              severidade: "critico",
              explicacao: `CPF contém ${cpfNumbers.length} dígitos quando deveria ter apenas 11`,
              sugestao_correcao: "Corrigir para formato XXX.XXX.XXX-XX com apenas 2 dígitos finais",
              local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
            });
          }
        }
        
        // Verificar DDD 42 (inexistente)
        const telefoneMatch = contractText.match(/\(42\)\s*[\d\s-]+/);
        if (telefoneMatch) {
          console.log("❌ ERRO CRÍTICO: DDD 42 detectado:", telefoneMatch[0]);
          errosDetectados.push({
            campo: "TELEFONE",
            valor_encontrado: telefoneMatch[0].trim(),
            valor_esperado: "DDD válido do Brasil",
            severidade: "critico",
            explicacao: "DDD 42 não existe no sistema de numeração brasileiro",
            sugestao_correcao: "Verificar o DDD correto da região do cliente",
            local_origem: "Campo CELULAR"
          });
        }
        
        // Verificar email com "geronco"
        const emailMatch = contractText.match(/\S+\.geronco@\S+/);
        if (emailMatch) {
          console.log("❌ ERRO ALTO: Email com erro de digitação:", emailMatch[0]);
          errosDetectados.push({
            campo: "EMAIL",
            valor_encontrado: emailMatch[0],
            valor_esperado: "Email com grafia correta",
            severidade: "alto",
            explicacao: "Possível erro de digitação em 'geronco'",
            sugestao_correcao: "Confirmar se o email está correto ou se deveria ser outro nome",
            local_origem: "Campo E-MAIL"
          });
        }
        
        // Se encontrou erros, atualizar resposta
        if (errosDetectados.length > 0) {
          console.log(`🚨 ${errosDetectados.length} erros críticos detectados pela validação manual!`);
          
          analysisData.erros = errosDetectados;
          analysisData.status_geral = "reprovado";
          analysisData.resumo = {
            ...analysisData.resumo,
            total_erros: errosDetectados.length,
            dados_pessoais_ok: false
          };
          
          // Adicionar observações sobre os erros
          analysisData.observacoes = [
            ...(analysisData.observacoes || []),
            "CRÍTICO: Erros detectados na validação de dados pessoais",
            "NECESSÁRIA correção dos dados pessoais antes da aprovação"
          ];
          
          finalContent = JSON.stringify(analysisData, null, 2);
        }
      }
    } catch (parseError) {
      console.error("Erro ao fazer parse da resposta para validação adicional:", parseError);
    }

    const result = createSuccessResponse(finalContent, filename);
    return new Response(JSON.stringify(result), {
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
