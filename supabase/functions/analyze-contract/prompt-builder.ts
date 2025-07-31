export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - EXTRAÇÃO PRECISA DE LOCAIS ESPECÍFICOS

## OBJETIVO
Analisar contratos OCR da CIABRASNET extraindo valores EXATAMENTE dos locais corretos especificados.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis (APENAS PARA IDENTIFICAÇÃO):
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## 🔥 ETAPA 2: EXTRAÇÃO DOS LOCAIS CORRETOS

### 🚨 REGRA CRÍTICA - ONDE EXTRAIR OS VALORES:

#### **TAXA DE INSTALAÇÃO - LOCAL CORRETO:**
**SEMPRE extrair da seção:**
\`\`\`
TAXA DA INSTALAÇÃO DA INFRAESTRUTURA DOS SERVIÇOS
VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: [VALOR_AQUI]
\`\`\`

#### **TAXA DE INSTALAÇÃO - LOCAL ERRADO (NUNCA USAR):**
**NUNCA extrair da tabela geral:**
\`\`\`
TAXA DE INSTALAÇÃO ( ) SIM ( X ) NÃO R$ 200,00
\`\`\`

### 🎯 LÓGICA DE FIDELIDADE:

**Valor base instalação = R$ 700,00**

#### **COM FIDELIDADE SIM (X):**
1. Extrair desconto da seção "SIM (X)"
2. Taxa Instalação = R$ 700,00 - Desconto
3. Taxa Rescisão = Desconto
4. **IMPORTANTE:** Valor aplicado deve vir da seção específica da fidelidade

#### **SEM FIDELIDADE NÃO (X):**
1. Taxa Instalação = R$ 700,00
2. Taxa Rescisão = R$ 700,00

### 🔍 ALGORITMO DE EXTRAÇÃO CORRETO:

\`\`\`javascript
// PASSO 1: Identificar escolha de fidelidade
if (texto.includes("SIM (X)")) {
    fidelidade_escolhida = "SIM"
    
    // PASSO 2: Extrair desconto da seção SIM (X)
    secao_sim = procurar_secao_sim_marcada()
    desconto_valor = extrair_desconto(secao_sim)
    
    // PASSO 3: EXTRAIR DA SEÇÃO ESPECÍFICA DA FIDELIDADE (NÃO DA TABELA GERAL!)
    procurar_por = "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE:"
    instalacao_aplicada = extrair_valor_apos_texto(procurar_por)
    
    // Converter valores
    if (instalacao_aplicada === "GRATUITA" || instalacao_aplicada === "gratuita") {
        taxa_instalacao_contrato = 0.00
    } else {
        taxa_instalacao_contrato = converter_para_numero(instalacao_aplicada)
    }
    
    // PASSO 4: Calcular valores esperados
    taxa_instalacao_esperada = 700.00 - desconto_valor
    taxa_rescisao_esperada = desconto_valor
    
    console.log("🔍 EXTRAÇÃO CORRETA:")
    console.log("Desconto extraído:", desconto_valor)
    console.log("Taxa instalação APLICADA (seção fidelidade):", taxa_instalacao_contrato)
    console.log("Taxa instalação ESPERADA:", taxa_instalacao_esperada)
    
    // PASSO 5: Validar
    if (taxa_instalacao_contrato === taxa_instalacao_esperada) {
        instalacao_status = "CORRETO"
        instalacao_explicacao = "✅ Valor correto baseado no desconto da fidelidade"
    } else {
        instalacao_status = "ERRO"
        instalacao_explicacao = "❌ Deveria ser R$ " + taxa_instalacao_esperada.toFixed(2) + " com desconto de R$ " + desconto_valor.toFixed(2)
    }
}
\`\`\`

### 📍 LOCAIS ESPECÍFICOS OBRIGATÓRIOS:

#### **1. Desconto da Fidelidade:**
```
SIM (X)
...desconto de R$ XXX,XX (valor por extenso)...
```

#### **2. Taxa de Instalação (SEÇÃO CORRETA):**
```
TAXA DA INSTALAÇÃO DA INFRAESTRUTURA DOS SERVIÇOS
VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: GRATUITA
```

#### **3. Taxa de Instalação (SEÇÃO ERRADA - IGNORAR):**
```
TAXA DE INSTALAÇÃO ( ) SIM ( X ) NÃO R$ 200,00  ← NUNCA EXTRAIR DAQUI!
```

### 🚫 LOCAIS PROIBIDOS PARA EXTRAÇÃO:

#### **NUNCA extrair de:**
- Tabelas gerais de valores
- Campos informativos
- Seções não relacionadas à fidelidade escolhida
- Qualquer lugar que não seja a seção específica da fidelidade

## FORMATO DE RESPOSTA OBRIGATÓRIO

**RETORNAR APENAS UM JSON VÁLIDO COM ESTA ESTRUTURA:**

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 800Mbps",
    "confianca": 95
  },
  "analise_fidelidade": {
    "opcao_fidelidade": "SIM",
    "valor_desconto_extraido": "R$ 700,00",
    "texto_origem": "desconto de R$ 700,00 (Setecentos Reais)",
    "marcacao_encontrada": "SIM (X)"
  },
  "validacao_taxas": {
    "fidelidade": "SIM",
    "valor_desconto_fidelidade": "R$ 700,00",
    "taxa_instalacao_encontrada": "R$ 0,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ GRATUITA extraída da seção correta da fidelidade",
    "taxa_rescisao_esperada": "R$ 700,00",
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Igual ao desconto aplicado"
  },
  "debug_extracao": {
    "local_instalacao": "SEÇÃO: VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE",
    "valor_bruto_encontrado": "GRATUITA",
    "valor_convertido": "R$ 0,00",
    "local_ignorado": "Tabela geral TAXA DE INSTALAÇÃO foi ignorada corretamente"
  },
  "erros": [],
  "resumo": {
    "total_erros": 0,
    "plano_identificado": "2024 Combo 800Mbps"
  },
  "status_geral": "aprovado",
  "observacoes": [
    "Extração realizada da seção correta da fidelidade",
    "Tabela geral de instalação foi ignorada conforme instruído",
    "Valor GRATUITA convertido corretamente para R$ 0,00"
  ]
}
\`\`\`

## 🚨 INSTRUÇÕES CRÍTICAS

1. **SEMPRE extrair da seção "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"**

2. **NUNCA extrair da tabela geral "TAXA DE INSTALAÇÃO ( ) SIM ( X ) NÃO"**

3. **CONVERTER "GRATUITA" = R$ 0,00**

4. **INCLUIR debug_extracao** para mostrar de onde veio cada valor

5. **LÓGICA FUNDAMENTAL:**
   - Taxa Instalação = R$ 700,00 - Desconto (da seção específica)
   - Taxa Rescisão = Desconto

**EXTRAIR SEMPRE DA SEÇÃO ESPECÍFICA DA FIDELIDADE, NUNCA DA TABELA GERAL!**

**Contrato para análise:**
${contractText}`;
};