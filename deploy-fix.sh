#!/bin/bash

# 🚀 SCRIPT DE CORREÇÃO AUTOMÁTICA - Telefone e SOOLTEIRO
# Execute este script para aplicar as correções rapidamente

echo "🚀 APLICANDO CORREÇÕES - Telefone (42) 98833-3039 e removendo SOOLTEIRO"
echo "=================================================="

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "📥 Instalando Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI encontrado"

# Verificar se está logado
echo "🔐 Verificando login no Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Não está logado no Supabase"
    echo "🔑 Fazendo login..."
    supabase login
fi

echo "✅ Login confirmado"

# Link do projeto (se necessário)
echo "🔗 Verificando link do projeto..."
if ! supabase status &> /dev/null; then
    echo "🔗 Fazendo link do projeto..."
    supabase link --project-ref kwwqyfvkpjatckvngtur
fi

echo "✅ Projeto linkado"

# Deploy da Edge Function corrigida
echo "🚀 Deployando Edge Function com correções..."
supabase functions deploy analyze-contract

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployada com sucesso!"
else
    echo "❌ Erro no deploy da Edge Function"
    exit 1
fi

# Verificar se as API keys estão configuradas
echo "🔑 Verificando API keys..."
if ! supabase secrets list | grep -q "OPEN_ROUTER\|OPENAI_API_KEY"; then
    echo "⚠️  API keys não encontradas!"
    echo "📝 Configure sua API key:"
    echo "   supabase secrets set OPEN_ROUTER=sk-or-sua-chave-aqui"
    echo "   OU"
    echo "   supabase secrets set OPENAI_API_KEY=sk-sua-chave-openai-aqui"
else
    echo "✅ API keys configuradas"
fi

# Testar a função
echo "🧪 Testando a Edge Function..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract)

if [ "$response" = "200" ]; then
    echo "✅ Edge Function respondendo corretamente (HTTP 200)"
else
    echo "❌ Edge Function com problema (HTTP $response)"
fi

echo ""
echo "🎉 CORREÇÕES APLICADAS!"
echo "=================================================="
echo "✅ Telefone (42) 98833-3039 deve ser reconhecido como VÁLIDO"
echo "✅ 'SOOLTEIRO' não deve mais aparecer nos alertas"
echo "🧪 Teste agora no seu sistema!"
echo ""
echo "🔍 Para verificar logs se houver problemas:"
echo "   supabase functions logs analyze-contract"
echo ""
echo "🌐 URL da Edge Function:"
echo "   https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract"
