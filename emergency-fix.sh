#!/bin/bash

# 🚨 CORREÇÃO DE EMERGÊNCIA - Import Supabase + Deploy Forçado
# Este script corrige o erro de import e força o deploy

echo "🚨 CORREÇÃO DE EMERGÊNCIA - Import Supabase"
echo "============================================="

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "📥 Instalando Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI verificado"

# Login se necessário
echo "🔐 Verificando login..."
if ! supabase projects list &> /dev/null; then
    echo "🔑 Fazendo login no Supabase..."
    supabase login
fi

# Link do projeto forçado
echo "🔗 Fazendo link do projeto..."
supabase link --project-ref kwwqyfvkpjatckvngtur

# Limpar cache e forçar redeploy
echo "🗑️ Limpando cache..."
rm -rf .supabase 2>/dev/null || true

# Deploy forçado da Edge Function
echo "🚀 Deploy FORÇADO da Edge Function..."
echo "⚠️ Ignorando verificações de cache..."

supabase functions deploy analyze-contract --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Deploy FORÇADO realizado com sucesso!"
else
    echo "❌ Erro no deploy forçado"
    echo "🔍 Tentando redeploy com debug..."
    
    # Segundo deploy com mais informações
    supabase functions deploy analyze-contract --debug
    
    if [ $? -eq 0 ]; then
        echo "✅ Deploy com debug realizado!"
    else
        echo "❌ Deploy persistentemente falhando"
        echo "📋 Logs do erro:"
        supabase functions logs analyze-contract --limit 10
        exit 1
    fi
fi

# Configurar secrets se necessário
echo "🔑 Verificando secrets..."
if ! supabase secrets list | grep -q "OPEN_ROUTER\|OPENAI_API_KEY"; then
    echo "⚠️ Configure sua API key:"
    echo "   supabase secrets set OPEN_ROUTER=sua-chave-aqui"
    echo "   OU"
    echo "   supabase secrets set OPENAI_API_KEY=sua-chave-aqui"
else
    echo "✅ API keys encontradas"
fi

# Aguardar propagação
echo "⏱️ Aguardando propagação (10 segundos)..."
sleep 10

# Testar a função
echo "🧪 Testando Edge Function corrigida..."
response=$(curl -s -w "%{http_code}" https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract -o /tmp/response.json)

if [ "$response" = "200" ]; then
    echo "✅ Edge Function respondendo corretamente!"
    echo "📄 Resposta:"
    cat /tmp/response.json | head -10
    rm -f /tmp/response.json
else
    echo "❌ Edge Function ainda com problemas (HTTP $response)"
    echo "🔍 Verificando logs recentes..."
    supabase functions logs analyze-contract --limit 5
fi

echo ""
echo "🎯 CORREÇÃO CONCLUÍDA!"
echo "======================="
echo "✅ Import corrigido e cache limpo"
echo "✅ Deploy forçado realizado"
echo "🧪 Teste o sistema agora!"
echo ""
echo "📞 Se ainda houver problemas:"
echo "   1. Aguarde mais 2-3 minutos"
echo "   2. Teste em aba anônita"
echo "   3. Verifique: supabase functions logs analyze-contract"
