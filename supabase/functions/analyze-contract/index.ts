import { createClient } from '@supabase/supabase-js'
import { buildPrompt } from './prompt-builder.ts'

// Configuração CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Health check básico
async function healthCheck() {
  try {
    console.log('🔍 Health check executado');
    return {
      success: true,
      message: "Edge Function está funcionando corretamente",
      status: "healthy",
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
  console.log(`📥 Requisição recebida: ${req.method} ${req.url}`)

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

      console.log('🤖 Iniciando análise de contrato...')

      // Configurar Supabase para buscar contratos base
      const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
      
      const supabase = createClient(supabaseUrl!, supabaseKey!)

      // Buscar contratos base do usuário (se autenticado)
      let baseContracts = []
      if (body.userId) {
        try {
          const { data, error } = await supabase
            .from('base_contracts')
            .select('*')
            .eq('user_id', body.userId)
            .eq('is_processed', true)
            
          if (!error && data) {
            baseContracts = data
            console.log(`📋 ${baseContracts.length} contratos base encontrados`)
          }
        } catch (error) {
          console.warn('⚠️ Erro ao buscar contratos base:', error)
        }
      }

      // Construir prompt com contratos base
      const prompt = buildPrompt(body.contractText, baseContracts)
      console.log('✍️ Prompt construído com sucesso')

      // Chamar API do OpenRouter
      const openRouterKey = Deno.env.get('OPEN_ROUTER_API_KEY') || Deno.env.get('OPENAI_API_KEY')
      
      if (!openRouterKey) {
        return new Response(JSON.stringify({
          success: false,
          error: "API Key não configurada"
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ciabrasnet.com',
          'X-Title': 'Analisador de Contratos CIABRASNET'
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
        console.error('❌ Erro no OpenRouter:', errorText)
        return new Response(JSON.stringify({
          success: false,
          error: "Erro na API de análise"
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const openRouterData = await openRouterResponse.json()
      const analysisText = openRouterData.choices[0].message.content

      console.log('🤖 Análise recebida da IA')

      // Tentar fazer parse do JSON retornado pela IA
      let analysisResult
      try {
        // Limpar o texto caso tenha markdown
        const cleanText = analysisText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        
        analysisResult = JSON.parse(cleanText)
        console.log('✅ Parse do resultado da análise bem-sucedido')
      } catch (parseError) {
        console.warn('⚠️ Erro ao fazer parse da resposta:', parseError)
        // Fallback: retornar texto bruto
        analysisResult = {
          status: "ERRO",
          erros_criticos: [],
          alertas: [],
          resumo_executivo: analysisText,
          contratos_base_utilizados: baseContracts.map(c => c.name),
          raw_response: analysisText
        }
      }

      // Enriquecer resultado com metadados
      const finalResult = {
        ...analysisResult,
        metadata: {
          timestamp: new Date().toISOString(),
          contratos_base_count: baseContracts.length,
          model_used: "anthropic/claude-3.5-sonnet",
          simplified_version: true
        }
      }

      console.log('🎉 Análise concluída com sucesso')

      // Retornar resultado SEM SALVAR no banco
      return new Response(JSON.stringify({
        success: true,
        data: finalResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Método não suportado
    return new Response(JSON.stringify({
      success: false,
      error: "Método não suportado"
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Erro fatal na Edge Function:', error)
    return new Response(JSON.stringify({
      success: false,
      error: "Erro interno do servidor",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
