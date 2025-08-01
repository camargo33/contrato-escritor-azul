# 🚀 GUIA DE DEPLOY - EDGE FUNCTION

## 🚨 **PROBLEMA DETECTADO: Edge Function não responde**

### **Erro observado:**
```
❌ Failed to load resource: net::ERR_FAILED
❌ FunctionsFetchError: Failed to send a request to the Edge Function
❌ CORS policy: Request header field x-application-name is not allowed
```

### **Causa mais provável:**
A Edge Function `analyze-contract` **não está deployada** no Supabase ou está com problemas de configuração.

---

## 🔧 **SOLUÇÃO RÁPIDA**

### **1. Instalar Supabase CLI**
```bash
# Instalar CLI do Supabase
npm install -g supabase

# Verificar instalação
supabase --version
```

### **2. Login no Supabase**
```bash
# Login na sua conta
supabase login

# Você será redirecionado para o browser para autenticar
```

### **3. Associar ao Projeto**
```bash
# No diretório do projeto
cd contrato-escritor-azul

# Associar ao projeto Supabase
supabase link --project-ref kwwqyfvkpjatckvngtur

# Se perguntado pela senha do banco, use a do seu projeto
```

### **4. Deploy da Edge Function**
```bash
# Deploy da função analyze-contract
supabase functions deploy analyze-contract

# Verificar se deployou com sucesso
supabase functions list
```

### **5. Configurar Secrets (API Keys)**
```bash
# Configurar chave da OpenAI ou OpenRouter
supabase secrets set OPEN_ROUTER=sk-or-sua-chave-aqui

# OU para OpenAI
supabase secrets set OPENAI_API_KEY=sk-sua-chave-openai-aqui

# Verificar secrets configurados
supabase secrets list
```

### **6. Testar a Function**
```bash
# Testar localmente (opcional)
supabase functions serve analyze-contract

# Testar health check
curl https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract
```

---

## 🔍 **VERIFICAÇÃO SE ESTÁ FUNCIONANDO**

### **No Console do Navegador:**
```javascript
// Testar health check da Edge Function
fetch('https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d3F5ZnZrcGphdGNrdm5ndHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODk2NzAsImV4cCI6MjA2NjM2NTY3MH0.DE84x3wpGTDKIc4VCaOHQUI5hj76OWqC2Vk7tzKpYEA'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### **Resposta Esperada:**
```json
{
  "success": true,
  "message": "Edge Function está funcionando corretamente",
  "timestamp": "2025-08-01T...",
  "version": "1.0.0",
  "status": "healthy"
}
```

---

## 🛠️ **TROUBLESHOOTING AVANÇADO**

### **Se o deploy falhar:**

#### **Erro: "Project not found"**
```bash
# Re-associar ao projeto
supabase link --project-ref kwwqyfvkpjatckvngtur --password SUA_SENHA_DB
```

#### **Erro: "Authentication failed"**
```bash
# Fazer logout e login novamente
supabase logout
supabase login
```

#### **Erro: "Function already exists"**
```bash
# Fazer redeploy forçado
supabase functions deploy analyze-contract --no-verify-jwt
```

### **Verificar logs da função:**
```bash
# Ver logs em tempo real
supabase functions logs --project-ref kwwqyfvkpjatckvngtur

# Ver logs específicos da função
supabase functions logs analyze-contract
```

### **Verificar se os secrets estão corretos:**
```bash
# Listar todos os secrets
supabase secrets list

# Atualizar secret se necessário
supabase secrets set OPEN_ROUTER=nova-chave-aqui
```

---

## ⚡ **SOLUÇÃO ALTERNATIVA - DEPLOY VIA DASHBOARD**

Se o CLI não funcionar, use o Dashboard do Supabase:

### **1. Acesse o Dashboard**
- Vá para [dashboard.supabase.com](https://dashboard.supabase.com)
- Selecione seu projeto `kwwqyfvkpjatckvngtur`

### **2. Edge Functions**
- Clique em "Edge Functions" no menu lateral
- Clique em "New Function"
- Nome: `analyze-contract`

### **3. Upload do Código**
- Copie todo o conteúdo da pasta `supabase/functions/analyze-contract/`
- Cole no editor do dashboard
- Clique em "Deploy"

### **4. Configurar Secrets**
- Vá em "Settings" > "Secrets"
- Adicione: `OPEN_ROUTER` com sua chave da API

---

## 🎯 **TESTE FINAL**

Após o deploy, use o **Componente de Diagnóstico** na aplicação:

1. Acesse a aplicação
2. Vá para uma página com o diagnóstico
3. Clique em "Executar Diagnóstico"
4. Verifique se a "Edge Function" aparece como ✅ OK

---

## 📞 **SE AINDA NÃO FUNCIONAR**

1. **Verifique os logs:**
   ```bash
   supabase functions logs analyze-contract --project-ref kwwqyfvkpjatckvngtur
   ```

2. **Teste manual no Postman/curl:**
   ```bash
   curl -X POST https://kwwqyfvkpjatckvngtur.supabase.co/functions/v1/analyze-contract \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SUA_CHAVE_ANON" \
     -d '{"test": true}'
   ```

3. **Re-deploy completo:**
   ```bash
   supabase functions delete analyze-contract
   supabase functions deploy analyze-contract
   ```

---

## ✅ **CHECKLIST FINAL**

- [ ] Supabase CLI instalado
- [ ] Login feito no Supabase
- [ ] Projeto linkado corretamente  
- [ ] Edge Function deployada
- [ ] Secrets configurados (OPEN_ROUTER ou OPENAI_API_KEY)
- [ ] Health check retorna status 200
- [ ] Diagnóstico da aplicação mostra ✅ para Edge Function

**Após completar esses passos, o erro de CORS e ERR_FAILED deve ser resolvido!** 🎉
