// 🚀 FASE 2: EDGE FUNCTION SIMPLIFICADA COM NOVO SISTEMA DE CATEGORIZAÇÃO
// Análise inteligente por velocidade + empresa, sem salvamento de histórico

import { createClient } from '@supabase/supabase-js'
import { buildContractAnalysisPrompt } from './prompt-builder.ts'
import { identifyContractModel, getModelStats } from './contract-models.ts'
import { validateContract } from './contract-validations.ts'

// Configuração CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Health check simplificado
async function healthCheck() {
  try {
    console.log('🔍 FASE 2 - Health check executado');
    
    // Estatísticas dos modelos disponíveis
    const stats = getModelStats();
    
    return {
      success: true,
      message: "Edge Function FASE 2 funcionando - Sistema por velocidade + empresa",
      status: "healthy",
      version: "2.0.0",
      features: [
        "Categorização por velocidade (300mb-1gb)",
        "Suporte CIABRASNET + WNKBR", 
        "Validações específicas por modelo",
        "Sem histórico persistente",
        "Análise em tempo real"
      ],
      models_available: stats,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Health check falhou:', error);
    return {
      success: false,
      message: "Erro no health check",
      error: error.message
    }
  }
}

// Função principal
Deno.serve(async (req) => {
  console.log(`📥 FASE 2 - Requisição recebida: ${req.method} ${req.url}`)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Health check para requisições GET
    if (req.method === 'GET') {
      const result = await healthCheck()
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Análise de contrato para requisições POST
    if (req.method === 'POST') {
      const body = await req.json()
      
      // Validação básica
      if (!body.contractText) {
        return new Response(JSON.stringify({
          success: false,
          error: "Texto do contrato é obrigatório"
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('🎯 FASE 2 - Iniciando análise inteligente...')
      console.log('📄 Tamanho do texto:', body.contractText.length, 'caracteres')

      // 🔍 ETAPA 1: IDENTIFICAÇÃO AUTOMÁTICA DO MODELO
      const identifiedModel = identifyContractModel(body.contractText)
      
      if (identifiedModel) {
        console.log('✅ Modelo identificado automaticamente:', identifiedModel.name)
        console.log('🏢 Empresa:', identifiedModel.company)
        console.log('⚡ Velocidade:', identifiedModel.speed)
        console.log('📍 Cidade:', identifiedModel.city, '- DDD', identifiedModel.ddd)
      } else {
        console.log('⚠️ Modelo não identificado automaticamente - análise manual necessária')
      }

      // 🚀 ETAPA 2: CONSTRUIR PROMPT DINÂMICO
      const prompt = buildContractAnalysisPrompt(body.contractText)
      console.log('✍️ Prompt dinâmico construído com', prompt.length, 'caracteres')

      // 🤖 ETAPA 3: CHAMAR OPENROUTER
      const openRouterKey = Deno.env.get('OPEN_ROUTER_API_KEY') || Deno.env.get('OPENAI_API_KEY')
      
      if (!openRouterKey) {
        console.error('❌ API Key não configurada')
        return new Response(JSON.stringify({
          success: false,
          error: "API Key não configurada nos secrets do Supabase"
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('🤖 Enviando para OpenRouter (Claude 3.5 Sonnet)...')
      
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ciabrasnet.com',
          'X-Title': 'Analisador de Contratos FASE 2 - CIABRASNET/WNKBR'
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 4000
        })
      })

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text()
        console.error('❌ Erro no OpenRouter:', openRouterResponse.status, errorText)
        
        let errorMessage = "Erro na API de análise"
        if (openRouterResponse.status === 401) {
          errorMessage = "API Key inválida"
        } else if (openRouterResponse.status === 429) {
          errorMessage = "Limite de uso atingido"
        } else if (openRouterResponse.status >= 500) {
          errorMessage = "Serviço temporariamente indisponível"
        }
        
        return new Response(JSON.stringify({
          success: false,
          error: errorMessage,
          details: errorText.substring(0, 200)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const openRouterData = await openRouterResponse.json()
      const analysisText = openRouterData.choices[0].message.content

      console.log('🤖 Análise recebida da IA:', analysisText.length, 'caracteres')

      // 📊 ETAPA 4: PROCESSAR RESULTADO
      let analysisResult
      try {
        // Limpar o texto caso tenha markdown
        const cleanText = analysisText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        
        analysisResult = JSON.parse(cleanText)
        console.log('✅ Parse do resultado JSON bem-sucedido')
      } catch (parseError) {
        console.warn('⚠️ Erro ao fazer parse JSON:', parseError)
        // Fallback: retornar texto estruturado
        analysisResult = {
          status: "PROCESSADO_COM_TEXTO",
          modelo_identificado: identifiedModel ? {
            nome: identifiedModel.name,
            velocidade: identifiedModel.speed,
            empresa: identifiedModel.company
          } : null,
          erros: [],
          alertas: [],
          resumo: "Análise processada como texto",
          raw_response: analysisText
        }
      }

      // 🔄 ETAPA 5: VALIDAÇÕES ADICIONAIS (SE MODELO IDENTIFICADO)
      let additionalValidations = null
      if (identifiedModel && body.contractText) {
        try {
          // Extrair dados básicos para validação
          const contractData = {
            speed: identifiedModel.speed,
            company: identifiedModel.company,
            ddd: identifiedModel.ddd,
            // Aqui poderia extrair mais dados do texto se necessário
          }
          
          additionalValidations = validateContract(contractData, identifiedModel)
          console.log('🔍 Validações adicionais executadas:', additionalValidations.validatedFields.length, 'campos')
        } catch (validationError) {
          console.warn('⚠️ Erro nas validações adicionais:', validationError)
        }
      }

      // 🎯 ETAPA 6: MONTAR RESULTADO FINAL
      const finalResult = {
        success: true,
        ...analysisResult,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "2.0.0",
          model_used: "anthropic/claude-3.5-sonnet",
          auto_identified_model: identifiedModel ? {
            id: identifiedModel.id,
            name: identifiedModel.name,
            speed: identifiedModel.speed,
            company: identifiedModel.company,
            city: identifiedModel.city,
            ddd: identifiedModel.ddd
          } : null,
          additional_validations: additionalValidations,
          analysis_features: [
            "Identificação automática de modelo",
            "Validações específicas por velocidade",
            "Comparação empresa vs DDD",
            "Cálculo automático de valores",
            "Validação de telefone celular"
          ],
          text_size: body.contractText.length,
          prompt_size: prompt.length
        }
      }

      console.log('🎉 FASE 2 - Análise concluída com sucesso!')
      console.log('📊 Modelo:', identifiedModel?.name || 'Manual')
      console.log('🔍 Validações:', additionalValidations?.validatedFields.length || 0)

      // 📤 RETORNAR RESULTADO (SEM SALVAR NO BANCO)
      return new Response(JSON.stringify({
        success: true,
        content: analysisResult.raw_response || JSON.stringify(analysisResult, null, 2),
        filename: body.filename || 'contrato.pdf',
        timestamp: new Date().toLocaleString('pt-BR'),
        ...finalResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Método não suportado
    return new Response(JSON.stringify({
      success: false,
      error: "Método não suportado. Use GET (health check) ou POST (análise)"
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro fatal na Edge Function FASE 2:', error)
    console.error('Stack trace:', error.stack)
    
    return new Response(JSON.stringify({
      success: false,
      error: "Erro interno do servidor",
      message: error.message,
      version: "2.0.0",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🚀 FASE 2 - Edge Function iniciada')
console.log('✅ Sistema de categorização por velocidade + empresa ativo')
console.log('📋 Modelos disponíveis:', getModelStats().total_models)
