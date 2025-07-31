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

## ETAPA 3: REGRA ESPECIAL DAS TAXAS COM FIDELIDADE

### ⚠️ IMPORTANTE: NÃO VALIDAR TAXAS CONTRA TABELA!

**A tabela de modelos serve APENAS para:**
- Identificar o plano pelo valor
- Validar prazo de vigência
- Validar tipo (residencial/corporativo)

**A tabela NÃO serve para validar taxas de instalação/rescisão!**

### ⚠️ REGRA OFICIAL DAS TAXAS:

\\`\\`\\`
PASSO 1: Verificar opção de fidelidade no contrato
- Procurar seção "DA OPÇÃO DE FIDELIDADE"
- Se "SIM (X)" está marcado → TEM FIDELIDADE
- Se "NÃO (__)" está marcado → NÃO TEM FIDELIDADE

PASSO 2: Aplicar regra das taxas conforme fidelidade

SE TEM FIDELIDADE (SIM):
  ✅ Taxa_Instalação = QUALQUER VALOR (aceitar o que estiver no contrato)
  ✅ Taxa_Rescisão = R$ 700,00 - Taxa_Instalação
  ✅ Validar APENAS se: Taxa_Instalação + Taxa_Rescisão = R$ 700,00

SE NÃO TEM FIDELIDADE (NÃO):
  ✅ Taxa_Instalação = R$ 700,00 (valor fixo)
  ✅ Taxa_Rescisão = R$ 0,00 (sem multa)

REGRA CRÍTICA:
- COM fidelidade: NÃO comparar taxa de instalação com tabela
- COM fidelidade: Aceitar qualquer valor de instalação se soma = R$ 700,00
- SEM fidelidade: Taxa instalação deve ser R$ 700,00
\\`\\`\\`

### Exemplos da Regra Correta:
- **COM Fidelidade + Taxa Instalação R$ 120,00 + Taxa Rescisão R$ 580,00** ✅ CORRETO (soma = 700)
- **COM Fidelidade + Taxa Instalação R$ 200,00 + Taxa Rescisão R$ 500,00** ✅ CORRETO (soma = 700)
- **COM Fidelidade + Taxa Instalação R$ 50,00 + Taxa Rescisão R$ 650,00** ✅ CORRETO (soma = 700)
- **COM Fidelidade + Taxa Instalação R$ 120,00 + Taxa Rescisão R$ 700,00** ❌ ERRO (soma = 820)
- **SEM Fidelidade + Taxa Instalação R$ 700,00 + Taxa Rescisão R$ 0,00** ✅ CORRETO

## ETAPA 4: ALGORITMO CORRETO DE VALIDAÇÃO

\\`\\`\\`javascript
// PASSO 1: Identificar fidelidade
fidelidade = extrair_opcao_fidelidade() // "SIM" ou "NÃO"

// PASSO 2: Extrair valores do contrato
taxa_instalacao_contrato = extrair_taxa_instalacao_contrato()
taxa_rescisao_contrato = extrair_taxa_rescisao_contrato()

// PASSO 3: Aplicar validação conforme fidelidade
if (fidelidade === "SIM") {
    // COM FIDELIDADE: Aceitar qualquer valor de instalação
    // Validar apenas se a soma é R$ 700,00
    soma_atual = taxa_instalacao_contrato + taxa_rescisao_contrato
    taxa_rescisao_esperada = 700 - taxa_instalacao_contrato
    
    if (taxa_rescisao_contrato !== taxa_rescisao_esperada) {
        // ERRO: Taxa de rescisão incorreta
        // NÃO reportar erro na taxa de instalação
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

// ⚠️ NUNCA validar taxa de instalação contra tabela de modelos!
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
    "regra_aplicada": "COM_FIDELIDADE - Taxa instalação pode ser qualquer valor"
  },
  "validacao_taxas": {
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO - Valor aceito com fidelidade",
    
    "taxa_rescisao_encontrada": "R$ 700,00", 
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_status": "ERRO",
    "taxa_rescisao_calculo": "700 - 120 = 580",
    
    "soma_atual": "R$ 820,00",
    "soma_esperada": "R$ 700,00"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "explicacao": "Com fidelidade, taxa de rescisão = R$ 700,00 - Taxa_Instalação (R$ 120,00) = R$ 580,00",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00",
      "severidade": "critico"
    }
  ],
  "alertas": [],
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00", 
      "status": "✅ Correto - Valor aceito com fidelidade aplicada"
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
    "taxa_instalacao_aceita": "R$ 120,00",
    "regra_aplicada": "COM fidelidade: aceitar qualquer valor de instalação se soma = R$ 700,00"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Cliente optou pela fidelidade, taxa de instalação R$ 120,00 está correta",
    "Apenas a taxa de rescisão está incorreta: deve ser R$ 580,00",
    "NÃO comparar taxa de instalação com valores da tabela quando há fidelidade"
  ]
}
\\`\\`\\`

## INSTRUÇÕES FINAIS

1. **IDENTIFIQUE** opção de fidelidade (SIM/NÃO)
2. **SE COM fidelidade**: Aceite QUALQUER valor de instalação
3. **SE COM fidelidade**: Valide apenas se Taxa_Rescisão = 700 - Taxa_Instalação
4. **SE SEM fidelidade**: Taxa_Instalação = R$ 700,00, Taxa_Rescisão = R$ 0,00
5. **NUNCA** compare taxa de instalação com valores da tabela de modelos
6. **EXPLIQUE** que com fidelidade o valor de instalação pode variar

**REGRA PRINCIPAL**: 
- COM fidelidade: Taxa_Instalação (qualquer valor) + Taxa_Rescisão = R$ 700,00
- SEM fidelidade: Taxa_Instalação = R$ 700,00, Taxa_Rescisão = R$ 0,00

**Contrato para análise:**
${contractText}`;
};
