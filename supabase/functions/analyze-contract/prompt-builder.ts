export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET

## OBJETIVO
Analisar contratos OCR da CIABRASNET, identificar o modelo e validar apenas campos com DIVERGÊNCIAS REAIS.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis (APENAS PARA IDENTIFICAÇÃO - NÃO USAR PARA VALIDAR TAXAS!):
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## ETAPA 2: LÓGICA CRÍTICA DA FIDELIDADE

### 🚨 INSTRUÇÃO ABSOLUTAMENTE CRÍTICA:

**NUNCA extrair valor da seção que NÃO foi escolhida pelo cliente!**

#### Estrutura do Contrato:
```
DA OPÇÃO DE FIDELIDADE
SIM (X) ← Se marcado aqui
[texto explicando desconto de R$ XXX,XX]

NÃO (__) ← Se marcado aqui  
[texto mencionando R$ 700,00]
```

#### 🔥 REGRA OBRIGATÓRIA:

**SE CLIENTE MARCOU "SIM (X)":**
- ✅ Taxa de Rescisão = Valor do desconto mencionado na seção SIM
- ❌ IGNORAR COMPLETAMENTE qualquer valor da seção "NÃO (__)"
- ❌ NUNCA usar R$ 700,00 da seção "NÃO" 

**SE CLIENTE MARCOU "NÃO (X)":**
- ✅ Taxa de Rescisão = R$ 0,00 (sem multa rescisória)
- ❌ IGNORAR COMPLETAMENTE a seção "SIM (__)"

### 🎯 ALGORITMO CORRETO DE EXTRAÇÃO:

\`\`\`javascript
// PASSO 1: Identificar qual opção foi marcada
if (texto.includes("SIM (X)") || texto.includes("SIM(X)")) {
    fidelidade_escolhida = "SIM"
    
    // PASSO 2: Extrair APENAS da seção SIM
    secao_sim = extrair_texto_secao_sim()
    valor_desconto = extrair_valor_desconto(secao_sim)
    
    // PASSO 3: Calcular taxas corretas
    taxa_rescisao_esperada = valor_desconto // Ex: R$ 580,00
    taxa_instalacao_esperada = "QUALQUER VALOR" // Aceitar sempre
    
    // ⚠️ CRÍTICO: IGNORAR seção "NÃO (__)" completamente!
    
} else if (texto.includes("NÃO (X)") || texto.includes("NÃO(X)")) {
    fidelidade_escolhida = "NÃO"
    
    // PASSO 2: Aplicar regra sem fidelidade
    taxa_rescisao_esperada = 0.00 // Sem multa
    taxa_instalacao_esperada = 700.00 // Valor cheio
    
    // ⚠️ CRÍTICO: IGNORAR seção "SIM (__)" completamente!
}

// PASSO 4: Validar contra valores encontrados no contrato
taxa_rescisao_contrato = extrair_valor_real_aplicado_no_contrato()

if (fidelidade_escolhida === "SIM") {
    if (taxa_rescisao_contrato !== taxa_rescisao_esperada) {
        erro = {
            "campo": "Taxa de Rescisão",
            "valor_encontrado": taxa_rescisao_contrato,
            "valor_esperado": taxa_rescisao_esperada,
            "explicacao": "Com fidelidade SIM, taxa de rescisão deve ser " + valor_desconto
        }
    }
}
\`\`\`

### 📍 IDENTIFICAÇÃO PRECISA DAS SEÇÕES:

**Para encontrar a opção escolhida:**
- Procurar: "SIM (X)" ou "SIM(X)" = Fidelidade escolhida
- Procurar: "NÃO (X)" ou "NÃO(X)" = Sem fidelidade escolhida
- Procurar: "SIM (__)" ou "SIM(__)" = Fidelidade NÃO escolhida
- Procurar: "NÃO (__)" ou "NÃO(__)" = Sem fidelidade NÃO escolhida

**REGRA DE OURO:**
- ✅ Usar APENAS informações da seção marcada com (X)
- ❌ IGNORAR TOTALMENTE a seção marcada com (__)

## ETAPA 3: VALIDAÇÃO DE OUTROS CAMPOS

### Campos de Validação de Formato:
- CPF/CNPJ (validação rigorosa de dígitos)
- Email (verificar erros de digitação)  
- Telefone (formato brasileiro obrigatório)

### Campos de Validação (Erros se diferentes):
- **Valor do plano** (deve ser exato da tabela)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

## ETAPA 4: CÁLCULO FINAL DAS TAXAS

### 🎯 REGRAS FINAIS:

**CLIENTE ESCOLHEU FIDELIDADE SIM:**
- Taxa de Instalação: QUALQUER VALOR é correto
- Taxa de Rescisão: DEVE SER igual ao desconto da fidelidade
- Ignorar valores da seção "NÃO (__)"

**CLIENTE ESCOLHEU FIDELIDADE NÃO:**
- Taxa de Instalação: DEVE SER R$ 700,00
- Taxa de Rescisão: DEVE SER R$ 0,00
- Ignorar valores da seção "SIM (__)"

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
    "secao_ignorada": "NÃO (__) - valores ignorados conforme escolha do cliente",
    "valor_desconto_extraido": "R$ 580,00",
    "texto_origem": "desconto de R$ 580,00 (Quinhentos e Oitenta reais) da Taxa de Instalação"
  },
  "validacao_taxas": {
    "opcao_fidelidade": "SIM",
    "valor_desconto": "R$ 580,00",
    
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ Com fidelidade SIM, qualquer valor de instalação é aceito",
    
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_encontrada": "R$ 0,00",
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Com fidelidade SIM, taxa de rescisão = valor do desconto"
  },
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00",
      "status": "✅ CORRETO - Com fidelidade, qualquer valor é aceito"
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
    "desconto_aplicado": "R$ 580,00",
    "regra_aplicada": "Ignorar seção NÃO, usar apenas informações da seção SIM escolhida"
  },
  "observacoes": [
    "Cliente optou pela fidelidade SIM - usando apenas informações dessa seção",
    "Valores da seção NÃO (__) foram ignorados conforme escolha do cliente",
    "Taxa de rescisão calculada baseada no desconto da fidelidade"
  ]
}
\`\`\`

## 🚨 REGRAS INQUEBRANTÁVEIS

1. **IDENTIFICAR** qual opção foi marcada: SIM (X) ou NÃO (X)

2. **USAR APENAS** informações da seção escolhida pelo cliente

3. **IGNORAR COMPLETAMENTE** a seção não escolhida

4. **SE SIM (X):**
   - Taxa Instalação = ACEITAR QUALQUER VALOR
   - Taxa Rescisão = VALOR DO DESCONTO DA FIDELIDADE

5. **SE NÃO (X):**
   - Taxa Instalação = R$ 700,00
   - Taxa Rescisão = R$ 0,00

6. **NUNCA** usar R$ 700,00 da seção "NÃO" quando cliente escolheu "SIM"

**A seção não marcada existe apenas para informação, NÃO deve ser usada para validação!**

**Contrato para análise:**
${contractText}`;
};