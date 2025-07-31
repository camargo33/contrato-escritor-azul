export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - ESTRUTURA JSON CORRETA

## OBJETIVO
Analisar contratos OCR da CIABRASNET e gerar JSON na estrutura EXATA que o sistema espera.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis (APENAS PARA IDENTIFICAÇÃO):
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## 🔥 ETAPA 2: LÓGICA DA FIDELIDADE E EXTRAÇÃO DE VALORES

### **Regra Fundamental:**
- **Valor base instalação = R$ 700,00**
- **COM FIDELIDADE SIM (X):** Taxa Instalação = R$ 700,00 - Desconto | Taxa Rescisão = Desconto
- **SEM FIDELIDADE NÃO (X):** Taxa Instalação = R$ 700,00 | Taxa Rescisão = R$ 700,00

### **Extração de Valores:**

#### **1. Desconto da Fidelidade:**
Procurar na seção "SIM (X)": "desconto de R$ XXX,XX (valor por extenso)"

#### **2. Taxa de Instalação Aplicada:**
Procurar em: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
- Se encontrar "GRATUITA" = R$ 0,00
- Se encontrar valor específico = usar esse valor

#### **3. Taxa de Rescisão:**
Procurar valor aplicado no contrato (não usar campos explicativos)

### **Lógica de Validação:**
\`\`\`javascript
if (fidelidade === "SIM") {
    taxa_instalacao_esperada = 700.00 - desconto
    taxa_rescisao_esperada = desconto
    
    // Validar
    instalacao_ok = (taxa_instalacao_contrato === taxa_instalacao_esperada)
    rescisao_ok = (taxa_rescisao_contrato === taxa_rescisao_esperada)
}
\`\`\`

## 🚨 FORMATO DE RESPOSTA OBRIGATÓRIO

**RETORNAR APENAS UM JSON VÁLIDO COM ESTA ESTRUTURA EXATA:**

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
    "taxa_instalacao_explicacao": "✅ GRATUITA = R$ 0,00, correto com desconto total de R$ 700,00",
    "taxa_rescisao_esperada": "R$ 700,00",
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Igual ao desconto aplicado na instalação"
  },
  "erros": [],
  "alertas": [],
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
  "resumo": {
    "total_erros": 0,
    "total_alertas": 0,
    "plano_identificado": "2024 Combo 800Mbps"
  },
  "status_geral": "aprovado",
  "observacoes": [
    "Cliente optou pela fidelidade SIM com desconto total de R$ 700,00",
    "Taxa de instalação GRATUITA aplicada corretamente",
    "Taxa de rescisão igual ao desconto concedido"
  ]
}
\`\`\`

## 📋 CAMPOS OBRIGATÓRIOS DA ESTRUTURA

### **validacao_taxas (OBRIGATÓRIO):**
- \`fidelidade\`: "SIM" ou "NÃO"  
- \`valor_desconto_fidelidade\`: "R$ XXX,XX" (se aplicável)
- \`taxa_instalacao_encontrada\`: "R$ XXX,XX" (valor real do contrato)
- \`taxa_instalacao_status\`: "CORRETO" ou "ERRO"
- \`taxa_instalacao_explicacao\`: Explicação detalhada
- \`taxa_rescisao_esperada\`: "R$ XXX,XX" (valor que deveria ser)
- \`taxa_rescisao_encontrada\`: "R$ XXX,XX" (valor real do contrato)  
- \`taxa_rescisao_status\`: "CORRETO" ou "ERRO"
- \`taxa_rescisao_explicacao\`: Explicação detalhada

### **analise_fidelidade (OBRIGATÓRIO):**
- \`opcao_fidelidade\`: "SIM" ou "NÃO"
- \`valor_desconto_extraido\`: "R$ XXX,XX"
- \`texto_origem\`: Texto de onde foi extraído
- \`marcacao_encontrada\`: "SIM (X)" ou "NÃO (X)"

## 🎯 EXEMPLOS PRÁTICOS

### **Exemplo 1 - Desconto Total (GRATUITA):**
Cliente: SIM (X) | Desconto: R$ 700,00 | Instalação: GRATUITA

\`\`\`json
{
  "validacao_taxas": {
    "fidelidade": "SIM",
    "valor_desconto_fidelidade": "R$ 700,00",
    "taxa_instalacao_encontrada": "R$ 0,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ GRATUITA = R$ 0,00, correto com desconto total",
    "taxa_rescisao_esperada": "R$ 700,00",
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Igual ao desconto da fidelidade"
  }
}
\`\`\`

### **Exemplo 2 - Desconto Parcial:**
Cliente: SIM (X) | Desconto: R$ 580,00 | Instalação: R$ 120,00

\`\`\`json
{
  "validacao_taxas": {
    "fidelidade": "SIM", 
    "valor_desconto_fidelidade": "R$ 580,00",
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ R$ 120,00 correto (R$ 700,00 - R$ 580,00)",
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_encontrada": "R$ 580,00", 
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Igual ao desconto aplicado"
  }
}
\`\`\`

### **Exemplo 3 - Com Erro:**
Cliente: SIM (X) | Desconto: R$ 580,00 | Instalação: R$ 120,00 | Rescisão: R$ 700,00 (ERRO)

\`\`\`json
{
  "validacao_taxas": {
    "fidelidade": "SIM",
    "valor_desconto_fidelidade": "R$ 580,00", 
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ R$ 120,00 correto (R$ 700,00 - R$ 580,00)",
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "ERRO", 
    "taxa_rescisao_explicacao": "❌ Deveria ser R$ 580,00 (igual ao desconto)"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "sugestao_correcao": "Corrigir para R$ 580,00",
      "explicacao": "Com fidelidade, taxa de rescisão deve ser igual ao desconto aplicado",
      "severidade": "critico"
    }
  ],
  "resumo": {
    "total_erros": 1
  },
  "status_geral": "reprovado"
}
\`\`\`

## 🚨 INSTRUÇÕES CRÍTICAS

1. **SEMPRE incluir o campo \`validacao_taxas\`** - é obrigatório para exibir as informações
2. **USAR APENAS a estrutura JSON mostrada acima** - não inventar novos campos
3. **Preencher TODOS os campos obrigatórios** - não deixar nenhum vazio
4. **Status deve ser "CORRETO" ou "ERRO"** - sem outras variações
5. **Valores monetários sempre no formato "R$ XXX,XX"**
6. **Reconhecer "GRATUITA" como "R$ 0,00"**
7. **Não adicionar campos não especificados na estrutura**

**RETORNAR APENAS O JSON - SEM TEXTO ADICIONAL, SEM MARKDOWN, SEM EXPLICAÇÕES!**

**Contrato para análise:**
${contractText}`;
};