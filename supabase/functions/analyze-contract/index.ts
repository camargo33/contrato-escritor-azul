
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  validateOpenRouterApiKey, 
  createErrorResponse, 
  createSuccessResponse,
  createHealthCheckResponse,
  handleOpenRouterError,
  handleGenericError
} from './utils.ts';
import { analyzeContractWithOpenRouter } from './openai-service.ts';

serve(async (req) => {
  // 🔧 CORREÇÃO: Resposta OPTIONS mais robusta
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log("=== ANALYZE CONTRACT FUNCTION STARTED ===");
    console.log("Método:", req.method);
    console.log("URL:", req.url);
    
    // 🔧 NOVO: Health check endpoint
    if (req.method === 'GET') {
      console.log("🏥 Health check requisitado");
      const healthResponse = createHealthCheckResponse();
      return new Response(JSON.stringify(healthResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verificar se é POST com dados
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: "Método não permitido. Use POST para análise ou GET para health check."
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 🔧 CORREÇÃO: Melhor tratamento de JSON
    let requestData;
    try {
      const requestText = await req.text();
      console.log("📥 Dados recebidos (tamanho):", requestText.length, "caracteres");
      
      if (!requestText.trim()) {
        throw new Error("Corpo da requisição vazio");
      }
      
      requestData = JSON.parse(requestText);
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError);
      const result = createErrorResponse(
        'Dados inválidos na requisição. Verifique se está enviando JSON válido.',
        '',
        { parse_error: parseError.message }
      );
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { contractText, filename, test } = requestData;

    // 🔧 NOVO: Resposta para requisições de teste
    if (test === true) {
      console.log("🧪 Requisição de teste detectada");
      return new Response(JSON.stringify({
        success: true,
        message: "Edge Function está funcionando corretamente",
        test: true,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!contractText) {
      console.error("Erro: Texto do contrato não fornecido");
      const result = createErrorResponse('Texto do contrato é obrigatório', filename);
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 🚨 VALIDAÇÃO CRÍTICA MANUAL CORRIGIDA - MAIS CONSERVADORA
    console.log("🔍 EXECUTANDO PRÉ-VALIDAÇÃO CONSERVADORA...");
    
    const errosCriticosObrigatorios = [];
    
    // 1. 🔧 CORREÇÃO: Verificação de CPF mais rigorosa
    console.log("🔍 Verificando CPFs...");
    const cpfMatches = contractText.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g);
    if (cpfMatches) {
      for (const cpf of cpfMatches) {
        const apenasNumeros = cpf.replace(/[^0-9]/g, '');
        console.log(`📋 CPF encontrado: ${cpf} → Apenas números: ${apenasNumeros} (${apenasNumeros.length} dígitos)`);
        
        // ✅ CORREÇÃO: Só reportar erro se REALMENTE tem problema
        if (apenasNumeros.length !== 11) {
          console.log(`❌ ERRO CRÍTICO: CPF com ${apenasNumeros.length} dígitos - deveria ter 11!`);
          errosCriticosObrigatorios.push({
            campo: "CPF",
            valor_encontrado: cpf,
            valor_esperado: "CPF válido com exatamente 11 dígitos no formato XXX.XXX.XXX-XX",
            severidade: "critico",
            explicacao: `CPF contém ${apenasNumeros.length} dígitos quando deveria ter exatamente 11`,
            sugestao_correcao: apenasNumeros.length < 11 ? "Adicionar dígitos faltantes" : "Remover dígitos extras",
            local_origem: "Campo CPF na seção QUALIFICAÇÃO DO ASSINANTE"
          });
        } else {
          console.log(`✅ CPF com 11 dígitos correto: ${cpf}`);
        }
      }
    }
    
    // 2. 🔧 CORREÇÃO: Verificação de DDD mais precisa - LISTA COMPLETA
    console.log("🔍 Verificando DDDs...");
    const telefoneMatches = contractText.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/g);
    if (telefoneMatches) {
      for (const telefone of telefoneMatches) {
        const dddMatch = telefone.match(/\((\d{2})\)/);
        const numeroMatch = telefone.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/);
        
        if (dddMatch && numeroMatch) {
          const ddd = parseInt(dddMatch[1]);
          const parte1 = numeroMatch[2];
          const parte2 = numeroMatch[3];
          const numeroCompleto = parte1 + parte2;
          const totalDigitos = numeroCompleto.length;
          
          console.log(`📋 Telefone encontrado: ${telefone}`);
          console.log(`  - DDD: ${ddd}`);
          console.log(`  - Número: ${parte1}-${parte2} (${totalDigitos} dígitos)`);
          
          // ✅ VALIDAÇÃO DE DDD (conservadora - apenas fora da faixa 11-99)
          if (ddd < 11 || ddd > 99) {
            console.log(`❌ ERRO CRÍTICO: DDD ${ddd} fora da faixa válida (11-99)!`);
            errosCriticosObrigatorios.push({
              campo: "TELEFONE - DDD",
              valor_encontrado: telefone.trim(),
              valor_esperado: "Telefone com DDD válido brasileiro (11-99)",
              severidade: "critico",
              explicacao: `DDD ${ddd} está fora da faixa válida brasileira (11-99)`,
              sugestao_correcao: "Verificar o DDD correto da região",
              local_origem: "Campo TELEFONE/CELULAR na seção QUALIFICAÇÃO DO ASSINANTE"
            });
          } else {
            console.log(`✅ DDD ${ddd} válido`);
          }
          
          // ✅ NOVA VALIDAÇÃO: CONTAGEM DE DÍGITOS DO NÚMERO
          if (totalDigitos !== 8 && totalDigitos !== 9) {
            console.log(`❌ ERRO CRÍTICO: Número com ${totalDigitos} dígitos - deveria ter 8 (fixo) ou 9 (celular)!`);
            
            let sugestaoCorrecao = "";
            if (totalDigitos < 8) {
              sugestaoCorrecao = `Adicionar ${8 - totalDigitos} dígito(s) ao número`;
            } else if (totalDigitos > 9) {
              sugestaoCorrecao = `Remover ${totalDigitos - 9} dígito(s) do número`;
            } else if (totalDigitos === 8) {
              sugestaoCorrecao = "Número correto para telefone fixo";
            } else if (totalDigitos === 9) {
              sugestaoCorrecao = "Número correto para celular";
            }
            
            errosCriticosObrigatorios.push({
              campo: "TELEFONE - DÍGITOS",
              valor_encontrado: telefone.trim(),
              valor_esperado: "Telefone com 8 dígitos (fixo) ou 9 dígitos (celular)",
              severidade: "critico",
              explicacao: `Número tem ${totalDigitos} dígitos, mas deve ter 8 (fixo) ou 9 (celular)`,
              sugestao_correcao: sugestaoCorrecao,
              local_origem: "Campo TELEFONE/CELULAR na seção QUALIFICAÇÃO DO ASSINANTE"
            });
          } else {
            const tipoTelefone = totalDigitos === 9 ? "celular" : "fixo";
            console.log(`✅ Número com ${totalDigitos} dígitos correto para ${tipoTelefone}`);
          }
        }
      }
    }
    
    // 3. 🔧 CORREÇÃO: Verificação de email MAIS CONSERVADORA - Só erros ÓBVIOS
    console.log("🔍 Verificando emails...");
    const emailMatches = contractText.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
    if (emailMatches) {
      for (const email of emailMatches) {
        console.log(`📋 Email encontrado: ${email}`);
        
        // ✅ LISTA MUITO ESPECÍFICA DE ERROS ÓBVIOS CONHECIDOS
        const errosObvios = [
          'gmial', // erro óbvio: gmail
          'gmaiil', // erro óbvio: gmail  
          'gmai.com', // erro óbvio: gmail.com
          'hotmial', // erro óbvio: hotmail
          'hotmeil', // erro óbvio: hotmail
          'yahhoo', // erro óbvio: yahoo
          'yahho', // erro óbvio: yahoo
          'outlokk', // erro óbvio: outlook
          'outlok' // erro óbvio: outlook
        ];
        
        const temErroObvio = errosObvios.some(erro => 
          email.toLowerCase().includes(erro)
        );
        
        if (temErroObvio) {
          console.log("❌ ERRO CRÍTICO: Email com erro ÓBVIO de digitação!");
          errosCriticosObrigatorios.push({
            campo: "EMAIL",
            valor_encontrado: email,
            valor_esperado: "Email com provedor correto (gmail, hotmail, yahoo, outlook)",
            severidade: "critico",
            explicacao: "Erro óbvio de digitação detectado em provedor de email",
            sugestao_correcao: "Verificar a grafia do provedor de email",
            local_origem: "Campo E-MAIL na seção QUALIFICAÇÃO DO ASSINANTE"
          });
        } else {
          console.log(`✅ Email sem erros óbvios detectados: ${email}`);
        }
      }
    }
    
    // 4. VERIFICAÇÃO: Estados civis com erros (mantida)
    console.log("🔍 Verificando estado civil...");
    const estadoCivilMatch = contractText.match(/ESTADO CIVIL[:\s]*([A-Z\s]+)/i);
    if (estadoCivilMatch) {
      const estadoCivil = estadoCivilMatch[1]?.trim();
      console.log(`📋 Estado civil encontrado: "${estadoCivil}"`);
      
      if (estadoCivil && (estadoCivil.includes("SOOLTEIRO") || estadoCivil.includes("SOLTEIRO"))) {
        console.log("⚠️ Possível erro de digitação em estado civil");
        // Este será um alerta, não erro crítico
      }
    }

    console.log(`🚨 PRÉ-VALIDAÇÃO CONSERVADORA CONCLUÍDA: ${errosCriticosObrigatorios.length} erros críticos detectados`);

    // Validar API key do OpenRouter/OpenAI
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

    // Analisar contrato com IA
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

    // Processar resposta da IA
    let finalContent = analysisResult.content!;
    try {
      const analysisData = JSON.parse(finalContent);
      
      console.log("🔍 Analisando resposta da IA...");
      console.log("📊 Erros detectados pela IA:", analysisData.erros?.length || 0);
      
      // Inicializar arrays se não existirem
      if (!analysisData.erros) analysisData.erros = [];
      if (!analysisData.alertas) analysisData.alertas = [];
      
      // Merge dos erros críticos obrigatórios com os da IA
      const errosExistentes = analysisData.erros || [];
      const todosErros = [...errosExistentes];
      
      // ✅ CONSERVADOR: Só adicionar se FOR REALMENTE um erro crítico
      for (const erroObrigatorio of errosCriticosObrigatorios) {
        const jaExiste = errosExistentes.some(erro => 
          erro.campo?.toLowerCase().includes(erroObrigatorio.campo.toLowerCase()) && 
          erro.valor_encontrado?.includes(erroObrigatorio.valor_encontrado)
        );
        
        if (!jaExiste) {
          console.log("➕ Adicionando erro crítico obrigatório não detectado pela IA:", erroObrigatorio.campo);
          todosErros.push(erroObrigatorio);
        } else {
          console.log("✅ Erro crítico já detectado pela IA:", erroObrigatorio.campo);
        }
      }
      
      // Adicionar alertas para problemas menores (não erros críticos)
      const alertasAdicionais = [];
      
      // Estado civil com possível erro (ALERTA, não erro crítico)
      if (estadoCivilMatch && estadoCivilMatch[1]?.includes("SOOLTEIRO")) {
        alertasAdicionais.push({
          tipo: "erro_digitacao",
          campo: "Estado Civil",
          valor_encontrado: estadoCivilMatch[1].trim(),
          sugestao: "Verificar ortografia - deveria ser 'SOLTEIRO'"
        });
      }
      
      // Adicionar alertas que não existem
      for (const alerta of alertasAdicionais) {
        const alertaJaExiste = analysisData.alertas.some(a => 
          a.campo?.toLowerCase() === alerta.campo.toLowerCase()
        );
        if (!alertaJaExiste) {
          analysisData.alertas.push(alerta);
        }
      }
      
      // Atualizar dados da análise
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
        total_alertas: analysisData.alertas.length,
        criticos: contadores.critico || 0,
        altos: contadores.alto || 0,
        medios: contadores.medio || 0,
        baixos: contadores.baixo || 0
      };
      
      // Status baseado em erros críticos/altos
      if (contadores.critico > 0 || contadores.alto > 0) {
        analysisData.status_geral = "reprovado";
        
        // Adicionar observações críticas
        analysisData.observacoes = [
          ...(analysisData.observacoes || []),
          "🚨 ERROS CRÍTICOS DETECTADOS: Correção obrigatória antes da aprovação",
          `📊 Encontrados ${contadores.critico || 0} erros críticos e ${contadores.alto || 0} erros altos`,
          ...(errosCriticosObrigatorios.length > 0 ? ["⚠️ Dados pessoais com erros críticos devem ser corrigidos imediatamente"] : [])
        ];
      } else {
        // ✅ Se não há erros críticos, contrato pode ser aprovado
        analysisData.status_geral = "aprovado";
      }
      
      finalContent = JSON.stringify(analysisData, null, 2);
      
      console.log("✅ VALIDAÇÃO CONSERVADORA CONCLUÍDA:");
      console.log(`📈 Total de erros: ${todosErros.length}`);
      console.log(`📈 Críticos: ${contadores.critico || 0}`);
      console.log(`📈 Altos: ${contadores.alto || 0}`);
      console.log(`📈 Alertas: ${analysisData.alertas.length}`);
      console.log(`📈 Status: ${analysisData.status_geral}`);
      
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
