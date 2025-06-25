
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const createPrompt = (contractText: string): string => {
  return `**Atue como um revisor profissional de contratos digitais.**  
Você é um especialista em revisão contratual com 20 anos de experiência, focado em documentos de prestação de serviço de comunicação multimídia. Seu papel é comparar contratos elaborados manualmente com os modelos oficiais da CIABRASNET, identificando **erros de digitação, campos incompletos ou inconsistentes, informações faltantes, incoerências numéricas, repetições e falhas de preenchimento**.

**Objetivo:**  
O objetivo da sua análise é garantir que o contrato entregue pela equipe esteja padronizado, formalmente correto, e que **todos os campos obrigatórios estejam preenchidos conforme os modelos oficiais** utilizados pela empresa. O contrato revisado será enviado ao cliente, por isso ele deve estar 100% correto.

**Etapas que você deve seguir:**
1. **Compare cuidadosamente** o contrato fornecido com os contratos-modelo da base de conhecimento da CIABRASNET.  
2. **Destaque todos os erros** encontrados: erros de ortografia, digitação, preenchimento incorreto de dados como CPF, e-mail, endereço, campos obrigatórios vazios etc.  
3. **Identifique diferenças nos nomes de serviços ou valores** dos planos quando comparado com os modelos padrão para aquele plano.  
4. **Verifique se todas as seções obrigatórias estão presentes** (Ex: cláusulas, valores, dados de equipamento, fidelidade, endereço de cobrança, etc.).  
5. Para cada erro encontrado, indique:
   - O trecho incorreto
   - A justificativa do erro
   - A sugestão de correção
6. **Organize sua resposta em uma lista com tópicos**, sendo cada tópico um erro detectado.

Use como referência os planos de 300Mbps, 500Mbps, 600Mbps, 800Mbps e Giga da CIABRASNET.

**Contrato para análise:**
${contractText}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== ANALYZE CONTRACT FUNCTION STARTED ===");
    
    const { contractText, filename } = await req.json();

    if (!contractText) {
      console.error("Erro: Texto do contrato não fornecido");
      throw new Error('Texto do contrato é obrigatório');
    }

    console.log("Verificando API key da OpenAI...");
    if (!openAIApiKey) {
      console.error("ERRO CRÍTICO: OPENAI_API_KEY não configurada no Supabase");
      throw new Error('API key da OpenAI não está configurada. Entre em contato com o administrador.');
    }

    console.log("API key encontrada, iniciando análise...");
    console.log("Arquivo:", filename);
    console.log("Tamanho do texto:", contractText.length, "caracteres");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: createPrompt(contractText)
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(45000)
    });

    console.log("Status da resposta OpenAI:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('API key da OpenAI inválida ou expirada. Verifique a configuração.');
      } else if (response.status === 429) {
        throw new Error('Limite de uso da API OpenAI atingido. Tente novamente em alguns minutos.');
      } else {
        throw new Error(`Erro na API OpenAI: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Resposta inválida da OpenAI:", data);
      throw new Error('Resposta inválida da OpenAI');
    }

    console.log("Análise concluída com sucesso!");

    const result = {
      success: true,
      content: data.choices[0].message.content,
      timestamp: new Date().toLocaleString('pt-BR'),
      filename: filename || 'arquivo.pdf'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("=== ERRO NA ANÁLISE ===");
    console.error("Tipo do erro:", error.name);
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
    
    let errorMessage = "Erro desconhecido na análise";
    
    if (error.name === 'AbortError') {
      errorMessage = "Timeout na análise (45s). Tente novamente com um arquivo menor.";
    } else if (error.message.includes('API key da OpenAI não está configurada')) {
      errorMessage = "API key da OpenAI não configurada. Entre em contato com o administrador.";
    } else if (error.message.includes('401') || error.message.includes('inválida')) {
      errorMessage = "API key da OpenAI inválida. Verifique sua chave da OpenAI.";
    } else if (error.message.includes('429')) {
      errorMessage = "Limite de uso da API atingido. Tente novamente em alguns minutos.";
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
    } else {
      errorMessage = error.message || "Erro na comunicação com OpenAI";
    }

    const result = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toLocaleString('pt-BR'),
      filename: ''
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
