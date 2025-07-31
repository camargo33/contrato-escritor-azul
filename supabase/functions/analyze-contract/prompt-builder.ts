export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - LÓGICA CORRETA DE FIDELIDADE

## OBJETIVO
Analisar contratos OCR da CIABRASNET, identificar o modelo e validar taxas com base na lógica real de descontos de fidelidade.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis (APENAS PARA IDENTIFICAÇÃO):
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## 🔥 ETAPA 2: LÓGICA REAL DA FIDELIDADE

### 🚨 REGRA FUNDAMENTAL - BASEADA EM CONTRATOS REAIS:

**Valor base da Taxa de Instalação: R$ 700,00**

#### **CLIENTE ESCOLHEU FIDELIDADE SIM (X):**
1. **Extrair o valor do desconto** mencionado no texto da seção SIM
2. **Taxa de Instalação = R$ 700,00 - Desconto**
3. **Taxa de Rescisão = Valor do desconto**

**Exemplos reais:**
- Desconto R$ 700,00 → Instalação: GRATUITA (R$ 0,00) | Rescisão: R$ 700,00
- Desconto R$ 580,00 → Instalação: R$ 120,00 | Rescisão: R$ 580,00
- Desconto R$ 600,00 → Instalação: R$ 100,00 | Rescisão: R$ 600,00

#### **CLIENTE ESCOLHEU FIDELIDADE NÃO (X):**
- **Taxa de Instalação = R$ 700,00** (valor integral)
- **Taxa de Rescisão = R$ 700,00** (valor padrão)

### 🎯 ALGORITMO CORRETO:

\`\`\`javascript
// PASSO 1: Identificar escolha do cliente
if (texto.includes("SIM (X)")) {
    fidelidade_escolhida = "SIM"
    
    // PASSO 2: Extrair desconto do texto da seção SIM
    secao_sim = extrair_texto_secao_sim_marcada()
    
    // Procurar padrões de desconto:
    // "desconto de R$ 700,00 (Setecentos Reais)"
    // "desconto de R$ 580,00 (Quinhentos e Oitenta reais)"
    
    desconto_valor = extrair_valor_desconto(secao_sim)
    
    // PASSO 3: Calcular taxas corretas
    taxa_instalacao_esperada = 700.00 - desconto_valor
    taxa_rescisao_esperada = desconto_valor
    
    console.log("✅ Fidelidade SIM:")
    console.log("Desconto:", desconto_valor)
    console.log("Taxa Instalação esperada:", taxa_instalacao_esperada) 
    console.log("Taxa Rescisão esperada:", taxa_rescisao_esperada)
    
} else if (texto.includes("NÃO (X)")) {
    fidelidade_escolhida = "NÃO"
    
    // Sem fidelidade - valores integrais
    taxa_instalacao_esperada = 700.00
    taxa_rescisao_esperada = 700.00
    
    console.log("✅ Sem fidelidade - valores integrais")
}

// PASSO 4: Comparar com valores reais do contrato
taxa_instalacao_contrato = extrair_taxa_instalacao_aplicada()
taxa_rescisao_contrato = extrair_taxa_rescisao_aplicada()

// PASSO 5: Validar
if (fidelidade_escolhida === "SIM") {
    // Validar instalação
    if (taxa_instalacao_contrato === taxa_instalacao_esperada) {
        instalacao_status = "CORRETO"
    } else {
        instalacao_status = "ERRO"
        erro_instalacao = {
            campo: "Taxa de Instalação",
            valor_encontrado: taxa_instalacao_contrato,
            valor_esperado: taxa_instalacao_esperada,
            calculo: "R$ 700,00 - " + desconto_valor + " = " + taxa_instalacao_esperada
        }
    }
    
    // Validar rescisão
    if (taxa_rescisao_contrato === taxa_rescisao_esperada) {
        rescisao_status = "CORRETO"
    } else {
        rescisao_status = "ERRO"
        erro_rescisao = {
            campo: "Taxa de Rescisão",
            valor_encontrado: taxa_rescisao_contrato,
            valor_esperado: taxa_rescisao_esperada,
            explicacao: "Taxa de rescisão deve ser igual ao desconto: " + desconto_valor
        }
    }
}
\`\`\`

### 🔍 EXTRAÇÃO DO DESCONTO:

#### **Padrões para encontrar o desconto:**
- "desconto de R$ XXX,XX"
- "R$ XXX,XX (valor por extenso)"
- "Setecentos Reais" = R$ 700,00
- "Quinhentos e Oitenta reais" = R$ 580,00
- "Seiscentos reais" = R$ 600,00

#### **Local correto:**
- Extrair APENAS do texto da seção "SIM (X)"
- **IGNORAR** campos explicativos
- **IGNORAR** seção "NÃO (__)"

## ETAPA 3: VALIDAÇÃO DE OUTROS CAMPOS

### Campos de Validação:
- **Valor do plano** (deve ser exato da tabela)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)  
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)
- **CPF/CNPJ** (validação de dígitos)
- **Email** (verificar erros de digitação)
- **Telefone** (formato brasileiro)

## FORMATO DE RESPOSTA

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95
  },
  "analise_fidelidade": {
    "opcao_escolhida": "SIM",
    "marcacao_encontrada": "SIM (X)",
    "texto_desconto": "desconto de R$ 580,00 (Quinhentos e Oitenta reais)",
    "valor_desconto": "R$ 580,00",
    "calculo_instalacao": "R$ 700,00 - R$ 580,00 = R$ 120,00",
    "logica_rescisao": "Taxa rescisão = desconto aplicado"
  },
  "validacao_taxas": {
    "valor_base_instalacao": "R$ 700,00",
    "desconto_aplicado": "R$ 580,00",
    
    "taxa_instalacao": {
      "encontrada": "R$ 120,00",
      "esperada": "R$ 120,00",
      "calculo": "R$ 700,00 - R$ 580,00 = R$ 120,00",
      "status": "CORRETO",
      "explicacao": "✅ Valor correto baseado no desconto de fidelidade"
    },
    
    "taxa_rescisao": {
      "encontrada": "R$ 580,00",
      "esperada": "R$ 580,00",
      "logica": "Taxa rescisão = desconto da fidelidade",
      "status": "CORRETO", 
      "explicacao": "✅ Igual ao desconto aplicado na instalação"
    }
  },
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00",
      "status": "✅ CORRETO - Cálculo: R$ 700,00 - R$ 580,00"
    },
    {
      "campo": "Taxa de Rescisão",
      "valor": "R$ 580,00", 
      "status": "✅ CORRETO - Igual ao desconto da fidelidade"
    }
  ],
  "erros": [],
  "resumo": {
    "total_erros": 0,
    "fidelidade_escolhida": "SIM",
    "desconto_concedido": "R$ 580,00",
    "instalacao_final": "R$ 120,00",
    "rescisao_devida": "R$ 580,00",
    "logica_aplicada": "Taxa rescisão = desconto da instalação"
  },
  "observacoes": [
    "✅ Cliente optou pela fidelidade e recebeu desconto de R$ 580,00",
    "🧮 Taxa instalação calculada: R$ 700,00 - R$ 580,00 = R$ 120,00", 
    "⚖️ Taxa rescisão igual ao desconto (lógica: deve devolver o desconto se cancelar)",
    "📋 Validação baseada em contratos reais da CIABRASNET"
  ]
}
\`\`\`

## 🚨 REGRAS INQUEBRANTÁVEIS

1. **Valor base instalação = R$ 700,00** (sempre)

2. **COM FIDELIDADE SIM (X):**
   - Taxa Instalação = R$ 700,00 - Desconto
   - Taxa Rescisão = Desconto
   - Extrair desconto do texto da seção SIM

3. **SEM FIDELIDADE NÃO (X):**
   - Taxa Instalação = R$ 700,00
   - Taxa Rescisão = R$ 700,00

4. **LÓGICA FUNDAMENTAL:**
   **Taxa de Rescisão = Desconto aplicado na instalação**
   
5. **NUNCA usar campos explicativos** - extrair apenas do texto descritivo

**A taxa de rescisão é o valor que o cliente deve devolver se cancelar antes do prazo, ou seja, o desconto que ele recebeu!**

**Contrato para análise:**
${contractText}`;
};