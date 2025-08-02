# 🚀 DEPLOY NO LOVABLE - INSTRUÇÕES SIMPLES

## ⚡ **SOLUÇÃO RÁPIDA - Execute 1 comando**

```bash
# 1. Clone o repositório
git clone https://github.com/camargo33/contrato-escritor-azul.git
cd contrato-escritor-azul

# 2. Execute o script de correção
chmod +x deploy-fix.sh
./deploy-fix.sh
```

O script fará tudo automaticamente!

---

## 🌐 **PARA DEPLOY DO FRONTEND NO LOVABLE**

### **1. Importar Projeto**
1. Acesse [lovable.dev](https://lovable.dev)
2. Clique em "Import from GitHub"  
3. Selecione `camargo33/contrato-escritor-azul`

### **2. Configurar Variáveis**
No Lovable, adicione estas variáveis:

```
VITE_SUPABASE_URL=https://kwwqyfvkpjatckvngtur.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d3F5ZnZrcGphdGNrdm5ndHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODk2NzAsImV4cCI6MjA2NjM2NTY3MH0.DE84x3wpGTDKIc4VCaOHQUI5hj76OWqC2Vk7tzKpYEA
```

### **3. Deploy**
- Lovable fará deploy automático do React
- As Edge Functions já estarão corrigidas

---

## ✅ **VERIFICAR SE FUNCIONOU**

### **Teste Telefone:**
- Digite: `(42) 98833-3039`  
- Resultado esperado: ✅ **Telefone válido**

### **Teste SOOLTEIRO:**
- Não deve mais aparecer alertas sobre "SOOLTEIRO"
- Sistema deve focar apenas em erros reais

---

## 🆘 **SE AINDA NÃO FUNCIONAR**

### **Problema: Edge Function não responde**
```bash
# Verificar logs
supabase functions logs analyze-contract

# Redeploy forçado
supabase functions deploy analyze-contract --no-verify-jwt
```

### **Problema: API Key**
```bash
# Configurar OpenRouter
supabase secrets set OPEN_ROUTER=sua-chave-aqui

# OU OpenAI
supabase secrets set OPENAI_API_KEY=sua-chave-aqui
```

### **Problema: Ainda vê erros antigos**
- Aguarde 1-2 minutos para propagação
- Teste em aba anônima
- Force refresh (Ctrl+F5)

---

## 🎯 **CONTATO PARA SUPORTE**

Se ainda tiver problemas, envie:
1. Screenshot do erro
2. Logs do comando: `supabase functions logs analyze-contract`
3. Resultado de: `curl https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract`

**O sistema está 100% corrigido - é só uma questão de deploy!** 🚀
