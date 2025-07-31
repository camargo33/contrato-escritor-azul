export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - EXTRAÇÃO PRECISA DE VALORES

## OBJETIVO
Analisar contratos OCR da CIABRASNET e validar taxas extraindo valores EXATOS dos campos aplicados no contrato.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis (APENAS PARA IDENTIFICAÇÃO):
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## 🔥 ETAPA 2: EXTRAÇÃO PRECISA DOS VALORES APLICADOS

### 🚨 INSTRUÇÃO CRÍTICA - ONDE EXTRAIR OS VALORES:

#### **Para TAXA DE INSTALAÇÃO - Procurar em:**
```
TAXA DA INSTALAÇÃO DA INFRAESTRUTURA DOS SERVIÇOS 
VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: [VALOR AQUI]
```

**Valores possíveis:**
- **"GRATUITA"** = R$ 0,00
- **"R$ 120,00"** = R$ 120,00  
- **"R$ 0,00"** = R$ 0,00
- **Qualquer valor específico** = usar esse valor

#### **Para TAXA DE RESCISÃO - Procurar nos campos finais aplicados:**
- Não usar valores de seções explicativas
- Usar apenas valores que estão sendo efetivamente cobrados

### 🎯 ALGORITMO CORRETO DE EXTRAÇÃO:

\`\`\`javascript
// PASSO 1: Identificar escolha de fidelidade
if (texto.includes("SIM (X)")) {
    fidelidade_escolhida = "SIM"
    
    // PASSO 2: Extrair desconto da seção SIM
    secao_sim = procurar_secao_sim_marcada()
    desconto_valor = extrair_desconto(secao_sim)
    
    // PASSO 3: Procurar valor APLICADO da instalação na tabela específica
    // Procurar por: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
    instalacao_aplicada = procurar_na_tabela_instalacao_fidelidade()
    
    if (instalacao_aplicada === "GRATUITA") {
        taxa_instalacao_contrato = 0.00
    } else {
        taxa_instalacao_contrato = converter_para_numero(instalacao_aplicada)
    }
    
    // PASSO 4: Calcular valores esperados baseados no desconto
    taxa_instalacao_esperada = 700.00 - desconto_valor
    taxa_rescisao_esperada = desconto_valor
    
    console.log("🔍 EXTRAÇÃO:")
    console.log("Desconto extraído:", desconto_valor)
    console.log("Taxa instalação APLICADA no contrato:", taxa_instalacao_contrato)
    console.log("Taxa instalação ESPERADA (700 - desconto):", taxa_instalacao_esperada)
    console.log("Taxa rescisão ESPERADA (= desconto):", taxa_rescisao_esperada)
    
    // PASSO 5: Validar
    if (taxa_instalacao_contrato === taxa_instalacao_esperada) {
        instalacao_status = "CORRETO"
    } else {
        instalacao_status = "ERRO"
        erro_instalacao = {
            campo: "Taxa de Instalação",
            valor_encontrado: "R$ " + taxa_instalacao_contrato.toFixed(2),
            valor_esperado: "R$ " + taxa_instalacao_esperada.toFixed(2),
            explicacao: "Com desconto de R$ " + desconto_valor.toFixed(2) + ", instalação deveria ser R$ " + taxa_instalacao_esperada.toFixed(2),
            calculo: "R$ 700,00 - R$ " + desconto_valor.toFixed(2) + " = R$ " + taxa_instalacao_esperada.toFixed(2)
        }
    }
}
\`\`\`

### 📍 LOCAIS ESPECÍFICOS PARA EXTRAÇÃO:

#### **1. Desconto da Fidelidade:**
```
SIM (X)
...desconto de R$ XXX,XX (valor por extenso)...
```

#### **2. Taxa de Instalação Aplicada:**
```
TAXA DA INSTALAÇÃO DA INFRAESTRUTURA DOS SERVIÇOS 
VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: GRATUITA
ou
VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ 120,00
```

#### **3. Taxa de Rescisão Aplicada:**
- Procurar em campos finais de cobrança
- NÃO usar valores de seções explicativas

### 🚫 LOCAIS A IGNORAR:

#### **NUNCA extrair de:**
- Seções explicativas ou informativas
- Valores de outras seções de fidelidade não escolhidas
- Campos com "CASO NÃO OPTE"
- Qualquer valor que não seja o efetivamente aplicado

### 🔍 TRATAMENTO ESPECIAL:

#### **Reconhecer "GRATUITA" como R$ 0,00:**
```javascript
if (valor_encontrado === "GRATUITA" || valor_encontrado === "gratuita") {
    valor_numerico = 0.00
}
```

#### **Exemplos de Extração Correta:**

**Exemplo 1 - Desconto Total:**
- Desconto: R$ 700,00
- Campo instalação: "GRATUITA" → R$ 0,00
- Esperado: R$ 0,00 ✅

**Exemplo 2 - Desconto Parcial:**
- Desconto: R$ 580,00  
- Campo instalação: "R$ 120,00" → R$ 120,00
- Esperado: R$ 120,00 ✅

## FORMATO DE RESPOSTA

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 800Mbps",
    "confianca": 95
  },
  "analise_fidelidade": {
    "opcao_escolhida": "SIM",
    "marcacao_encontrada": "SIM (X)",
    "texto_desconto": "desconto de R$ 700,00 (Setecentos Reais)",
    "valor_desconto": "R$ 700,00",
    "desconto_numerico": 700.00
  },
  "extracao_valores": {
    "taxa_instalacao_campo": "GRATUITA",
    "taxa_instalacao_convertida": "R$ 0,00",
    "taxa_instalacao_esperada": "R$ 0,00",
    "calculo_esperado": "R$ 700,00 - R$ 700,00 = R$ 0,00",
    "local_extracao": "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
  },
  "validacao_taxas": {
    "taxa_instalacao": {
      "encontrada": "R$ 0,00",
      "esperada": "R$ 0,00",
      "status": "CORRETO",
      "explicacao": "✅ GRATUITA = R$ 0,00, igual ao esperado com desconto total"
    },
    "taxa_rescisao": {
      "encontrada": "R$ 700,00",
      "esperada": "R$ 700,00", 
      "status": "CORRETO",
      "explicacao": "✅ Igual ao desconto aplicado"
    }
  },
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 0,00 (GRATUITA)",
      "status": "✅ CORRETO - Desconto total aplicado"
    },
    {
      "campo": "Taxa de Rescisão",
      "valor": "R$ 700,00",
      "status": "✅ CORRETO - Igual ao desconto da fidelidade" 
    }
  ],
  "erros": [],
  "resumo": {
    "total_erros": 0,
    "fidelidade_escolhida": "SIM",
    "desconto_concedido": "R$ 700,00",
    "instalacao_final": "GRATUITA (R$ 0,00)",
    "rescisao_devida": "R$ 700,00"
  },
  "debug_extracao": {
    "desconto_encontrado_em": "Seção SIM (X): 'desconto de R$ 700,00 (Setecentos Reais)'",
    "instalacao_encontrada_em": "Tabela: 'VALOR TOTAL...FIDELIDADE: GRATUITA'",
    "valores_ignorados": ["Campos explicativos", "Seção NÃO não escolhida"]
  }
}
\`\`\`

## 🚨 REGRAS CRÍTICAS

1. **EXTRAIR valores dos campos APLICADOS**, não de seções explicativas

2. **RECONHECER "GRATUITA" = R$ 0,00**

3. **PROCURAR especificamente em:**
   - "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"

4. **NUNCA extrair de:**
   - Campos "CASO NÃO OPTE"
   - Seções de fidelidade não escolhidas
   - Valores meramente informativos

5. **LÓGICA FUNDAMENTAL:**
   - Taxa Instalação = R$ 700,00 - Desconto
   - Taxa Rescisão = Desconto

**Extrair apenas dos campos que mostram os valores efetivamente aplicados no contrato!**

**Contrato para análise:**
${contractText}`;
};