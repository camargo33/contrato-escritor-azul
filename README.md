# 📄 Analisador de Contratos CIABRASNET/WNKBR - FASE 2

**Sistema inteligente de análise por velocidade + empresa com categorização dinâmica**

## 🎯 **VISÃO GERAL - SISTEMA AVANÇADO (FASE 2)**

Sistema otimizado com **categorização inteligente por velocidade e empresa**:
- ✅ **Identificação automática** - Detecta velocidade (300mb-1gb) e empresa (CIABRASNET/WNKBR)
- ✅ **Validações específicas** - Regras personalizadas por tipo de plano  
- ✅ **Análise temporária** - Resultados na hora, sem histórico
- ✅ **Prompt dinâmico** - IA usa contexto específico de cada modelo
- ✅ **Interface simplificada** - Foco na funcionalidade essencial

---

## 🚀 **FUNCIONALIDADES PRINCIPAIS - FASE 2**

### **1. Identificação Automática de Modelos** 
- 🎯 **Por Velocidade**: 300mb, 500mb, 600mb, 700mb, 800mb, 1gb
- 🏢 **Por Empresa**: CIABRASNET (Matriz/Porto União) vs WNKBR (Papanduva)
- 📍 **Por Região**: DDD 42 (Porto União) vs DDD 47 (Papanduva)
- 💼 **Por Tipo**: RESIDENCIAL (12 meses) vs CORPORATIVO (24 meses)

### **2. Validações Específicas Avançadas**
- 📱 **Telefone Celular**: Deve ter 9 dígitos e começar com 9
- 🌐 **IP Fixo vs Variável**: IP Fixo adiciona R$ 50,00, Variável não
- 🔧 **Equipamentos**: Validação por velocidade (600mb inclui ROTEADOR)
- 💰 **Serviços**: Valores corretos por velocidade (CNET Livros, Suporte, CNET Educa)
- 🏢 **Empresa × DDD**: Coerência entre empresa e código de área

### **3. Sistema de Prompt Dinâmico**
- 🤖 **Contexto Inteligente**: IA recebe modelo identificado automaticamente
- 📊 **Valores Esperados**: Cálculo automático com/sem IP Fixo
- 🔍 **Validações Direcionadas**: Regras específicas para cada categoria
- ⚡ **Análise Otimizada**: Foco nas validações relevantes

---

## 📋 **MODELOS SUPORTADOS (FASE 2)**

### **CIABRASNET (Porto União - DDD 42)**
```
🏢 CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA

300mb → R$ 109,99 (Promocional/Convênio)
500mb → R$ 119,99 (Convênio)  
600mb → R$ 129,99 (Com IP upgrade)
700mb → R$ 139,99 (Convênio + CNET Educa)
800mb → R$ 159,99 (+ CNET Educa)
1gb   → R$ 209,99 (Residencial) / R$ 229,90 (Corporativo)
```

### **WNKBR (Papanduva - DDD 47)**
```
🏢 WNKBR TELECOM LTDA

300mb → R$ 109,99 (Convênio)
500mb → R$ 119,99 (Convênio)
700mb → R$ 139,99 (Convênio + CNET Educa)
```

### **Serviços Padrão por Velocidade**
```
300mb: CNET Livros (R$ 29,90) + Suporte (R$ 19,90) + CNET Play (R$ 0,00)
500mb: CNET Livros (R$ 29,90) + Suporte (R$ 14,90) + CNET Play (R$ 0,00)
600mb: CNET Livros (R$ 29,90) + Suporte (R$ 14,90) + CNET Play (R$ 0,00)
700mb: CNET Livros (R$ 29,90) + Suporte (R$ 9,90) + CNET Educa (R$ 19,90)
800mb: CNET Livros (R$ 29,90) + Suporte (R$ 14,90) + CNET Educa (R$ 19,90)
1gb:   CNET Livros (R$ 29,90) + Suporte (R$ 14,90) + CNET Educa (R$ 19,90)
```

---

## 🔍 **VALIDAÇÕES AVANÇADAS (FASE 2)**

### **📱 Telefone Celular (CRÍTICO)**
```javascript
✅ CORRETO: (42) 99955-4936 = 9 dígitos, inicia com 9
❌ ERRO: (42) 9955-4936 = 8 dígitos (falta 1)
❌ ERRO: (42) 998853-6432 = 10 dígitos (sobra 1)  
❌ ERRO: (42) 89955-4936 = não inicia com 9
```

### **🌐 IP Fixo vs Variável (CRÍTICO)**
```javascript
IP Fixo:     Valor Total = Valor Base + R$ 50,00
IP Variável: Valor Total = Valor Base + R$ 0,00

Exemplo 600mb:
- IP Variável: R$ 129,99 + R$ 29,90 + R$ 14,90 = R$ 174,79
- IP Fixo:     R$ 129,99 + R$ 29,90 + R$ 14,90 + R$ 50,00 = R$ 224,79
```

### **🔧 Equipamentos por Velocidade**
```javascript
Base: ONU/ONT (R$ 350,00) + Conectores/cabos (R$ 700,00)
600mb: + ROTEADOR obrigatório
Extras: Cada equipamento adicional = +R$ 350,00
```

### **🏢 Empresa vs DDD (ALERTA)**
```javascript
CIABRASNET → DDD 42 (Porto União)
WNKBR      → DDD 47 (Papanduva)

Inconsistência gera alerta, não erro crítico
```

### **💳 Fidelidade Padrão**
```javascript
COM fidelidade:    Desconto R$ 700,00
SEM fidelidade:    Taxa instalação R$ 700,00
Taxa cancelamento: Proporcional ao desconto
```

---

## 🏗️ **ARQUITETURA TÉCNICA - FASE 2**

### **Sistema de Identificação Automática**
```typescript
// Algoritmo de detecção
function identifyContractModel(contractText: string) {
  // 1. Identificar empresa
  if (text.includes('CIABRASNET') || text.includes('MATRIZ')) 
    company = 'CIABRASNET'
  
  // 2. Identificar velocidade  
  if (text.includes('600') && text.includes('mb'))
    speed = '600mb'
    
  // 3. Buscar modelo correspondente
  return getModelsBySpeedAndCompany(speed, company)
}
```

### **Prompt Builder Dinâmico**
```typescript
// Constrói prompt específico para o modelo identificado
buildContractAnalysisPrompt(contractText) {
  const model = identifyContractModel(contractText)
  
  return `
    MODELO IDENTIFICADO: ${model.name}
    VALORES ESPERADOS: ${calculateExpectedTotal(model)}
    VALIDAÇÕES ESPECÍFICAS: ${getValidationsForModel(model)}
    ...
  `
}
```

### **Sistema de Validações**
```typescript
// Validações contextualizadas
validateContract(contractData, identifiedModel) {
  const rules = getRulesForModel(identifiedModel)
  
  return {
    cellPhone: validateCellPhone(data.phone),
    ipConfiguration: validateIPConfiguration(data.ip, model.baseValue),
    services: validateServiceValues(data.services, model.speed),
    equipment: validateEquipment(data.equipment, model.speed)
  }
}
```

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

### **3. Deploy da Edge Function FASE 2**
```bash
# Deploy da função com novo sistema
supabase functions deploy analyze-contract
```

### **4. Executar Localmente**
```bash
npm run dev
```

---

## 💻 **COMO USAR O SISTEMA - FASE 2**

### **1. Análise Automática**
```
1. Acesse "Análise de Contratos"
2. Faça upload do PDF
3. Sistema identifica automaticamente:
   - Velocidade (300mb-1gb)  
   - Empresa (CIABRASNET/WNKBR)
   - Tipo (Residencial/Corporativo)
4. Aplica validações específicas
5. Retorna análise contextualizada
```

### **2. Interpretar Resultados Avançados**
```json
{
  "modelo_identificado": {
    "nome": "CONVENIO COMBO 600 MB",
    "velocidade": "600mb",
    "empresa": "CIABRASNET", 
    "ddd_esperado": "42"
  },
  "validacao_telefone_celular": {
    "status": "ERRO",
    "explicacao": "Celular tem 8 dígitos, deve ter 9"
  },
  "validacao_ip": {
    "tipo": "Fixo",
    "valor_esperado": "R$ 224,79",
    "status": "CORRETO"
  },
  "validacao_servicos": {
    "cnet_livros": {"esperado": "R$ 29,90", "status": "OK"},
    "suporte": {"esperado": "R$ 14,90", "status": "ERRO"}
  }
}
```

---

## 🎯 **VANTAGENS DA FASE 2**

### **Inteligência Contextual**
- 🎯 **Identificação automática** de modelos
- 🔍 **Validações específicas** por categoria
- 💰 **Cálculos precisos** baseados no modelo
- 🏢 **Coerência empresa × região** automatizada

### **Facilidade de Uso**
- ⚡ **Análise mais rápida** - IA focada no modelo correto
- 🎨 **Resultados organizados** - Por categoria de validação
- 📊 **Informações detalhadas** - Valores esperados vs encontrados
- 🔧 **Sugestões específicas** - Correções direcionadas

### **Manutenibilidade**
- 📋 **Modelos centralizados** - Fácil adicionar novos contratos
- 🔄 **Sistema extensível** - Novas velocidades/empresas facilmente
- 🧪 **Testável** - Validações modulares e independentes
- 📚 **Documentado** - Cada validação tem explicação clara

---

## 🔧 **TROUBLESHOOTING - FASE 2**

### **Problemas de Identificação**
```bash
# Modelo não identificado
❌ "Modelo não identificado automaticamente"

Soluções:
✅ Verificar se velocidade está clara no texto (300mb, 600mb, etc)
✅ Verificar se empresa está mencionada (CIABRASNET, WNKBR)
✅ Adicionar novo modelo em contract-models.ts se necessário
```

### **Validações Falhando**
```bash
# Validação específica falha
❌ "Telefone celular inválido" 

Verificar:
✅ Número tem exatamente 9 dígitos
✅ Inicia com dígito 9
✅ Formato: (XX) 9XXXX-XXXX

❌ "Valor IP incorreto"

Verificar:
✅ IP marcado como "Fixo" ou "Variável"
✅ Cálculo: IP Fixo = Base + R$ 50,00
```

### **Health Check FASE 2**
```bash
# Testar sistema avançado
curl https://sua-url.supabase.co/functions/v1/analyze-contract

# Resposta esperada:
{
  "success": true,
  "version": "2.0.0", 
  "features": [
    "Categorização por velocidade (300mb-1gb)",
    "Suporte CIABRASNET + WNKBR",
    "Validações específicas por modelo"
  ],
  "models_available": {
    "total_models": 11,
    "by_company": {"CIABRASNET": 8, "WNKBR": 3}
  }
}
```

---

## 📊 **MONITORAMENTO E LOGS**

### **Logs da Edge Function**
```javascript
// Logs específicos da FASE 2
console.log('🎯 FASE 2 - Iniciando análise inteligente...')
console.log('✅ Modelo identificado:', model.name)
console.log('🏢 Empresa:', model.company)  
console.log('⚡ Velocidade:', model.speed)
console.log('🔍 Validações:', validations.validatedFields.length)
```

### **Debugging por Modelo**
```bash
# Verificar modelos disponíveis
curl https://sua-url/functions/v1/analyze-contract \
  -X GET | jq '.models_available'

# Testar identificação específica
curl https://sua-url/functions/v1/analyze-contract \
  -X POST \
  -d '{"contractText": "COMBO 600MB CIABRASNET"}' \
  | jq '.metadata.auto_identified_model'
```

---

## 🎯 **ROADMAP FUTURO**

### **FASE 3 (Planejada)**
- 📊 **Métricas opcionais** - Se o usuário solicitar
- 🎨 **Customização de regras** - Validações personalizáveis
- 🔍 **OCR avançado** - Para PDFs escaneados
- 📱 **API pública** - Para integração externa

### **Melhorias Incrementais**
- 🏢 **Novas empresas** - Expandir além CIABRASNET/WNKBR
- ⚡ **Novas velocidades** - 2gb, velocidades personalizadas
- 🔧 **Validações extras** - Regras específicas por região
- 🤖 **IA aprimorada** - Modelos mais recentes

---

## 📞 **SUPORTE TÉCNICO**

### **Desenvolvimento FASE 2**
- 🔧 **GitHub**: https://github.com/camargo33/contrato-escritor-azul
- 📧 **Issues**: Para bugs específicos da categorização
- 💬 **Discussões**: Para sugestões de novos modelos

### **Configuração Avançada**
- 📚 **Contract Models**: `supabase/functions/analyze-contract/contract-models.ts`
- 🔍 **Validations**: `supabase/functions/analyze-contract/contract-validations.ts` 
- 🤖 **Prompt Builder**: `supabase/functions/analyze-contract/prompt-builder.ts`

---

## ✨ **SISTEMA INTELIGENTE E CONTEXTUALIZADO**

**A FASE 2 revolucionou a análise**: O sistema agora **entende automaticamente** qual tipo de contrato está analisando e aplica **validações específicas** para cada categoria.

### **Evolução das Fases**
```
FASE 1: Sistema simplificado e funcional ✅
FASE 2: Categorização inteligente por velocidade + empresa ✅  
FASE 3: Personalização e métricas opcionais (planejada)
```

### **Principais Inovações da FASE 2**
- 🎯 **Identificação automática** - Zero configuração manual
- 🔍 **Validações contextualizadas** - Regras específicas por modelo
- 💰 **Cálculos precisos** - Valores esperados automáticos
- 🏢 **Multi-empresa** - CIABRASNET + WNKBR unified
- 📱 **Validação avançada** - Telefone celular específico brasileiro

**A inteligência contextual trouxe precisão e confiabilidade sem precedentes!** 🚀

---

*Sistema FASE 2 - Análise inteligente por categorização automática* 🎯
