// 🚀 FASE 2: PROMPT BUILDER DINÂMICO POR VELOCIDADE + EMPRESA
// Baseado nos contratos fornecidos e novo sistema de categorização

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

  return `# VALIDADOR INTELIGENTE DE CONTRATOS CIABRASNET/WNKBR - FASE 2
## SISTEMA DE CATEGORIZAÇÃO POR VELOCIDADE + EMPRESA

## OBJETIVO PRINCIPAL
Analisar contratos usando o novo sistema de categorização por velocidade + empresa, aplicando validações específicas para cada tipo de plano.

${modelIdentificationSection}

## 📊 MODELOS DISPONÍVEIS POR VELOCIDADE E EMPRESA

${modelsList}

## 🔍 ETAPA 1: IDENTIFICAÇÃO PRECISA DO MODELO

### Critérios de Identificação:
1. **Velocidade**: Buscar 300mb, 500mb, 600mb, 700mb, 800mb, 1gb
2. **Empresa**: Identificar CIABRASNET (Matriz/Porto União) ou WNKBR (Papanduva)
3. **Tipo**: RESIDENCIAL (12 meses) vs CORPORATIVO (24 meses)
4. **DDD**: 42 (CIABRASNET) vs 47 (WNKBR)

### Algoritmo de Identificação:
\`\`\`javascript
// Identificar empresa
if (texto.includes('CIABRASNET') || texto.includes('MATRIZ') || texto.includes('Porto União')) {
    empresa = 'CIABRASNET';
    ddd_esperado = '42';
} else if (texto.includes('WNKBR') || texto.includes('Papanduva')) {
    empresa = 'WNKBR';
    ddd_esperado = '47';
}

// Identificar velocidade
if (texto.includes('300') && texto.includes('mb')) velocidade = '300mb';
else if (texto.includes('500') && texto.includes('mb')) velocidade = '500mb';
else if (texto.includes('600') && texto.includes('mb')) velocidade = '600mb';
else if (texto.includes('700') && texto.includes('mb')) velocidade = '700mb';
else if (texto.includes('800') && texto.includes('mb')) velocidade = '800mb';
else if (texto.includes('1') && texto.includes('gb')) velocidade = '1gb';
\`\`\`

## 🚨 ETAPA 2: VALIDAÇÕES ESPECÍFICAS POR CATEGORIA

### 📱 VALIDAÇÃO CRÍTICA: TELEFONE CELULAR
**REGRA OBRIGATÓRIA: Celular deve ter 9 dígitos e começar com 9**

\`\`\`javascript
// Extrair número do celular (sem DDD)
numero_celular = extrair_numero_celular_sem_ddd(telefone);
digitos = numero_celular.replace(/[^0-9]/g, '');

// Verificações obrigatórias
if (digitos.length !== 9) {
    adicionar_erro_critico({
        campo: "TELEFONE CELULAR - DÍGITOS",
        valor_encontrado: telefone,
        valor_esperado: "9 dígitos exatos",
        explicacao: \`Celular tem \${digitos.length} dígitos, deve ter exatamente 9\`,
        sugestao: "Adicionar ou remover dígitos para totalizar 9"
    });
}

if (!digitos.startsWith('9')) {
    adicionar_erro_critico({
        campo: "TELEFONE CELULAR - FORMATO",
        valor_encontrado: telefone,
        valor_esperado: "Deve começar com 9",
        explicacao: "Celular deve iniciar com dígito 9",
        sugestao: "Corrigir número para iniciar com 9"
    });
}

// Exemplos:
// ❌ (42) 8855-4936 = 8 dígitos, não começa com 9 = ERRO DUPLO
// ❌ (42) 99955-493 = 8 dígitos = ERRO (falta 1 dígito)
// ❌ (42) 999555-4936 = 10 dígitos = ERRO (sobra 1 dígito)
// ✅ (42) 99955-4936 = 9 dígitos, começa com 9 = CORRETO
\`\`\`

### 💰 VALIDAÇÃO CRÍTICA: IP FIXO vs VARIÁVEL
**REGRA: IP Fixo adiciona R$ 50,00, IP Variável não adiciona nada**

\`\`\`javascript
// Identificar tipo de IP
tipo_ip = identificar_tipo_ip(texto_contrato);
valor_base = calcular_valor_base_servicos(modelo_identificado);

if (tipo_ip.toLowerCase().includes('fixo')) {
    valor_total_esperado = valor_base + 50.00;
    adicionar_info("IP Fixo: +R$ 50,00 adicionado ao valor total");
} else if (tipo_ip.toLowerCase().includes('variável')) {
    valor_total_esperado = valor_base;
    adicionar_info("IP Variável: sem taxa adicional");
} else {
    adicionar_erro("Tipo de IP não identificado claramente");
}

// Validar se o valor total bate
if (Math.abs(valor_total_encontrado - valor_total_esperado) > 0.01) {
    adicionar_erro_critico({
        campo: "VALOR TOTAL - IP",
        valor_encontrado: \`R$ \${valor_total_encontrado.toFixed(2)}\`,
        valor_esperado: \`R$ \${valor_total_esperado.toFixed(2)}\`,
        explicacao: \`IP \${tipo_ip} ${tipo_ip.includes('fixo') ? 'deve adicionar R$ 50,00' : 'não deve adicionar valor'}\`
    });
}
\`\`\`

### 🔧 VALIDAÇÃO ESPECÍFICA: EQUIPAMENTOS POR VELOCIDADE
**REGRA: Cada equipamento extra = +R$ 350,00**

\`\`\`javascript
// Equipamentos base obrigatórios
equipamentos_base = ['ONU', 'Conectores/cabos R$ 700,00'];

// Validações específicas por velocidade
if (velocidade === '600mb') {
    equipamentos_esperados = ['ONT', '700ONU', 'ROTEADOR', 'Conectores/cabos'];
    if (!texto_equipamentos.includes('ROTEADOR')) {
        adicionar_erro("Plano 600mb deve incluir ROTEADOR");
    }
}

// Contar equipamentos extras
equipamentos_extras = contar_equipamentos_extras(texto_equipamentos);
valor_equipamentos_extras = equipamentos_extras * 350.00;

adicionar_info(\`Equipamentos extras identificados: \${equipamentos_extras} × R$ 350,00 = R$ \${valor_equipamentos_extras.toFixed(2)}\`);
\`\`\`

### 📊 VALIDAÇÃO ESPECÍFICA: SERVIÇOS POR VELOCIDADE
**REGRAS POR VELOCIDADE:**

\`\`\`javascript
// Valores padrão por velocidade
const servicos_por_velocidade = {
    '300mb': {
        cnet_livros: 'R$ 29,90',
        cnet_play: 'R$ 0,00', 
        suporte: 'R$ 19,90',
        cnet_educa: null // Não obrigatório
    },
    '500mb': {
        cnet_livros: 'R$ 29,90',
        cnet_play: 'R$ 0,00',
        suporte: 'R$ 14,90',
        cnet_educa: null
    },
    '700mb': {
        cnet_livros: 'R$ 29,90',
        cnet_play: 'R$ 0,00',
        suporte: 'R$ 9,90',
        cnet_educa: 'R$ 19,90' // OBRIGATÓRIO
    },
    '800mb': {
        cnet_livros: 'R$ 29,90',
        cnet_play: 'R$ 0,00',
        suporte: 'R$ 14,90',
        cnet_educa: 'R$ 19,90' // OBRIGATÓRIO
    },
    '1gb': {
        cnet_livros: 'R$ 29,90',
        cnet_play: 'R$ 0,00',
        suporte: 'R$ 14,90',
        cnet_educa: 'R$ 19,90' // OBRIGATÓRIO
    }
};

// Validar serviços do modelo identificado
const servicos_esperados = servicos_por_velocidade[velocidade_identificada];
Object.keys(servicos_esperados).forEach(servico => {
    const valor_esperado = servicos_esperados[servico];
    const valor_encontrado = extrair_valor_servico(texto_contrato, servico);
    
    if (valor_esperado && valor_encontrado !== valor_esperado) {
        adicionar_erro_critico({
            campo: \`SERVIÇO - \${servico.toUpperCase()}\`,
            valor_encontrado: valor_encontrado || 'Não encontrado',
            valor_esperado: valor_esperado,
            explicacao: \`Plano \${velocidade_identificada} deve ter \${servico} = \${valor_esperado}\`
        });
    }
});
\`\`\`

### 🏢 VALIDAÇÃO: EMPRESA vs DDD
**REGRA: CIABRASNET = DDD 42, WNKBR = DDD 47**

\`\`\`javascript
// Validar coerência empresa × DDD
if (empresa_identificada === 'CIABRASNET' && ddd_encontrado !== '42') {
    adicionar_alerta({
        campo: "EMPRESA vs DDD",
        valor_encontrado: \`\${empresa_identificada} com DDD \${ddd_encontrado}\`,
        valor_esperado: "CIABRASNET com DDD 42 (Porto União)",
        severidade: "warning",
        explicacao: "Verificar se contrato é para região correta"
    });
}

if (empresa_identificada === 'WNKBR' && ddd_encontrado !== '47') {
    adicionar_alerta({
        campo: "EMPRESA vs DDD", 
        valor_encontrado: \`\${empresa_identificada} com DDD \${ddd_encontrado}\`,
        valor_esperado: "WNKBR com DDD 47 (Papanduva)",
        severidade: "warning",
        explicacao: "Verificar se contrato é para região correta"
    });
}
\`\`\`

### 💳 VALIDAÇÃO: FIDELIDADE PADRÃO
**REGRA: Sempre R$ 700,00 de desconto com fidelidade**

\`\`\`javascript
// Validar desconto de fidelidade
if (fidelidade_escolhida === 'SIM') {
    if (desconto_fidelidade !== 'R$ 700,00') {
        adicionar_erro({
            campo: "DESCONTO FIDELIDADE",
            valor_encontrado: desconto_fidelidade,
            valor_esperado: "R$ 700,00",
            explicacao: "Desconto padrão de fidelidade deve ser sempre R$ 700,00"
        });
    }
    
    // Taxa de instalação = GRATUITA ou R$ 200,00 (700 - 500 desconto parcial)
    // Taxa de cancelamento = R$ 700,00 proporcional
}
\`\`\`

## 📋 FORMATO DE RESPOSTA OBRIGATÓRIO - FASE 2

\`\`\`json
{
  "modelo_identificado": {
    "nome": "${identifiedModel?.name || 'Não identificado'}",
    "velocidade": "${identifiedModel?.speed || 'Não identificada'}",
    "empresa": "${identifiedModel?.company || 'Não identificada'}",
    "tipo": "${identifiedModel?.type || 'Não identificado'}",
    "valor_base": "${identifiedModel?.value || 'Não identificado'}",
    "confianca": 95,
    "ddd_esperado": "${identifiedModel?.ddd || 'Não identificado'}",
    "cidade": "${identifiedModel?.city || 'Não identificada'}"
  },
  "validacao_telefone_celular": {
    "numero_encontrado": "(XX) XXXXX-XXXX",
    "numero_sem_ddd": "XXXXXXXXX",
    "quantidade_digitos": 9,
    "inicia_com_9": true,
    "status": "CORRETO",
    "observacoes": "Telefone celular válido"
  },
  "validacao_ip": {
    "tipo_identificado": "Variável/Fixo",
    "valor_base_servicos": "R$ XXX,XX",
    "taxa_ip_fixo": "R$ 0,00 ou R$ 50,00",
    "valor_total_esperado": "R$ XXX,XX",
    "valor_total_encontrado": "R$ XXX,XX",
    "status": "CORRETO/ERRO"
  },
  "validacao_servicos": {
    "cnet_livros": {"esperado": "R$ 29,90", "encontrado": "R$ 29,90", "status": "OK"},
    "cnet_play": {"esperado": "R$ 0,00", "encontrado": "R$ 0,00", "status": "OK"},
    "suporte": {"esperado": "R$ XX,XX", "encontrado": "R$ XX,XX", "status": "OK/ERRO"},
    "cnet_educa": {"esperado": "R$ 19,90", "encontrado": "R$ 19,90", "status": "OK/NÃO_OBRIGATÓRIO"}
  },
  "validacao_equipamentos": {
    "base_obrigatorios": ["ONU", "Conectores/cabos"],
    "extras_identificados": 0,
    "valor_extras": "R$ 0,00",
    "status": "CORRETO"
  },
  "validacao_empresa_ddd": {
    "empresa": "CIABRASNET/WNKBR", 
    "ddd_encontrado": "42/47",
    "ddd_esperado": "42/47",
    "compatibilidade": "COMPATÍVEL/INCOMPATÍVEL"
  },
  "erros": [
    {
      "campo": "TELEFONE CELULAR",
      "tipo": "digitos_incorretos",
      "valor_encontrado": "(42) 9955-4936",
      "valor_esperado": "9 dígitos iniciando com 9",
      "explicacao": "Celular tem 8 dígitos, deve ter exatamente 9",
      "sugestao_correcao": "Adicionar 1 dígito: (42) 99955-4936",
      "severidade": "critico"
    }
  ],
  "resumo": {
    "total_erros": 0,
    "total_alertas": 0,
    "modelo_usado": "${identifiedModel?.name || 'Manual'}",
    "validacoes_realizadas": ["telefone", "ip", "servicos", "equipamentos", "empresa_ddd"],
    "status_geral": "aprovado/reprovado"
  }
}
\`\`\`

## 🎯 INSTRUÇÕES FINAIS - FASE 2

1. **USE O MODELO IDENTIFICADO** como referência principal
2. **APLIQUE VALIDAÇÕES ESPECÍFICAS** por velocidade e empresa
3. **SEJA PRECISO** nas validações de telefone celular (9 dígitos + começar com 9)
4. **CALCULE VALORES** baseado no tipo de IP (Fixo +R$ 50,00)
5. **VALIDE SERVIÇOS** conforme a tabela de velocidades
6. **VERIFIQUE COERÊNCIA** empresa × DDD × cidade
7. **DOCUMENTE TODAS** as validações realizadas

**PRINCÍPIO: Use o sistema inteligente de categorização para validações precisas e contextualizadas!**

---

**Contrato para análise:**
${contractText}`;
};
