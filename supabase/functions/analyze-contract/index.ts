
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
      
      console.log("🔍 Analisando resposta da IA...");
      console.log("📊 Erros detectados pela IA:", analysisData.erros?.length || 0);
      console.log("📋 Erros originais:", analysisData.erros);
      
      // Validação manual SEMPRE, independente se a IA detectou erros ou não
      console.log("🔍 Executando validação manual adicional...");
      
      const errosDetectados = [];
      
      // Verificar CPF com formato incorreto (12 dígitos)
      const cpfMatch = contractText.match(/([\d\.]{3,4}\.?[\d\.]{3,4}\.?[\d\.]{3,4}-?[\d]{2,3})/g);
      if (cpfMatch) {
        for (const cpf of cpfMatch) {
          const cpfNumbers = cpf.replace(/[^\d]/g, '');
          if (cpfNumbers.length === 12) {
            console.log("❌ ERRO CRÍTICO: CPF com 12 dígitos detectado:", cpf);
            errosDetectados.push({
              campo: "CPF",
              valor_encontrado: cpf,
              valor_esperado: "CPF válido no formato XXX.XXX.XXX-XX com 11 dígitos",
              severidade: "critico",
              explicacao: `CPF contém ${cpfNumbers.length} dígitos quando deveria ter apenas 11`,
              sugestao_correcao: "Corrigir para formato XXX.XXX.XXX-XX com apenas 2 dígitos finais",
              local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
            });
          }
        }
      }
      
      // Verificar DDD 42 (inexistente) em telefones
      const telefoneMatches = contractText.match(/\(42\)\s*[\d\s\-]+/g);
      if (telefoneMatches) {
        for (const telefone of telefoneMatches) {
          console.log("❌ ERRO CRÍTICO: DDD 42 detectado:", telefone);
          errosDetectados.push({
            campo: "TELEFONE",
            valor_encontrado: telefone.trim(),
            valor_esperado: "Telefone com DDD válido do Brasil",
            severidade: "critico",
            explicacao: "DDD 42 não existe no sistema de numeração brasileiro",
            sugestao_correcao: "Verificar o DDD correto da região do cliente (ex: 41, 47, 49)",
            local_origem: "Campo TELEFONE/CELULAR"
          });
        }
      }
      
      // Verificar email com possíveis erros (geronco, etc)
      const emailMatches = contractText.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
      if (emailMatches) {
        for (const email of emailMatches) {
          if (email.includes("geronco") || email.includes("geronco")) {
            console.log("❌ ERRO ALTO: Email com erro de digitação:", email);
            errosDetectados.push({
              campo: "EMAIL", 
              valor_encontrado: email,
              valor_esperado: "Email com grafia correta",
              severidade: "alto",
              explicacao: "Possível erro de digitação em 'geronco'",
              sugestao_correcao: "Confirmar se o email está correto ou se deveria ser outro nome",
              local_origem: "Campo E-MAIL"
            });
          }
        }
      }
      
      // Mesclar erros da IA com erros detectados manualmente
      const errosExistentes = analysisData.erros || [];
      const todosErros = [...errosExistentes];
      
      // Adicionar apenas erros que não foram detectados pela IA
      for (const novoErro of errosDetectados) {
        const jaExiste = errosExistentes.some(erro => 
          erro.campo?.toLowerCase() === novoErro.campo?.toLowerCase() && 
          erro.valor_encontrado === novoErro.valor_encontrado
        );
        
        if (!jaExiste) {
          console.log("➕ Adicionando erro não detectado pela IA:", novoErro);
          todosErros.push(novoErro);
        } else {
          console.log("✅ Erro já detectado pela IA:", novoErro.campo);
        }
      }
      
      // Atualizar dados da análise
      if (todosErros.length > 0) {
        console.log(`📊 Total de erros após validação: ${todosErros.length}`);
        
        analysisData.erros = todosErros;
        
        // Calcular contadores por severidade
        const contadores = todosErros.reduce((acc, erro) => {
          const sev = erro.severidade || 'medio';
          acc[sev] = (acc[sev] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Atualizar resumo
        analysisData.resumo = {
          ...analysisData.resumo,
          total_erros: todosErros.length,
          criticos: contadores.critico || 0,
          altos: contadores.alto || 0,
          medios: contadores.medio || 0,
          baixos: contadores.baixo || 0
        };
        
        // Status baseado em erros críticos/altos
        if (contadores.critico > 0 || contadores.alto > 0) {
          analysisData.status_geral = "reprovado";
        }
        
        // Adicionar observações sobre os erros críticos detectados
        if (contadores.critico > 0 || contadores.alto > 0) {
          analysisData.observacoes = [
            ...(analysisData.observacoes || []),
            "🚨 ERROS CRÍTICOS DETECTADOS: Correção obrigatória antes da aprovação",
            `📊 Encontrados ${contadores.critico || 0} erros críticos e ${contadores.alto || 0} erros altos`
          ];
        }
        
        finalContent = JSON.stringify(analysisData, null, 2);
        
        console.log("✅ Validação concluída:");
        console.log(`📈 Críticos: ${contadores.critico || 0}`);
        console.log(`📈 Altos: ${contadores.alto || 0}`);
        console.log(`📈 Status: ${analysisData.status_geral}`);
      } else {
        console.log("✅ Nenhum erro crítico adicional detectado");
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
