# 📄 Analisador de Contratos CIABRASNET

**Sistema simplificado de análise inteligente de contratos focado na funcionalidade core**

## 🎯 **VISÃO GERAL - SISTEMA SIMPLIFICADO (FASE 1)**

Sistema otimizado para análise de contratos com **foco na funcionalidade essencial**:
- ✅ **Análise temporária** - Resultados na hora, sem histórico
- ✅ **Contratos base** - Templates para comparação inteligente  
- ✅ **Interface limpa** - Apenas funcionalidades necessárias
- ✅ **Deploy simples** - Menos pontos de falha

---

## 🚀 **FUNCIONALIDADES PRINCIPAIS**

### **1. Análise de Contratos** 
- 📄 Upload de PDF para análise
- 🤖 Análise inteligente com IA (Claude 3.5 Sonnet)
- ⚡ Resultado imediato (30-60 segundos)
- 📊 Detecção de erros críticos e alertas

### **2. Contratos Base**
- 📋 Upload de templates de contratos
- 🏷️ Organização por categorias
- 🔄 Comparação automática durante análise
- 💾 Armazenamento seguro no Supabase

### **3. Validações Implementadas**
- ✅ **CPF** - 11 dígitos obrigatórios
- ✅ **Telefone** - 8 dígitos (fixo) ou 9 dígitos (celular)
- ✅ **Email** - Detecção de erros óbvios de digitação
- ✅ **DDD** - Validação de códigos brasileiros válidos
- ✅ **Ortografia** - Alertas para erros comuns

---

## 📋 **ESTRUTURA SIMPLIFICADA**

### **Páginas do Sistema**
```
📱 /analise           # Página principal - Análise de contratos
📁 /contratos-base    # Gerenciar templates de contratos
🔐 /auth             # Login e cadastro
```

### **Banco de Dados Simplificado**
```sql
📋 base_contracts    # Contratos base (MANTIDO)
👤 auth.users       # Usuários (Supabase Auth)

❌ analysis_history  # REMOVIDO - Sem histórico persistente
```

### **Funcionalidades Removidas (Simplificação)**
- ❌ Dashboard de estatísticas
- ❌ Relatórios de histórico  
- ❌ Análises salvas
- ❌ Métricas de uso
- ❌ Componentes de debug complexos

---

## 🏗️ **ARQUITETURA ATUAL**

### **Frontend (React + TypeScript)**
- ⚡ **Vite** - Build tool ultrarrápido
- 🎨 **Tailwind CSS** - Styling moderno  
- 🧩 **shadcn/ui** - Componentes de qualidade
- 📱 **Responsivo** - Design mobile-first

### **Backend (Supabase Simplificado)**
- 🗄️ **PostgreSQL** - Apenas base_contracts
- 🔐 **Auth** - Autenticação integrada
- 📁 **Storage** - Contratos base organizados
- ⚡ **Edge Function** - Análise sem persistência

### **IA/ML**
- 🤖 **OpenRouter + Claude 3.5 Sonnet** - Análise inteligente
- 📄 **PDF.js** - Extração de texto
- 🔍 **Validação conservadora** - Apenas erros óbvios

---

## 🚀 **INSTALAÇÃO E CONFIGURAÇÃO**

### **1. Clonar e Instalar**
```bash
git clone https://github.com/camargo33/contrato-escritor-azul.git
cd contrato-escritor-azul
npm install
```

### **2. Configurar Variáveis de Ambiente**
```env
# .env.local
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# Para a Edge Function (Supabase Dashboard)
OPEN_ROUTER_API_KEY=sk-sua-chave-openrouter
```

### **3. Executar Migração (Supabase)**
```bash
# Aplicar simplificação do banco
supabase db push
```

### **4. Deploy da Edge Function**
```bash
# Deploy da função simplificada
supabase functions deploy analyze-contract
```

### **5. Executar Localmente**
```bash
npm run dev
```

---

## 🔧 **DEPLOY EM PRODUÇÃO**

### **Opção 1: Lovable (Recomendado)**
1. Conectar repositório GitHub ao Lovable
2. Configurar variáveis de ambiente no painel
3. Deploy automático a cada commit

### **Opção 2: Vercel/Netlify**
```bash
# Build para produção
npm run build

# Deploy manual ou conectar Git
```

### **Variáveis de Ambiente Necessárias**
```env
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

---

## 💻 **COMO USAR O SISTEMA**

### **1. Gerenciar Contratos Base**
```
1. Acesse "Contratos Base"
2. Faça upload de PDFs template
3. Organize por categorias
4. Sistema usará para comparação
```

### **2. Analisar Contrato**
```
1. Acesse "Análise de Contratos"  
2. Faça upload do PDF
3. Aguarde análise (30-60s)
4. Visualize erros e alertas
5. Resultado é temporário
```

### **3. Interpretar Resultados**
```
🟢 APROVADO    # Sem erros críticos
🔴 REPROVADO   # Erros críticos encontrados

📊 Seções do Resultado:
├── Erros Críticos (obrigatório corrigir)
├── Alertas (sugestões)  
├── Contratos Base Utilizados
└── Score de Qualidade
```

---

## 🔍 **VALIDAÇÕES IMPLEMENTADAS**

### **Erros Críticos (Reprovam Contrato)**
```javascript
❌ CPF com ≠ 11 dígitos
❌ Telefone com dígitos incorretos  
❌ Email com erros óbvios (gmial, hotmial)
❌ DDD fora da faixa 11-99
```

### **Alertas (Não Reprovam)**
```javascript
⚠️ Possíveis erros ortográficos
⚠️ Sugestões de melhoria
⚠️ Inconsistências menores
```

### **Abordagem Conservadora**
- ✅ Só detecta erros **realmente óbvios**
- ✅ Evita falsos positivos
- ✅ Foco em qualidade, não quantidade de erros

---

## 🛡️ **SEGURANÇA**

### **Dados Temporários**
- ✅ Análises não são salvas
- ✅ PDFs processados apenas na sessão
- ✅ Sem acúmulo de dados sensíveis
- ✅ LGPD friendly por design

### **Contratos Base Protegidos**
- ✅ Row Level Security (RLS) ativo
- ✅ Usuário só acessa seus templates
- ✅ Storage segmentado por user_id
- ✅ Validação de permissões

---

## 🐛 **TROUBLESHOOTING**

### **Problemas Comuns**

#### ❌ "Edge Function não responde"
```bash
# Verificar deploy da função
supabase functions list
supabase functions deploy analyze-contract
```

#### ❌ "API Key não configurada"  
```bash
# Configurar no Supabase Dashboard
# Project > Edge Functions > Environment Variables
# OPEN_ROUTER_API_KEY=sk-...
```

#### ❌ "Erro de CORS"
```bash
# Verificar domínio nas variáveis de ambiente
# Configurar CORS no Supabase se necessário
```

#### ❌ "Upload falha"
```bash
# Verificar bucket 'base-contracts' existe
# Verificar RLS policies estão corretas
```

---

## 📊 **MONITORAMENTO**

### **Logs Disponíveis**
```javascript
// Console do navegador (Frontend)
console.log("🚀 Análise iniciada");
console.error("❌ Erro encontrado");

// Supabase Dashboard (Backend)  
// Project > Logs > Edge Functions
```

### **Health Check**
```bash
# Testar Edge Function
curl https://sua-url.supabase.co/functions/v1/analyze-contract

# Resposta esperada:
# { "success": true, "status": "healthy" }
```

---

## 🎯 **ROADMAP PÓS FASE 1**

### **Próximas Fases (Opcionais)**
- 🔄 **Fase 2**: Sistema de prompt dinâmico por categoria
- 📊 **Fase 3**: Métricas básicas (se necessário)
- 🎨 **Fase 4**: Customização de validações
- 🔍 **Fase 5**: OCR para PDFs escaneados

### **Melhorias Incrementais**
- ✨ Novas validações específicas
- 🎨 Aprimoramentos de UI/UX  
- ⚡ Otimizações de performance
- 🔐 Recursos de segurança avançada

---

## 🎉 **VANTAGENS DA SIMPLIFICAÇÃO**

### **Para o Usuário**
- ⚡ **Mais rápido** - Foco na análise principal
- 🎯 **Mais simples** - Interface limpa e objetiva  
- 🔒 **Mais seguro** - Menos dados persistentes
- 💰 **Mais barato** - Menor uso de recursos

### **Para Manutenção**
- 🐛 **Menos bugs** - Menos código = menos problemas
- 🔧 **Deploy fácil** - Menos dependências
- 📈 **Escalável** - Arquitetura stateless
- 🔍 **Debug simples** - Menos pontos de falha

---

## 📞 **SUPORTE**

### **Desenvolvimento**
- 🔧 **GitHub**: https://github.com/camargo33/contrato-escritor-azul
- 📧 **Issues**: Para reportar bugs ou sugestões

### **Deploy e Configuração**
- 📚 **Documentação Supabase**: https://supabase.com/docs
- 🌐 **Documentação Lovable**: Para deploy automático

---

## ✨ **SISTEMA SIMPLIFICADO E EFICIENTE**

**Foco na funcionalidade core**: O sistema agora oferece **exatamente o que é necessário** para análise inteligente de contratos, sem complexidades desnecessárias.

- 🎯 **Objetivo claro**: Analisar contratos com qualidade
- ⚡ **Resposta rápida**: Resultado na hora
- 🔧 **Manutenção simples**: Código limpo e organizado  
- 🚀 **Deploy fácil**: Menos configurações e dependências

**A simplificação trouxe maior confiabilidade e facilidade de uso!** ✨

---

*Sistema simplificado na FASE 1 - Focado na excelência da análise de contratos* 🎯
