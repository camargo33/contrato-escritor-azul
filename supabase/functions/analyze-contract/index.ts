
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

    // 🚨 VALIDAÇÃO CRÍTICA MANUAL ANTES DA IA
    console.log("🔍 EXECUTANDO PRÉ-VALIDAÇÃO OBRIGATÓRIA...");
    
    const errosCriticosObrigatorios = [];
    
    // 1. VERIFICAÇÃO OBRIGATÓRIA: CPF com 12 dígitos
    console.log("🔍 Verificando CPFs...");
    const cpfMatches = contractText.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2,3}/g);
    if (cpfMatches) {
      for (const cpf of cpfMatches) {
        const apenasNumeros = cpf.replace(/[^\d]/g, '');
        console.log(`📋 CPF encontrado: ${cpf} (${apenasNumeros.length} dígitos)`);
        
        if (apenasNumeros.length === 12) {
          console.log("❌ ERRO CRÍTICO OBRIGATÓRIO: CPF com 12 dígitos!");
          errosCriticosObrigatorios.push({
            campo: "CPF",
            valor_encontrado: cpf,
            valor_esperado: "CPF válido com 11 dígitos no formato XXX.XXX.XXX-XX",
            severidade: "critico",
            explicacao: `CPF contém ${apenasNumeros.length} dígitos quando deveria ter exatamente 11`,
            sugestao_correcao: `Remover o último dígito: ${cpf.substring(0, cpf.length - 1)}`,
            local_origem: "Campo CPF na seção QUALIFICAÇÃO DO ASSINANTE"
          });
        }
      }
    }
    
    // 2. VERIFICAÇÃO OBRIGATÓRIA: DDD 42 (inexistente)
    console.log("🔍 Verificando DDDs...");
    // 🔧 CORREÇÃO: Melhorar regex para capturar telefones completos
    const telefoneMatches = contractText.match(/\(42\)\s*\d{4,5}-?\d{4}/g);
    if (telefoneMatches) {
      for (const telefone of telefoneMatches) {
        console.log(`📋 Telefone com DDD 42 encontrado: ${telefone}`);
        console.log("❌ ERRO CRÍTICO OBRIGATÓRIO: DDD 42 não existe!");
        errosCriticosObrigatorios.push({
          campo: "TELEFONE",
          valor_encontrado: telefone.trim(),
          valor_esperado: "Telefone com DDD válido brasileiro",
          severidade: "critico",
          explicacao: "DDD 42 não existe no sistema de numeração telefônica brasileiro",
          sugestao_correcao: "Verificar o DDD correto da região (ex: 41, 47, 49 para região Sul)",
          local_origem: "Campo TELEFONE/CELULAR na seção QUALIFICAÇÃO DO ASSINANTE"
        });
      }
    }
    
    // 3. VERIFICAÇÃO OBRIGATÓRIA: Emails com erros de digitação
    console.log("🔍 Verificando emails...");
    const emailMatches = contractText.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
    if (emailMatches) {
      for (const email of emailMatches) {
        console.log(`📋 Email encontrado: ${email}`);
        
        // Verificar erros comuns de digitação
        if (email.toLowerCase().includes("geronco")) {
          console.log("❌ ERRO CRÍTICO OBRIGATÓRIO: Email com erro de digitação!");
          errosCriticosObrigatorios.push({
            campo: "EMAIL",
            valor_encontrado: email,
            valor_esperado: "Email com grafia correta e sem erros de digitação",
            severidade: "critico",
            explicacao: "Possível erro de digitação em 'geronco' - verificar se está correto",
            sugestao_correcao: "Confirmar com o cliente se o email está correto ou corrigir a grafia",
            local_origem: "Campo E-MAIL na seção QUALIFICAÇÃO DO ASSINANTE"
          });
        }
      }
    }
    
    // 4. VERIFICAÇÃO: Estados civis com erros
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

    // 5. 🔧 NOVA VERIFICAÇÃO: Taxa de Instalação com Fidelidade
    console.log("🔍 Verificando taxa de instalação com fidelidade...");
    const fidelidadeMatch = contractText.match(/SIM\s*\(X\)/);
    if (fidelidadeMatch) {
      console.log("📋 Cliente optou por fidelidade SIM (X)");
      
      // Procurar valor da seção de fidelidade
      const taxaFidelidadeMatch = contractText.match(/VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE[:\s]*R\$\s*([\d.,]+)/i);
      if (taxaFidelidadeMatch) {
        const valorFidelidade = taxaFidelidadeMatch[1];
        console.log(`📋 Taxa de instalação com fidelidade encontrada: R$ ${valorFidelidade}`);
        
        // Verificar se há discrepância com valor geral
        const taxaGeralMatch = contractText.match(/TAXA DE INSTALAÇÃO[^R]*R\$\s*([\d.,]+)/i);
        if (taxaGeralMatch) {
          const valorGeral = taxaGeralMatch[1];
          console.log(`📋 Taxa de instalação geral encontrada: R$ ${valorGeral}`);
          
          if (valorFidelidade !== valorGeral) {
            console.log("⚠️ Discrepância entre taxa de fidelidade e taxa geral - isso é normal");
          }
        }
      }
    }

    // 6. 🔧 NOVA VERIFICAÇÃO: Telefone com dígitos corretos
    console.log("🔍 Verificando extração completa de telefone...");
    const telefoneCompletoMatch = contractText.match(/CELULAR[:\s]*\((\d{2})\)\s*(\d{4,5})-?(\d{4})/i);
    if (telefoneCompletoMatch) {
      const ddd = telefoneCompletoMatch[1];
      const parte1 = telefoneCompletoMatch[2];
      const parte2 = telefoneCompletoMatch[3];
      const telefoneCompleto = `(${ddd}) ${parte1}-${parte2}`;
      console.log(`📋 Telefone completo extraído: ${telefoneCompleto}`);
      console.log(`📊 Dígitos: DDD=${ddd}, Número=${parte1}${parte2} (${parte1.length + parte2.length} dígitos)`);
    }

    console.log(`🚨 PRÉ-VALIDAÇÃO CONCLUÍDA: ${errosCriticosObrigatorios.length} erros críticos obrigatórios detectados`);

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

    // Processar resposta da IA e garantir que inclui os erros críticos obrigatórios
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
      
      // Adicionar erros críticos obrigatórios que não foram detectados pela IA
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
      
      // Adicionar alertas para problemas menores
      const alertasAdicionais = [];
      
      // Estado civil com possível erro
      if (estadoCivilMatch && (estadoCivilMatch[1]?.includes("SOOLTEIRO") || estadoCivilMatch[1]?.includes("SOLTEIRO"))) {
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
      }
      
      finalContent = JSON.stringify(analysisData, null, 2);
      
      console.log("✅ VALIDAÇÃO FINAL CONCLUÍDA:");
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
