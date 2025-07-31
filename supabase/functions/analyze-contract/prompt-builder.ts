export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - EXTRAÇÃO CORRETA DO TEXTO

## OBJETIVO
Analisar contratos OCR da CIABRASNET, identificar o modelo e validar taxas extraindo valores APENAS do texto descritivo da opção escolhida pelo cliente.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis (APENAS PARA IDENTIFICAÇÃO):
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## 🔥 ETAPA 2: EXTRAÇÃO CORRETA DOS VALORES DA FIDELIDADE

### 🚨 REGRA FUNDAMENTAL:

**Campos com valores fixos (como "R$ 700,00") são apenas EXPLICATIVOS/INFORMATIVOS!**

**Valores reais devem ser extraídos APENAS do TEXTO DESCRITIVO da opção escolhida.**

### 📍 Estrutura do Contrato:

```
DA OPÇÃO DE FIDELIDADE

SIM (X) ← Cliente escolheu esta opção
[TEXTO DESCRITIVO: "...desconto de R$ 580,00 (Quinhentos e Oitenta reais)..."]
[TEXTO DESCRITIVO: "...multa proporcional equivalente ao valor total..."]

NÃO (__)  ← Cliente NÃO escolheu (ignorar)
[TEXTO DESCRITIVO sobre R$ 700,00]

CAMPOS EXPLICATIVOS (IGNORAR SE SIM ESCOLHIDO):
- "VALOR TOTAL... NÃO OPTE PELA OPÇÃO DE FIDELIDADE: R$ 700,00"
```

### 🎯 ALGORITMO CORRETO DE EXTRAÇÃO:

\`\`\`javascript
// PASSO 1: Identificar escolha do cliente
if (texto.includes("SIM (X)")) {
    console.log("✅ Cliente escolheu fidelidade SIM")
    
    // PASSO 2: Extrair APENAS do texto descritivo da seção SIM
    secao_sim_texto = extrair_texto_entre_SIM_e_NAO()
    
    // PASSO 3: Procurar valores no TEXTO (não em campos fixos)
    // Exemplo: "desconto de R$ 580,00 (Quinhentos e Oitenta reais)"
    desconto_match = secao_sim_texto.match(/desconto de R\\$\\s*(\\d+,\\d+)/i)
    if (desconto_match) {
        valor_desconto = desconto_match[1] // "580,00"
    }
    
    // Ou procurar por extenso: "Quinhentos e Oitenta reais"
    if (secao_sim_texto.includes("Quinhentos e Oitenta")) {
        valor_desconto = "580,00"
    }
    
    // PASSO 4: Aplicar lógica correta
    taxa_instalacao_esperada = "QUALQUER_VALOR" // Sempre aceitar
    taxa_rescisao_esperada = valor_desconto      // Ex: "580,00"
    
    // 🚨 CRÍTICO: IGNORAR campos explicativos como "R$ 700,00"
    console.log("🚫 Ignorando campos explicativos - usando apenas texto da seção SIM")
    
} else if (texto.includes("NÃO (X)")) {
    console.log("✅ Cliente escolheu NÃO fidelidade")
    
    // Sem fidelidade - usar valores padrão
    taxa_instalacao_esperada = "700,00"
    taxa_rescisao_esperada = "700,00"
}

// PASSO 5: Extrair valores REAIS aplicados no contrato
// (não dos campos explicativos, mas dos campos de taxa efetivamente aplicada)
taxa_rescisao_real = extrair_taxa_rescisao_aplicada()
taxa_instalacao_real = extrair_taxa_instalacao_aplicada()

// PASSO 6: Comparar e validar
if (fidelidade === "SIM") {
    // Taxa instalação sempre OK
    taxa_instalacao_status = "CORRETO"
    
    // Taxa rescisão deve ser igual ao desconto
    if (taxa_rescisao_real === taxa_rescisao_esperada) {
        taxa_rescisao_status = "CORRETO"
    } else {
        taxa_rescisao_status = "ERRO"
        erro = {
            campo: "Taxa de Rescisão",
            valor_encontrado: taxa_rescisao_real,
            valor_esperado: taxa_rescisao_esperada,
            explicacao: "Com fidelidade SIM, taxa de rescisão deve ser igual ao desconto: " + taxa_rescisao_esperada
        }
    }
}
\`\`\`

### 🔍 INSTRUÇÕES ESPECÍFICAS DE EXTRAÇÃO:

#### **Para extrair o valor do desconto da fidelidade:**

1. **Localizar a seção SIM (X)**
2. **Ler o texto descritivo** (não campos fixos)
3. **Procurar padrões:**
   - "desconto de R$ XXX,XX"
   - "Quinhentos e Oitenta reais" = R$ 580,00
   - "Setecentos reais" = R$ 700,00
   - Qualquer valor por extenso

#### **Campos a IGNORAR quando SIM escolhido:**
- ❌ "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE NÃO OPTE PELA OPÇÃO DE FIDELIDADE: R$ 700,00"
- ❌ Qualquer campo com "NÃO OPTE" ou "CASO NÃO"
- ❌ Valores fixos/tabelados

#### **Campos a USAR:**
- ✅ Texto descritivo da seção marcada com (X)
- ✅ Valores mencionados por extenso
- ✅ Descrições de desconto/multa da opção escolhida

## ETAPA 3: VALIDAÇÃO FINAL

### 🎯 REGRAS CORRETAS:

**CLIENTE ESCOLHEU SIM (X):**
- Taxa de Instalação: QUALQUER VALOR = CORRETO
- Taxa de Rescisão: DEVE SER = Desconto extraído do texto da seção SIM
- Exemplo: Se texto diz "R$ 580,00", taxa rescisão deve ser R$ 580,00

**CLIENTE ESCOLHEU NÃO (X):**
- Taxa de Instalação: DEVE SER R$ 700,00
- Taxa de Rescisão: DEVE SER R$ 700,00

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
    "texto_secao_sim": "...desconto de R$ 580,00 (Quinhentos e Oitenta reais) da Taxa de Instalação...",
    "valor_desconto_extraido": "R$ 580,00",
    "metodo_extracao": "Texto descritivo da seção SIM escolhida",
    "campos_ignorados": ["VALOR TOTAL... NÃO OPTE: R$ 700,00 - campo explicativo ignorado"]
  },
  "validacao_taxas": {
    "fidelidade_escolhida": "SIM",
    "desconto_aplicado": "R$ 580,00",
    
    "taxa_instalacao": {
      "encontrada": "R$ 120,00",
      "esperada": "QUALQUER VALOR",
      "status": "CORRETO",
      "explicacao": "✅ Com fidelidade SIM, qualquer valor de instalação é aceito"
    },
    
    "taxa_rescisao": {
      "encontrada": "R$ 580,00",
      "esperada": "R$ 580,00", 
      "status": "CORRETO",
      "explicacao": "✅ Taxa rescisão igual ao desconto da fidelidade (extraído do texto da seção SIM)",
      "origem_valor": "Texto: 'desconto de R$ 580,00 (Quinhentos e Oitenta reais)'"
    }
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
      "status": "✅ CORRETO - Igual ao desconto extraído do texto da fidelidade"
    }
  ],
  "erros": [],
  "resumo": {
    "total_erros": 0,
    "fidelidade_escolhida": "SIM",
    "valor_desconto": "R$ 580,00",
    "metodo_extracao": "Texto descritivo da opção escolhida (ignorando campos explicativos)",
    "regra_aplicada": "Extrair valores apenas do texto da seção SIM, ignorar campos informativos"
  },
  "observacoes": [
    "✅ Cliente optou pela fidelidade SIM - extraindo valores do texto desta seção",
    "🚫 Campos explicativos (como R$ 700,00 para 'NÃO OPTE') foram ignorados",
    "📝 Taxa de rescisão baseada no desconto mencionado no texto: R$ 580,00",
    "⚖️ Validação feita apenas contra valores da opção efetivamente escolhida"
  ]
}
\`\`\`

## 🚨 REGRAS INQUEBRANTÁVEIS

1. **IDENTIFICAR** qual opção foi marcada: SIM (X) ou NÃO (X)

2. **EXTRAIR valores APENAS do TEXTO DESCRITIVO** da opção escolhida

3. **IGNORAR COMPLETAMENTE** campos explicativos/informativos

4. **SE SIM (X) escolhido:**
   - Ler texto da seção SIM
   - Extrair valor do desconto mencionado
   - Taxa Rescisão = Valor do desconto
   - Taxa Instalação = ACEITAR QUALQUER VALOR

5. **SE NÃO (X) escolhido:**
   - Taxa Instalação = R$ 700,00
   - Taxa Rescisão = R$ 700,00

6. **NUNCA usar campos com "NÃO OPTE" ou "CASO NÃO"** quando cliente escolheu SIM

**Os campos explicativos existem apenas para informação, os valores reais vêm do texto descritivo da opção escolhida!**

**Contrato para análise:**
${contractText}`;
};