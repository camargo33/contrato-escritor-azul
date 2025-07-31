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

## ETAPA 2: EXTRAÇÃO PRECISA DE VALORES

### 🎯 INSTRUÇÕES PARA EXTRAIR VALORES CORRETAMENTE:

**1. TAXA DE INSTALAÇÃO:**
- Procurar seção: "TAXA DE INSTALAÇÃO"
- Extrair o valor que aparece no campo específico de taxa

**2. TAXA DE RESCISÃO:**
- Procurar seção sobre rescisão/fidelidade
- Extrair o valor monetário mencionado como taxa/multa de rescisão

**3. VALOR DO DESCONTO DA FIDELIDADE:**
- Procurar seção: "DA OPÇÃO DE FIDELIDADE"
- Buscar texto: "desconto de R$ XXX,XX"
- Este valor será usado para calcular a taxa de rescisão esperada

## ETAPA 3: VALIDAÇÃO DE CAMPOS

### Campos de Validação de Formato:
- CPF/CNPJ (validação rigorosa de dígitos)
- Email (verificar erros de digitação)
- Telefone (formato brasileiro obrigatório)

### Validação Rigorosa de CPF/CNPJ:
- **DETECÇÃO AUTOMÁTICA**: Contar apenas dígitos (ignorar pontos/traços)
- **CPF**: Se tem EXATAMENTE 11 dígitos → é CPF válido
- **CNPJ**: Se tem EXATAMENTE 14 dígitos → é CNPJ válido  
- **FORMATO INVÁLIDO**: Qualquer outra quantidade de dígitos
- **VALIDAÇÃO CRUZADA**: PF deve ter CPF (11), PJ deve ter CNPJ (14)

### Validação Rigorosa de Telefone:
- **FORMATO BRASILEIRO**: (XX) XXXXX-XXXX (11 dígitos) ou (XX) XXXX-XXXX (10 dígitos)
- **CONTAR DÍGITOS**: Ignorar parênteses, espaços e traços
- **VALIDAR DDD**: Primeiros dois dígitos devem ser DDD válido (11-99)

### Detecção de Erros de Digitação:
- **Caracteres duplicados**: SOOLTEIRO → SOLTEIRO, Camarrgo → Camargo
- **Nomes suspeitos**: Verificar padrões anômalos em nomes/sobrenomes
- **Estado civil**: SOOLTEIRO, CASSADO, VIUUVO, etc.

### Campos de Validação (Erros se diferentes):
- **Valor do plano** (deve ser exato da tabela acima)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

### Validação Específica de IP Fixo:
- **SE opção "Fixo" estiver marcada**: Valor deve ser R$ 50,00
- **SE opção "Variável" estiver marcada**: Valor deve ser R$ 0,00
- **EMPRESARIAL**: IP Fixo INCLUSO (não cobra taxa adicional)
- **RESIDENCIAL**: IP Fixo opcional com taxa de R$ 50,00

## ETAPA 4: REGRA ÚNICA DAS TAXAS

### 🚨 INSTRUÇÃO CRÍTICA:

**QUANDO HÁ FIDELIDADE (SIM):**
- ✅ Taxa de Instalação = QUALQUER VALOR é CORRETO (aceitar sempre)
- ✅ Taxa de Rescisão = Deve ser igual ao valor do desconto extraído da seção de fidelidade
- ❌ NUNCA comparar instalação com qualquer valor da tabela

**QUANDO NÃO HÁ FIDELIDADE (NÃO):**
- ✅ Taxa de Instalação = R$ 700,00 (valor fixo sem desconto)
- ✅ Taxa de Rescisão = R$ 0,00 (sem multa)

### 🔄 ALGORITMO DE VALIDAÇÃO:

\`\`\`javascript
// PASSO 1: Verificar fidelidade
fidelidade = extrair_opcao_fidelidade() // "SIM" ou "NÃO"

// PASSO 2: Extrair valores do contrato
taxa_instalacao_contrato = extrair_taxa_instalacao()
taxa_rescisao_contrato = extrair_taxa_rescisao()

// PASSO 3: Aplicar validação conforme fidelidade
if (fidelidade === "SIM") {
    // COM FIDELIDADE
    valor_desconto = extrair_valor_desconto_do_texto_fidelidade()
    taxa_rescisao_esperada = valor_desconto
    
    // Taxa de instalação = SEMPRE CORRETO
    taxa_instalacao_status = "CORRETO"
    
    // Taxa de rescisão = Comparar com valor do desconto
    if (taxa_rescisao_contrato === taxa_rescisao_esperada) {
        taxa_rescisao_status = "CORRETO"
    } else {
        taxa_rescisao_status = "ERRO"
        adicionar_erro("Taxa de Rescisão", taxa_rescisao_contrato, taxa_rescisao_esperada)
    }
} else {
    // SEM FIDELIDADE
    if (taxa_instalacao_contrato !== 700.00) {
        adicionar_erro("Taxa de Instalação", taxa_instalacao_contrato, "R$ 700,00")
    }
    if (taxa_rescisao_contrato !== 0.00) {
        adicionar_erro("Taxa de Rescisão", taxa_rescisao_contrato, "R$ 0,00")
    }
}
\`\`\`

## FORMATO DE RESPOSTA

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95,
    "criterios_identificacao": ["Valor R$ 129,99 identificado no contrato"]
  },
  "analise_fidelidade": {
    "opcao_fidelidade": "SIM",
    "valor_desconto_extraido": "R$ 580,00",
    "texto_origem": "desconto de R$ 580,00 (Quinhentos e Oitenta reais) da Taxa de Instalação",
    "regra_aplicada": "COM_FIDELIDADE - Qualquer taxa de instalação é aceita"
  },
  "validacao_taxas": {
    "fidelidade": "SIM",
    "valor_desconto_fidelidade": "R$ 580,00",
    
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ Com fidelidade, qualquer valor de instalação é aceito",
    
    "taxa_rescisao_esperada": "R$ 580,00", 
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "ERRO",
    "taxa_rescisao_explicacao": "❌ Deveria ser igual ao desconto da fidelidade: R$ 580,00"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "explicacao": "Com fidelidade, a taxa de rescisão deve ser igual ao valor do desconto mencionado na seção de fidelidade",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00",
      "severidade": "critico"
    }
  ],
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00", 
      "status": "✅ CORRETO - Com fidelidade, qualquer valor de instalação é aceito"
    },
    {
      "campo": "Opção de Fidelidade",
      "valor": "SIM",
      "status": "✅ Identificada corretamente"
    }
  ],
  "resumo": {
    "total_erros": 1,
    "total_alertas": 0,
    "fidelidade": "SIM",
    "desconto_fidelidade": "R$ 580,00",
    "regra_aplicada": "Taxa_Rescisão = Valor_Desconto_Fidelidade"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Cliente optou pela fidelidade com desconto de R$ 580,00",
    "Taxa de rescisão deve ser igual ao valor do desconto: R$ 580,00",
    "Taxa de instalação calculada corretamente com desconto aplicado"
  ]
}
\`\`\`

## 🚨 REGRAS FINAIS INQUEBRANTÁVEIS

1. **COM FIDELIDADE (SIM):**
   - Taxa de Instalação = SEMPRE CORRETO (qualquer valor)
   - Taxa de Rescisão = Valor do desconto da fidelidade

2. **SEM FIDELIDADE (NÃO):**
   - Taxa de Instalação = R$ 700,00
   - Taxa de Rescisão = R$ 0,00

3. **NUNCA validar taxa de instalação contra valores da tabela quando há fidelidade**

4. **O valor do desconto mencionado no texto da fidelidade VIRA a taxa de rescisão esperada**

**Contrato para análise:**
${contractText}`;
};