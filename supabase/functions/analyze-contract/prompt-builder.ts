// 🚀 FASE 2: PROMPT BUILDER DINÂMICO - CORRIGIDO PARA SER CONSERVADOR
// Corrigindo validações de telefone e removendo alucinações

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

  return `# VALIDADOR CONSERVADOR DE CONTRATOS CIABRASNET/WNKBR - FASE 2
## DETECÇÃO APENAS DE ERROS REAIS E ÓBVIOS

## 🚨 INSTRUÇÕES CRÍTICAS - SER EXTREMAMENTE CONSERVADOR

**IMPORTANTE: APENAS detecte erros que são REALMENTE ÓBVIOS e CRÍTICOS. NÃO INVENTE ou ASSUMA erros!**

## OBJETIVO PRINCIPAL
Analisar contratos usando categorização por velocidade + empresa, detectando APENAS erros críticos óbvios.

${modelIdentificationSection}

## 📊 MODELOS DISPONÍVEIS POR VELOCIDADE E EMPRESA

${modelsList}

## 🔍 ETAPA 1: IDENTIFICAÇÃO AUTOMÁTICA DO MODELO

### Algoritmo de Identificação:
\`\`\`javascript
// Identificar empresa
if (texto.includes('CIABRASNET') || texto.includes('MATRIZ')) empresa = 'CIABRASNET';
else if (texto.includes('WNKBR') || texto.includes('Papanduva')) empresa = 'WNKBR';

// Identificar velocidade
if (texto.includes('300') && texto.includes('mb')) velocidade = '300mb';
else if (texto.includes('600') && texto.includes('mb')) velocidade = '600mb';
// etc...
\`\`\`

## 🚨 VALIDAÇÕES CONSERVADORAS - APENAS ERROS ÓBVIOS

### 📱 VALIDAÇÃO DE TELEFONE CELULAR - SER CONSERVADOR!

**REGRA CORRIGIDA: Celular brasileiro tem 9 dígitos e DEVE começar com 9**

\`\`\`javascript
// ALGORITMO CONSERVADOR CORRETO:
function validar_telefone_celular(telefone_completo) {
    // Extrair apenas números
    const numeros = telefone_completo.replace(/[^0-9]/g, '');
    
    // Deve ter exatamente 11 dígitos (DDD + celular)
    if (numeros.length !== 11) {
        return { erro: "Telefone deve ter 11 dígitos total" };
    }
    
    // Extrair DDD e número do celular
    const ddd = numeros.substring(0, 2);
    const numero_celular = numeros.substring(2);
    
    // Verificar se número do celular tem 9 dígitos
    if (numero_celular.length !== 9) {
        return { erro: "Número celular deve ter 9 dígitos" };
    }
    
    // Verificar se começa com 9
    if (!numero_celular.startsWith('9')) {
        return { erro: "Celular deve começar com 9" };
    }
    
    return { valido: true };
}

// EXEMPLOS CORRETOS:
// ✅ (42) 98833-3039 = 11 dígitos total, 9 dígitos celular, inicia com 9 = VÁLIDO
// ✅ (42) 99955-4936 = 11 dígitos total, 9 dígitos celular, inicia com 9 = VÁLIDO  
// ✅ (47) 91234-5678 = 11 dígitos total, 9 dígitos celular, inicia com 9 = VÁLIDO

// EXEMPLOS INCORRETOS:
// ❌ (42) 8833-3039 = 10 dígitos total (8 celular) = ERRO
// ❌ (42) 38833-3039 = 11 dígitos, mas não inicia com 9 = ERRO
\`\`\`

**IMPORTANTE: (42) 98833-3039 é um número VÁLIDO!**

### 💰 VALIDAÇÃO DE IP FIXO vs VARIÁVEL

\`\`\`javascript
// Identificar tipo de IP no contrato
if (contrato.includes('IP FIXO') || contrato.includes('FIXO')) {
    tipo_ip = 'fixo';
    valor_extra_esperado = 50.00;
} else if (contrato.includes('IP VARIÁVEL') || contrato.includes('VARIÁVEL')) {
    tipo_ip = 'variavel';
    valor_extra_esperado = 0.00;
} else {
    // Se não está claro, não reportar erro
    tipo_ip = 'não_identificado';
}
\`\`\`

### 🔧 VALIDAÇÃO DE EQUIPAMENTOS

\`\`\`javascript
// Equipamentos base obrigatórios
equipamentos_obrigatorios = ['ONU', 'Conectores', 'cabos'];

// Apenas reportar erro se claramente ausente
equipamentos_texto = extrair_secao_equipamentos(contrato);
if (!equipamentos_texto.includes('ONU') && !equipamentos_texto.includes('ONT')) {
    adicionar_erro("Equipamento ONU/ONT não encontrado");
}
\`\`\`

## 🚨 REGRAS CRÍTICAS PARA EVITAR ALUCINAÇÕES

### ❌ NÃO FAÇA:
1. **NÃO inventar erros** que não existem no texto
2. **NÃO assumir** dados que não estão claros
3. **NÃO criar exemplos** de erros ortográficos ("SOOLTEIRO", etc.) 
4. **NÃO detectar** erros em campos que não consegue identificar claramente
5. **NÃO reportar** problemas baseados em "suposições"

### ✅ APENAS FAÇA:
1. **Detectar erros óbvios** que estão claramente no texto
2. **Validar dados** que consegue extrair com certeza
3. **Reportar problemas** apenas quando tem certeza absoluta
4. **Ser conservador** - prefira aprovar a reprovar incorretamente

## 📋 FORMATO DE RESPOSTA CONSERVADOR

\`\`\`json
{
  "modelo_identificado": {
    "nome": "${identifiedModel?.name || 'Não identificado'}",
    "velocidade": "${identifiedModel?.speed || 'Não identificada'}",
    "empresa": "${identifiedModel?.company || 'Não identificada'}",
    "confianca": 95
  },
  "validacao_telefone_celular": {
    "numero_encontrado": "APENAS SE IDENTIFICADO CLARAMENTE",
    "status": "CORRETO/ERRO/NAO_IDENTIFICADO",
    "observacoes": "APENAS SE HOUVER ERRO ÓBVIO"
  },
  "validacao_ip": {
    "tipo_identificado": "APENAS SE CLARO NO TEXTO",
    "status": "CORRETO/ERRO/NAO_IDENTIFICADO"
  },
  "erros": [
    "APENAS ERROS REALMENTE CRÍTICOS E ÓBVIOS"
  ],
  "alertas": [
    "APENAS ALERTAS BASEADOS EM DADOS REAIS DO TEXTO"
  ],
  "resumo": {
    "total_erros": 0,
    "status_geral": "aprovado/reprovado",
    "observacoes": "APENAS COMENTÁRIOS BASEADOS EM DADOS REAIS"
  }
}
\`\`\`

## 🎯 PRINCÍPIOS FINAIS

1. **CONSERVADOR SEMPRE** - Melhor aprovar um contrato duvidoso que reprovar um correto
2. **APENAS DADOS REAIS** - Não invente, não assuma, não crie exemplos
3. **TELEFONE (42) 98833-3039 É VÁLIDO** - 9 dígitos, inicia com 9
4. **SEM ALUCINAÇÕES** - Não reporte "SOOLTEIRO" ou erros que não existem
5. **FOCO NA REALIDADE** - Analise apenas o que está escrito no contrato

**LEMBRE-SE: É melhor não detectar um erro real do que criar um erro inexistente!**

---

**Contrato para análise:**
${contractText}`;
};
