export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET

## OBJETIVO
Analisar contratos OCR da CIABRASNET, identificar o modelo e validar apenas campos com DIVERGÊNCIAS REAIS.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis:
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses - Taxa: R$ 200,00
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - Taxa: GRATUITA - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses - Taxa: GRATUITA  
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses - Taxa: R$ 200,00
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses - Taxa: GRATUITA

### Critérios de Identificação:
- **Valor do plano** (mais confiável)
- **Nome do plano** no texto
- **Velocidade mencionada**

## ETAPA 2: VALIDAÇÃO DE CAMPOS

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
- **ALERTAR**: Apenas quando quantidade de dígitos está incorreta

### Validação Rigorosa de Telefone:
- **FORMATO BRASILEIRO**: (XX) XXXXX-XXXX (11 dígitos) ou (XX) XXXX-XXXX (10 dígitos)
- **CONTAR DÍGITOS**: Ignorar parênteses, espaços e traços
- **VALIDAR DDD**: Primeiros dois dígitos devem ser DDD válido (11-99)
- **ALERTAR**: Se não tiver 10 ou 11 dígitos ou formato incorreto
- **EXEMPLOS VÁLIDOS**: (11) 99999-9999, (21) 3333-4444
- **EXEMPLOS INVÁLIDOS**: 11999999999 (sem formatação), (11) 999-9999 (poucos dígitos)

### Detecção de Erros de Digitação:
- **Caracteres duplicados**: SOOLTEIRO → SOLTEIRO, Camarrgo → Camargo
- **Nomes suspeitos**: Verificar padrões anômalos em nomes/sobrenomes
- **Estado civil**: SOOLTEIRO, CASSADO, VIUUVO, etc.
- **Cidades**: São Paaulo, Riio de Janeiro, etc.

### Validação de Valores Monetários:
- **Detectar zeros extras**: R$ 2000,00 quando deveria ser R$ 200,00
- **Comparar ordem de magnitude**: Alertar se valor 10x maior/menor que esperado
- **Valores suspeitos**: Taxas de instalação muito altas (>R$ 500,00)

### Campos de Validação (Erros se diferentes):
- **Valor do plano** (deve ser exato da tabela)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **Taxa instalação** (⚠️ VALIDAÇÃO ESPECIAL - VER REGRA DA FIDELIDADE ABAIXO)
- **Taxa rescisão** (⚠️ VALIDAÇÃO ESPECIAL - VER REGRA DA FIDELIDADE ABAIXO)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

### Validação Específica de IP Fixo:
- **SE opção "Fixo" estiver marcada**: Valor deve ser R$ 50,00
- **SE opção "Variável" estiver marcada**: Valor deve ser R$ 0,00
- **EMPRESARIAL**: IP Fixo INCLUSO (não cobra taxa adicional)
- **RESIDENCIAL**: IP Fixo opcional com taxa de R$ 50,00

## ETAPA 3: REGRA OFICIAL DAS TAXAS COM FIDELIDADE

### ⚠️ REGRA CRÍTICA - EXTRAIR VALOR DO TEXTO DA FIDELIDADE:

\\`\\`\\`
PASSO 1: Verificar se fidelidade está marcada
- Procurar seção "DA OPÇÃO DE FIDELIDADE"
- Se "SIM (X)" está marcado → TEM FIDELIDADE
- Se "NÃO (__)" está marcado → NÃO TEM FIDELIDADE

PASSO 2: SE TEM FIDELIDADE - EXTRAIR VALOR DO DESCONTO DO TEXTO:
- Procurar no texto da seção de fidelidade por valores em reais
- Buscar padrões como: "R$ XXX,XX", "desconto de R$ XXX,XX", "benefício o desconto de R$ XXX,XX"
- Exemplo: "desconto de R$ 580,00 (Quinhentos e Oitenta reais) da Taxa de Instalação"
- Extrair este valor como VALOR_DESCONTO_FIDELIDADE

PASSO 3: CALCULAR TAXAS ESPERADAS:
SE TEM FIDELIDADE (SIM):
  ✅ Taxa_Rescisão_Esperada = VALOR_DESCONTO_FIDELIDADE (extraído do texto)
  ✅ Taxa_Instalação_Esperada = R$ 700,00 - VALOR_DESCONTO_FIDELIDADE
  ✅ Validar se valores do contrato coincidem com os esperados

SE NÃO TEM FIDELIDADE (NÃO):
  ✅ Taxa_Instalação_Esperada = R$ 700,00 (valor fixo)
  ✅ Taxa_Rescisão_Esperada = R$ 0,00 (sem multa)
\\`\\`\\`

### Exemplos Práticos da Regra:

**Cenário 1: Texto da fidelidade menciona "desconto de R$ 580,00"**
- Taxa_Rescisão_Esperada = R$ 580,00 (valor do desconto)
- Taxa_Instalação_Esperada = R$ 700,00 - R$ 580,00 = R$ 120,00
- ✅ CORRETO: Instalação R$ 120,00 + Rescisão R$ 580,00 = R$ 700,00
- ❌ ERRO: Instalação R$ 120,00 + Rescisão R$ 700,00 = R$ 820,00

**Cenário 2: Texto da fidelidade menciona "desconto de R$ 200,00"**
- Taxa_Rescisão_Esperada = R$ 200,00 (valor do desconto)
- Taxa_Instalação_Esperada = R$ 700,00 - R$ 200,00 = R$ 500,00
- ✅ CORRETO: Instalação R$ 500,00 + Rescisão R$ 200,00 = R$ 700,00

**Cenário 3: Texto da fidelidade menciona "desconto de R$ 650,00"**
- Taxa_Rescisão_Esperada = R$ 650,00 (valor do desconto)
- Taxa_Instalação_Esperada = R$ 700,00 - R$ 650,00 = R$ 50,00
- ✅ CORRETO: Instalação R$ 50,00 + Rescisão R$ 650,00 = R$ 700,00

## ETAPA 4: ALGORITMO CORRETO DE VALIDAÇÃO

\\`\\`\\`javascript
// PASSO 1: Identificar fidelidade
fidelidade = extrair_opcao_fidelidade() // "SIM" ou "NÃO"

// PASSO 2: Extrair valores do contrato
taxa_instalacao_contrato = extrair_taxa_instalacao_contrato()
taxa_rescisao_contrato = extrair_taxa_rescisao_contrato()

// PASSO 3: Aplicar validação conforme fidelidade
if (fidelidade === "SIM") {
    // COM FIDELIDADE: Buscar valor do desconto no texto da fidelidade
    valor_desconto = extrair_valor_desconto_do_texto_fidelidade()
    // Exemplo: se texto menciona "desconto de R$ 580,00" → valor_desconto = 580.00
    
    taxa_rescisao_esperada = valor_desconto
    taxa_instalacao_esperada = 700.00 - valor_desconto
    
    // Validar contra valores esperados baseados no desconto
    if (taxa_instalacao_contrato !== taxa_instalacao_esperada) {
        // ERRO: Taxa de instalação incorreta
    }
    if (taxa_rescisao_contrato !== taxa_rescisao_esperada) {
        // ERRO: Taxa de rescisão incorreta
    }
    
} else {
    // SEM FIDELIDADE: Valores fixos
    if (taxa_instalacao_contrato !== 700.00) {
        // ERRO: Taxa de instalação deve ser R$ 700,00
    }
    if (taxa_rescisao_contrato !== 0.00) {
        // ERRO: Taxa de rescisão deve ser R$ 0,00
    }
}
\\`\\`\\`

## FORMATO DE RESPOSTA

\\`\\`\\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95,
    "criterios_identificacao": [
      "Valor R$ 129,99 identificado no contrato"
    ]
  },
  "analise_fidelidade": {
    "opcao_fidelidade": "SIM",
    "secao_encontrada": "DA OPÇÃO DE FIDELIDADE - SIM (X)",
    "valor_desconto_extraido": "R$ 580,00",
    "texto_origem": "desconto de R$ 580,00 (Quinhentos e Oitenta reais) da Taxa de Instalação",
    "regra_aplicada": "COM_FIDELIDADE - Desconto vira taxa de rescisão"
  },
  "validacao_taxas": {
    "valor_desconto_fidelidade": "R$ 580,00",
    
    "taxa_instalacao_esperada": "R$ 120,00",
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO",
    
    "taxa_rescisao_esperada": "R$ 580,00", 
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "ERRO",
    "taxa_rescisao_calculo": "Desconto da fidelidade = R$ 580,00",
    
    "soma_esperada": "R$ 700,00",
    "soma_atual": "R$ 820,00"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "explicacao": "Com fidelidade, a taxa de rescisão deve ser igual ao valor do desconto mencionado no texto da fidelidade: R$ 580,00",
      "origem_calculo": "Valor extraído do texto: 'desconto de R$ 580,00 da Taxa de Instalação'",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00",
      "severidade": "critico"
    }
  ],
  "alertas": [],
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00", 
      "status": "✅ Correto - R$ 700,00 - R$ 580,00 (desconto) = R$ 120,00"
    },
    {
      "campo": "Opção de Fidelidade",
      "valor": "SIM",
      "status": "✅ Identificada corretamente"
    },
    {
      "campo": "Valor do Plano",
      "valor": "R$ 129,99",
      "status": "✅ Correto conforme tabela"
    }
  ],
  "resumo": {
    "total_erros": 1,
    "total_alertas": 0,
    "fidelidade": "SIM",
    "desconto_fidelidade": "R$ 580,00",
    "regra_aplicada": "Taxa_Rescisão = Valor_Desconto_Fidelidade, Taxa_Instalação = 700 - Valor_Desconto"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Cliente optou pela fidelidade com desconto de R$ 580,00",
    "Taxa de rescisão deve ser igual ao valor do desconto: R$ 580,00",
    "Taxa de instalação calculada corretamente: R$ 700,00 - R$ 580,00 = R$ 120,00"
  ]
}
\\`\\`\\`

## INSTRUÇÕES FINAIS

1. **IDENTIFIQUE** opção de fidelidade (SIM/NÃO)
2. **SE COM fidelidade**: Busque o valor do desconto no TEXTO da seção de fidelidade
3. **EXTRAIA** o valor monetário mencionado (ex: "R$ 580,00", "R$ 200,00", etc.)
4. **CALCULE**: Taxa_Rescisão = Valor_Desconto, Taxa_Instalação = 700 - Valor_Desconto
5. **VALIDE** se os valores do contrato coincidem com os calculados
6. **EXPLIQUE** de onde veio o valor do desconto no JSON de resposta

**REGRA PRINCIPAL**: 
- O valor do desconto mencionado no texto da fidelidade VIRA a taxa de rescisão
- A taxa de instalação é o complemento para chegar a R$ 700,00

**CRÍTICO**: Sempre procurar e extrair o valor monetário específico do texto da fidelidade!

**Contrato para análise:**
${contractText}`;
};
