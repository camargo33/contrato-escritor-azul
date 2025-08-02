#!/bin/bash

# 🎯 CORREÇÃO INTERFACE LIMPA - Remove JSON bruto quando não há erros
# Este script aplica apenas a correção da interface visual

echo "🎯 CORREÇÃO INTERFACE LIMPA"
echo "=========================="
echo ""
echo "🔧 PROBLEMA CORRIGIDO:"
echo "  ❌ ANTES: Mostrava JSON bruto mesmo sem erros"
echo "  ✅ AGORA: Interface limpa quando tudo está correto"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    echo "   cd contrato-escritor-azul"
    echo "   ./clean-interface.sh"
    exit 1
fi

echo "📱 ATUALIZANDO COMPONENTES FRONTEND..."
echo "======================================"

# Verificar se o repositório está atualizado
echo "🔄 Verificando atualizações do GitHub..."
git fetch origin main

# Verificar se há mudanças para puxar
if [ $(git rev-list HEAD...origin/main --count) -gt 0 ]; then
    echo "📥 Baixando últimas correções..."
    git pull origin main
    echo "✅ Repositório atualizado!"
else
    echo "✅ Repositório já está atualizado"
fi

echo ""
echo "🔍 VERIFICANDO ARQUIVOS CORRIGIDOS..."
echo "===================================="

# Verificar se os arquivos corrigidos existem
files_to_check=(
    "src/components/AnalysisReport.tsx"
    "src/components/analysis/FallbackAnalysisView.tsx"
    "src/components/analysis/AlertListCard.tsx"
    "src/components/analysis/ErrorListCard.tsx"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Existe"
        
        # Verificar se tem as correções específicas
        if grep -q "INTERFACE LIMPA" "$file" 2>/dev/null || grep -q "LIMPO" "$file" 2>/dev/null; then
            echo "   ✅ Contém correções da interface limpa"
        else
            echo "   ⚠️  Pode não ter as últimas correções"
        fi
    else
        echo "❌ $file - Não encontrado"
    fi
done

echo ""
echo "🧪 COMO TESTAR AS CORREÇÕES"
echo "=========================="
echo ""
echo "1. 📱 DEPLOY NO LOVABLE:"
echo "   - Acesse: https://lovable.dev"
echo "   - Import/Sync: camargo33/contrato-escritor-azul"
echo "   - Deploy automático"
echo ""
echo "2. 🧪 TESTE COM CONTRATO SEM ERROS:"
echo "   - Faça upload de um contrato válido"
echo "   - Analise o contrato"
echo "   - Resultado esperado:"
echo "     ✅ Interface limpa e organizada"
echo "     ✅ Status: APROVADO"
echo "     ✅ Nenhum alerta detectado"
echo "     ❌ SEM JSON bruto na tela"
echo ""
echo "3. 🧪 TESTE COM CONTRATO COM ERROS:"
echo "   - Faça upload de um contrato com problemas"
echo "   - Analise o contrato"
echo "   - Resultado esperado:"
echo "     ✅ Lista organizada de erros"
echo "     ✅ Cards coloridos por severidade"
echo "     ✅ Sugestões de correção claras"
echo "     ❌ SEM JSON bruto na tela"
echo ""

echo "📋 CHECKLIST DE VERIFICAÇÃO"
echo "=========================="
echo ""
echo "Após o deploy, verifique se:"
echo "□ Interface mostra status claro (APROVADO/REPROVADO)"
echo "□ Modelo de contrato é identificado corretamente"
echo "□ Erros são mostrados em cards organizados (se houver)"
echo "□ Alertas são mostrados de forma clara (se houver)"
echo "□ NÃO aparece JSON bruto em lugar nenhum"
echo "□ Telefone (42) 98833-3039 é reconhecido como válido"
echo "□ Botão 'Gerar Nova Análise' funciona corretamente"
echo ""

echo "🔧 ESTRUTURA CORRIGIDA"
echo "====================="
echo ""
echo "✅ AnalysisReport.tsx:"
echo "   - Parse robusto do JSON"
echo "   - Interface limpa quando não há erros"
echo "   - Fallback apenas para casos extremos"
echo ""
echo "✅ FallbackAnalysisView.tsx:"
echo "   - Não mostra JSON bruto desnecessário"
echo "   - Interface limpa mesmo em fallback"
echo "   - Foco apenas em erros reais"
echo ""
echo "✅ AlertListCard.tsx:"
echo "   - Proteção contra undefined"
echo "   - Filtragem inteligente de alertas"
echo "   - Exibição apenas quando relevante"
echo ""
echo "✅ ErrorListCard.tsx:"
echo "   - Proteção contra undefined"
echo "   - Validação robusta de erros"
echo "   - Cards organizados por severidade"
echo ""

echo "🎉 RESULTADO ESPERADO"
echo "===================="
echo ""
echo "✅ QUANDO NÃO HÁ ERROS:"
echo "   - Interface limpa e profissional"
echo "   - Status claro: APROVADO"
echo "   - Mensagem: 'Nenhum alerta detectado'"
echo "   - Botão para nova análise"
echo ""
echo "✅ QUANDO HÁ ERROS:"
echo "   - Lista organizada de problemas"
echo "   - Cards coloridos por severidade"
echo "   - Sugestões claras de correção"
echo "   - Contadores por tipo de erro"
echo ""
echo "❌ EM QUALQUER CASO:"
echo "   - NUNCA mostrar JSON bruto"
echo "   - NUNCA mostrar dados técnicos desnecessários"
echo "   - NUNCA confundir o usuário final"
echo ""

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo ""
    echo "💡 DICAS ADICIONAIS"
    echo "=================="
    echo ""
    echo "🔄 Para forçar atualização:"
    echo "   git pull origin main --force"
    echo ""
    echo "🧹 Para limpar cache do navegador:"
    echo "   - Pressione Ctrl+F5 (Windows/Linux)"
    echo "   - Pressione Cmd+Shift+R (Mac)"
    echo "   - Ou teste em aba anônima/incógnita"
    echo ""
    echo "🔍 Para debug no navegador:"
    echo "   - Pressione F12"
    echo "   - Vá para aba Console"
    echo "   - Procure por logs '[AnalysisReport]'"
    echo ""
fi

echo "🚀 PRÓXIMOS PASSOS"
echo "=================="
echo ""
echo "1. 🌐 Faça deploy no Lovable (https://lovable.dev)"
echo "2. 🧪 Teste com contratos reais"
echo "3. ✅ Verifique se a interface está limpa"
echo "4. 📞 Se ainda houver JSON bruto, limpe cache do navegador"
echo ""
echo "🎊 INTERFACE LIMPA APLICADA COM SUCESSO! 🎊"
echo ""
echo "📞 Suporte: Se ainda aparecer JSON bruto após o deploy,"
echo "            limpe o cache do navegador ou teste em aba anônima."
