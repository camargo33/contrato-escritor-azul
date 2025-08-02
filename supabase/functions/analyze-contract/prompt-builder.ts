// 🚀 PROMPT BUILDER DEFINITIVO - DETECTA ERROS REAIS, NÃO INVENTA
// CORREÇÃO CRÍTICA: Deve detectar erros óbvios que existem no texto

import { CONTRACT_MODELS, identifyContractModel, calculateExpectedTotal } from './contract-models.ts';
import { validateContract } from './contract-validations.ts';

export const buildContractAnalysisPrompt = (contractText: string): string => {
  // 🎯 IDENTIFICAR MODELO AUTOMATICAMENTE
  const identifiedModel = identifyContractModel(contractText);
  
  // 📊 CONSTRUIR LISTA DE MODELOS DISPONÍVEIS
  const modelsList = CONTRACT_MODELS.map(model => {
    const expectedTotal = calculateExpectedTotal(model, false); // Sem IP fixo inicialmente
    const expectedTotalWithIP = calculateExpectedTotal(model, true); // Com IP fixo
    
    return `**${model.name}** (${model.speed.toUpperCase()})
   - Empresa: ${model.company_full_name} (${model.city} - DDD ${model.ddd})
   - Valor: ${model.value} (${model.type} - ${model.validity_period})
   - Serviços: ${model.services.cnet_livros} (CNET Livros) + ${model.services.suporte} (Suporte)${model.services.cnet_educa ? ` + ${model.services.cnet_educa} (CNET Educa)` : ''} + ${model.services.cnet_play} (CNET Play)
   - IP: ${model.fixed_ip}
   - Valor Total Esperado: R$ ${expectedTotal.toFixed(2)} (IP Variável) | R$ ${expectedTotalWithIP.toFixed(2)} (IP Fixo)
   - Equipamentos: ${model.equipment}
   - Instalação: ${model.installation_fee}
   - Cancelamento: ${model.cancellation_fee}`;
  }).join('\n\n');

  // 🎯 MODELO IDENTIFICADO (SE HOUVER)
  const modelIdentificationSection = identifiedModel ? `
## 🎯 MODELO IDENTIFICADO AUTOMATICAMENTE
**${identifiedModel.name}** (${identifiedModel.speed.toUpperCase()}) - ${identifiedModel.company}
- Valor Base: ${identifiedModel.value}
- Tipo: ${identifiedModel.type} (${identifiedModel.validity_period})
- Empresa: ${identifiedModel.company_full_name}
- Cidade: ${identifiedModel.city} - DDD ${identifiedModel.ddd}
- Valor Total Esperado sem IP Fixo: R$ ${calculateExpectedTotal(identifiedModel, false).toFixed(2)}
- Valor Total Esperado com IP Fixo: R$ ${calculateExpectedTotal(identifiedModel, true).toFixed(2)}

**Use este modelo como referência principal para validações!**
` : `
## ⚠️ MODELO NÃO IDENTIFICADO AUTOMATICAMENTE
Analise o texto para identificar velocidade, empresa e tipo de contrato.
`;

  return `# VALIDADOR EQUILIBRADO DE CONTRATOS CIABRASNET/WNKBR
## DETECTA ERROS REAIS - NÃO INVENTA ERROS INEXISTENTES

## 🎯 OBJETIVO: DETECTAR APENAS ERROS QUE REALMENTE EXISTEM NO TEXTO

**INSTRUÇÕES CRÍTICAS:**
1. **DETECTE** erros que estão claramente visíveis no texto
2. **NÃO INVENTE** erros que não existem
3. **SEJA RIGOROSO** com erros óbvios e evidentes
4. **SEJA CONSERVADOR** apenas quando há dúvida

${modelIdentificationSection}

## 📊 MODELOS DISPONÍVEIS POR VELOCIDADE E EMPRESA

${modelsList}

## 🔍 VALIDAÇÕES OBRIGATÓRIAS - DETECTAR ERROS REAIS

### 📱 VALIDAÇÃO RIGOROSA DE TELEFONE CELULAR

**REGRA OBRIGATÓRIA: Celular brasileiro DEVE ter exatamente 9 dígitos e começar com 9**

\`\`\`javascript
function validar_telefone_rigoroso(telefone_texto) {
    // Encontrar padrão de telefone no texto
    const regex_telefone = /\\(?(\\d{2})\\)?[\\s-]?(\\d{4,5})[\\s-]?(\\d{4})/g;
    
    let match;
    while ((match = regex_telefone.exec(telefone_texto)) !== null) {
        const ddd = match[1];
        const parte1 = match[2];
        const parte2 = match[3];
        const numero_completo = parte1 + parte2;
        
        console.log(`Analisando: (${ddd}) ${parte1}-${parte2} = ${numero_completo.length} dígitos`);
        
        // VERIFICAÇÃO RIGOROSA:
        
        // 1. Deve ter exatamente 9 dígitos
        if (numero_completo.length !== 9) {
            return {
                erro: `Telefone celular inválido: (${ddd}) ${parte1}-${parte2}`,
                motivo: `Celular deve ter 9 dígitos, encontrado ${numero_completo.length} dígitos`,
                encontrado: `(${ddd}) ${parte1}-${parte2}`,
                esperado: "(XX) 9XXXX-XXXX (9 dígitos)"
            };
        }
        
        // 2. Deve começar com 9
        if (!numero_completo.startsWith('9')) {
            return {
                erro: `Telefone celular inválido: (${ddd}) ${parte1}-${parte2}`,
                motivo: `Celular deve começar com 9, encontrado iniciando com ${numero_completo[0]}`,
                encontrado: `(${ddd}) ${parte1}-${parte2}`,
                esperado: "(XX) 9XXXX-XXXX (inicia com 9)"
            };
        }
        
        // 3. DDD deve ser válido (11-99)
        const ddd_num = parseInt(ddd);
        if (ddd_num < 11 || ddd_num > 99) {
            return {
                erro: `DDD inválido: ${ddd}`,
                motivo: `DDD deve estar entre 11 e 99`,
                encontrado: ddd,
                esperado: "11-99"
            };
        }
    }
    
    return { valido: true };
}

// EXEMPLOS DE VALIDAÇÃO:
// ✅ (42) 98833-3039 = 9 dígitos, inicia com 9 = VÁLIDO
// ❌ (42) 998853-6432 = 10 dígitos = ERRO REAL
// ❌ (42) 8833-3039 = 8 dígitos = ERRO REAL
\`\`\`

### 📝 VALIDAÇÃO RIGOROSA DE ORTOGRAFIA

**DETECTAR ERROS ORTOGRÁFICOS ÓBVIOS QUE EXISTEM NO TEXTO**

\`\`\`javascript
function validar_ortografia(texto) {
    const erros_ortograficos = [];
    
    // Palavras com erros óbvios - detectar apenas se existirem no texto
    const palavras_incorretas = {
        'SOOLTEIRO': 'SOLTEIRO',
        'SOLETEIRO': 'SOLTEIRO', 
        'SOLTERO': 'SOLTEIRO',
        'CASDO': 'CASADO',
        'CAZADO': 'CASADO',
        'VIUVA': 'VIÚVA',
        'VIUVO': 'VIÚVO'
    };
    
    // Verificar se alguma palavra incorreta está presente
    for (const [incorreta, correta] of Object.entries(palavras_incorretas)) {
        if (texto.includes(incorreta)) {
            erros_ortograficos.push({
                erro: `Erro ortográfico encontrado: "${incorreta}"`,
                correcao: `Deveria ser: "${correta}"`,
                localizacao: `Palavra "${incorreta}" encontrada no texto`,
                campo: "Estado Civil"
            });
        }
    }
    
    return erros_ortograficos;
}
\`\`\`

### 🗓️ VALIDAÇÃO DE DATAS - APENAS FORMATO

**NÃO validar anos futuros - apenas formato DD/MM/AAAA**

\`\`\`javascript
function validar_formato_datas(texto) {
    const regex_data = /\\b(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})\\b/g;
    const erros_data = [];
    
    let match;
    while ((match = regex_data.exec(texto)) !== null) {
        const dia = parseInt(match[1]);
        const mes = parseInt(match[2]);
        
        // Validar apenas formato básico
        if (dia < 1 || dia > 31) {
            erros_data.push({
                erro: `Data com dia inválido: ${match[0]}`,
                encontrado: match[0],
                esperado: "DD/MM/AAAA (dia 01-31)"
            });
        }
        
        if (mes < 1 || mes > 12) {
            erros_data.push({
                erro: `Data com mês inválido: ${match[0]}`,
                encontrado: match[0],
                esperado: "DD/MM/AAAA (mês 01-12)"
            });
        }
    }
    
    return erros_data;
}
\`\`\`

### 💰 VALIDAÇÃO DE VALORES E TAXAS

\`\`\`javascript
function validar_consistencia_valores(texto, modelo_identificado) {
    const erros_valores = [];
    
    // Extrair valores do texto
    const regex_valor = /R\\$\\s*([\\d.,]+)/g;
    const valores_encontrados = [];
    
    let match;
    while ((match = regex_valor.exec(texto)) !== null) {
        valores_encontrados.push(match[1]);
    }
    
    // Validar apenas se conseguir identificar claramente
    // (implementar validações específicas baseadas no modelo)
    
    return erros_valores;
}
\`\`\`

## 🚨 REGRAS DE DETECÇÃO DE ERROS

### ✅ DETECTE (OBRIGATÓRIO):
1. **Erros ortográficos óbvios** que estão visíveis no texto
2. **Telefones com número incorreto** de dígitos (≠ 9)
3. **Telefones que não começam com 9** (celular)
4. **Datas com formato inválido** (não DD/MM/AAAA)
5. **DDDs inválidos** (< 11 ou > 99)
6. **Valores inconsistentes** se claramente visíveis

### ❌ NÃO DETECTE:
1. **Erros que não existem** no texto
2. **Datas futuras** (2025, 2026 são válidas)
3. **Campos em branco** se não obrigatórios
4. **Valores duvidosos** se não tem certeza

## 📋 FORMATO DE RESPOSTA RIGOROSO

\`\`\`json
{
  "modelo_identificado": {
    "nome": "${identifiedModel?.name || 'Não identificado'}",
    "velocidade": "${identifiedModel?.speed || 'Não identificada'}",
    "empresa": "${identifiedModel?.company || 'Não identificada'}",
    "confianca": 95
  },
  "validacao_telefone": {
    "telefones_encontrados": ["LISTAR TODOS OS TELEFONES ENCONTRADOS"],
    "status": "VÁLIDO/INVÁLIDO",
    "erros": ["APENAS SE HOUVER ERROS REAIS"]
  },
  "validacao_ortografia": {
    "palavras_incorretas": ["APENAS SE ENCONTRADAS NO TEXTO"],
    "status": "CORRETO/ERRO",
    "correcoes": ["CORREÇÕES NECESSÁRIAS"]
  },
  "validacao_datas": {
    "datas_encontradas": ["LISTAR DATAS"],
    "formato_status": "VÁLIDO/INVÁLIDO",
    "erros": ["APENAS SE FORMATO INCORRETO"]
  },
  "erros": [
    {
      "campo": "CAMPO ESPECÍFICO",
      "valor_encontrado": "VALOR EXATO DO TEXTO",
      "valor_esperado": "VALOR CORRETO",
      "sugestao_correcao": "COMO CORRIGIR",
      "severidade": "critico/alto/medio/baixo"
    }
  ],
  "alertas": [
    "APENAS ALERTAS BASEADOS EM DADOS REAIS"
  ],
  "resumo": {
    "total_erros": 0,
    "status_geral": "aprovado/reprovado",
    "observacoes": "COMENTÁRIOS BASEADOS NO TEXTO REAL"
  }
}
\`\`\`

## 🎯 EXEMPLOS DE DETECÇÃO CORRETA

### ✅ ERRO REAL - DEVE DETECTAR:
**Texto:** "ESTADO CIVIL: SOOLTEIRO"
**Resposta:** ERRO - "SOOLTEIRO" deveria ser "SOLTEIRO"

**Texto:** "CELULAR: (42) 998853-6432"  
**Resposta:** ERRO - 10 dígitos, deveria ter 9

### ✅ SEM ERRO - NÃO DEVE DETECTAR:
**Texto:** "Data: 17/04/2025"
**Resposta:** VÁLIDO - formato correto, ano futuro permitido

**Texto:** "CELULAR: (42) 98833-3039"
**Resposta:** VÁLIDO - 9 dígitos, inicia com 9

## 🎯 PRINCÍPIO FUNDAMENTAL

**DETECTE APENAS ERROS QUE VOCÊ CONSEGUE VER CLARAMENTE NO TEXTO ORIGINAL**

Se está escrito "SOOLTEIRO" → DETECTE o erro  
Se está escrito "(42) 998853-6432" → DETECTE o erro (10 dígitos)  
Se está escrito "17/04/2025" → NÃO detecte erro (formato correto)

---

**Contrato para análise:**
${contractText}`;
};