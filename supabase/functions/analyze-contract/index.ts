// 🚀 FASE 2: EDGE FUNCTION SIMPLIFICADA COM NOVO SISTEMA DE CATEGORIZAÇÃO
// Análise inteligente por velocidade + empresa, sem salvamento de histórico
// 🔧 VERSÃO CORRIGIDA - Imports fixados para Deno/Supabase Edge Functions
// 💰 VALIDAÇÕES DE TAXAS INTEGRADAS

// ✅ IMPORT CORRETO PARA SUPABASE EDGE FUNCTIONS
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { buildContractAnalysisPrompt } from './prompt-builder.ts'
import { identifyContractModel, getModelStats } from './contract-models.ts'
import { validateContract } from './contract-validations.ts'
import { validateTaxLogic } from './tax-validations.ts'

// Configuração CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Health check simplificado
async function healthCheck() {
  try {
    console.log('🔍 FASE 2 - Health check executado - VERSÃO COM VALIDAÇÕES DE TAXAS')
    
    // Estatísticas dos modelos disponíveis
    const stats = getModelStats()
    
    return {
      success: true,
      message: "Edge Function FASE 2 funcionando - Sistema por velocidade + empresa + validações de taxas",
      status: "healthy",
      version: "2.2.0-TAX-VALIDATIONS",
      features: [
        "Categorização por velocidade (300mb-1gb)",
        "Suporte CIABRASNET + WNKBR", 
        "Validações específicas por modelo",
        "🆕 Validações rigorosas de taxas e IP",
        "🆕 Validação de lógica de fidelidade",
        "🆕 Detecção de inconsistências de valores",
        "Sem histórico persistente",
        "Análise em tempo real",
        "⚡ Imports corrigidos para Edge Functions"
      ],
      models_available: stats,
      timestamp: new Date().toISOString(),
      deploy_info: {
        last_update: "2025-08-02T03:45:00Z",
        fixes_applied: [
          "Supabase import path corrected", 
          "Cache cleared",
          "🆕 Tax validations integrated",
          "🆕 IP logic validation added",
          "🆕 Fidelity math validation added"
        ]
      }
    }
  } catch (error) {
    console.error('❌ Health check falhou:', error)
    return {
      success: false,
      message: "Erro no health check",
      error: error.message
    }
  }
}

// Função principal
Deno.serve(async (req) => {
  console.log(`📥 FASE 2 - Requisição recebida: ${req.method} ${req.url} - VERSÃO COM VALIDAÇÕES DE TAXAS`)

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

      console.log('🎯 FASE 2 - Iniciando análise inteligente com validações de taxas...')
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

      // 💰 ETAPA 1.5: VALIDAÇÕES RIGOROSAS DE TAXAS (NOVA!)
      console.log('💰 Executando validações rigorosas de taxas...')
      const taxValidationErrors = validateTaxLogic(body.contractText)
      console.log(`💰 Validações de taxas concluídas: ${taxValidationErrors.length} inconsistências encontradas`)
      
      if (taxValidationErrors.length > 0) {
        console.log('🚨 INCONSISTÊNCIAS DE TAXAS DETECTADAS:')
        taxValidationErrors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.message}`)
          console.log(`     Encontrado: ${error.found}`)
          console.log(`     Esperado: ${error.expected}`)
        })
      }

      // 🚀 ETAPA 2: CONSTRUIR PROMPT DINÂMICO
      const prompt = buildContractAnalysisPrompt(body.contractText)
      console.log('✍️ Prompt dinâmico construído com', prompt.length, 'caracteres')

      // 🤖 ETAPA 3: CHAMAR OPENROUTER COM FALLBACK PARA OPENAI
      const openRouterKey = Deno.env.get('OPEN_ROUTER') || Deno.env.get('OPEN_ROUTER_API_KEY') || Deno.env.get('OPENAI_API_KEY')
      
      if (!openRouterKey) {
        console.error('❌ API Key não configurada')
        return new Response(JSON.stringify({
          success: false,
          error: "API Key não configurada nos secrets do Supabase. Configure OPEN_ROUTER ou OPENAI_API_KEY"
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
          errorMessage = "API Key inválida ou expirada"
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

      // 📊 ETAPA 4: PROCESSAR RESULTADO COM LIMPEZA ROBUSTA
      let analysisResult
      try {
        // Limpeza mais robusta do texto markdown
        let cleanText = analysisText
          .replace(/```json\s*/g, '')  // Remove ```json com espaços opcionais
          .replace(/```\s*/g, '')      // Remove ``` com espaços opcionais
          .replace(/^[`\s]*/, '')      // Remove backticks e espaços no início
          .replace(/[`\s]*$/, '')      // Remove backticks e espaços no final
          .trim()
        
        // Se ainda não conseguir fazer parse, tentar encontrar JSON válido no texto
        if (!cleanText.startsWith('{')) {
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            cleanText = jsonMatch[0]
          }
        }
        
        analysisResult = JSON.parse(cleanText)
        console.log('✅ Parse do resultado JSON bem-sucedido')
      } catch (parseError) {
        console.warn('⚠️ Erro ao fazer parse JSON - usando fallback:', parseError.message)
        console.log('📝 Texto original (primeiros 500 chars):', analysisText.substring(0, 500))
        
        // Fallback estruturado baseado no modelo identificado
        analysisResult = {
          status: "PROCESSADO_COM_FALLBACK",
          modelo_identificado: identifiedModel ? {
            nome: identifiedModel.name,
            velocidade: identifiedModel.speed,
            empresa: identifiedModel.company,
            cidade: identifiedModel.city,
            ddd: identifiedModel.ddd
          } : null,
          erros: [],
          alertas: ["Resposta da IA processada como texto devido a formato inválido"],
          resumo: "Análise processada com fallback estruturado",
          detalhes: "O modelo de IA retornou uma resposta em formato inválido",
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

      // 💰 ETAPA 5.5: INTEGRAR ERROS DE TAXAS NO RESULTADO FINAL
      if (taxValidationErrors.length > 0) {
        // Converter ValidationResult para formato de erro padrão
        const taxErrors = taxValidationErrors.map(taxError => ({
          campo: taxError.message.includes('IP') ? 'IP/Taxas' : 
                 taxError.message.includes('fidelidade') ? 'Fidelidade' : 
                 taxError.message.includes('valores mensais') ? 'Valores Mensais' : 'Taxas',
          valor_encontrado: taxError.found || 'Inconsistência detectada',
          valor_esperado: taxError.expected || 'Valor/lógica correta',
          sugestao_correcao: taxError.message,
          severidade: taxError.severity || 'error'
        }))

        // Adicionar os erros de taxas ao resultado da IA
        if (!analysisResult.erros) {
          analysisResult.erros = []
        }
        analysisResult.erros.push(...taxErrors)

        // Atualizar contadores se existirem
        if (analysisResult.resumo && typeof analysisResult.resumo === 'object') {
          analysisResult.resumo.total_erros = (analysisResult.resumo.total_erros || 0) + taxErrors.length
          if (taxErrors.length > 0) {
            analysisResult.resumo.status_geral = 'reprovado'
          }
        }

        console.log(`💰 ${taxErrors.length} erros de taxas adicionados ao resultado final`)
      }

      // 🎯 ETAPA 6: MONTAR RESULTADO FINAL
      const finalResult = {
        success: true,
        ...analysisResult,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "2.2.0-TAX-VALIDATIONS",
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
          tax_validations: {
            executed: true,
            errors_found: taxValidationErrors.length,
            validation_types: [
              "IP Fixo vs Variável",
              "Lógica de fidelidade",
              "Soma de valores mensais",
              "Consistência de taxas"
            ]
          },
          analysis_features: [
            "Identificação automática de modelo",
            "Validações específicas por velocidade",
            "Comparação empresa vs DDD",
            "Cálculo automático de valores",
            "Validação de telefone celular",
            "🆕 Validações rigorosas de taxas",
            "🆕 Detecção de inconsistências IP",
            "🆕 Validação de matemática da fidelidade",
            "⚡ Edge Function Corrigida"
          ],
          text_size: body.contractText.length,
          prompt_size: prompt.length,
          fixes_applied: [
            "Supabase import corrected", 
            "Telefone validation fixed", 
            "SOOLTEIRO removed",
            "🆕 Tax validations integrated",
            "🆕 IP logic validation active",
            "🆕 Fidelity inconsistencies detected"
          ]
        }
      }

      console.log('🎉 FASE 2 - Análise concluída com sucesso! (VERSÃO COM VALIDAÇÕES DE TAXAS)')
      console.log('📊 Modelo:', identifiedModel?.name || 'Manual')
      console.log('🔍 Validações tradicionais:', additionalValidations?.validatedFields.length || 0)
      console.log('💰 Validações de taxas:', taxValidationErrors.length)

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
    console.error('💥 Erro fatal na Edge Function FASE 2 (VERSÃO COM VALIDAÇÕES DE TAXAS):', error)
    console.error('Stack trace:', error.stack)
    
    return new Response(JSON.stringify({
      success: false,
      error: "Erro interno do servidor",
      message: error.message,
      version: "2.2.0-TAX-VALIDATIONS",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🚀 FASE 2 - Edge Function iniciada (VERSÃO COM VALIDAÇÕES DE TAXAS)')
console.log('✅ Sistema de categorização por velocidade + empresa ativo')
console.log('💰 Validações rigorosas de taxas ativas')
console.log('🔧 Imports corrigidos para Edge Functions')
console.log('📋 Modelos disponíveis:', getModelStats().total_models)
