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
- **Taxa instalação** (depende da opção de fidelidade - ver regra abaixo)
- **Taxa rescisão** (depende da opção de fidelidade - ver regra abaixo)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

### Validação Específica de IP Fixo:
- **SE opção "Fixo" estiver marcada**: Valor deve ser R$ 50,00
- **SE opção "Variável" estiver marcada**: Valor deve ser R$ 0,00
- **EMPRESARIAL**: IP Fixo INCLUSO (não cobra taxa adicional)
- **RESIDENCIAL**: IP Fixo opcional com taxa de R$ 50,00

## ETAPA 3: REGRA DA FIDELIDADE E TAXAS

### ⚠️ REGRA OFICIAL DA FIDELIDADE:

\\`\\`\\`
PASSO 1: Verificar opção de fidelidade no contrato
- Procurar seção "DA OPÇÃO DE FIDELIDADE"
- Se "SIM (X)" está marcado → TEM FIDELIDADE
- Se "NÃO (__)" está marcado → NÃO TEM FIDELIDADE

PASSO 2: Encontrar valores das taxas conforme fidelidade

SE TEM FIDELIDADE (SIM):
  - Procurar: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
  - Taxa_Instalação = [valor encontrado nesta linha] (ex: R$ 120,00)
  - Taxa_Rescisão = R$ 700,00 - Taxa_Instalação (ex: 700 - 120 = R$ 580,00)
  - O desconto na instalação vira multa de rescisão

SE NÃO TEM FIDELIDADE (NÃO):
  - Procurar: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE NÃO OPTE PELA OPÇÃO DE FIDELIDADE"  
  - Taxa_Instalação = R$ 700,00 (valor cheio)
  - Taxa_Rescisão = R$ 0,00 (sem multa)

PASSO 3: Validar valores encontrados no contrato
- Comparar Taxa_Instalação_Contrato com Taxa_Instalação_Esperada
- Comparar Taxa_Rescisão_Contrato com Taxa_Rescisão_Esperada
\\`\\`\\`

### Exemplos da Regra:
- **COM Fidelidade + Taxa Instalação R$ 120,00** → Rescisão = R$ 580,00 ✅
- **COM Fidelidade + Taxa Instalação R$ 200,00** → Rescisão = R$ 500,00 ✅
- **COM Fidelidade + Taxa Instalação R$ 0,00** → Rescisão = R$ 700,00 ✅
- **SEM Fidelidade** → Instalação = R$ 700,00, Rescisão = R$ 0,00 ✅

### ⚠️ REGRA FUNDAMENTAL:
```
COM Fidelidade: Taxa_Instalação + Taxa_Rescisão = R$ 700,00
SEM Fidelidade: Taxa_Instalação = R$ 700,00, Taxa_Rescisão = R$ 0,00
```

## ETAPA 4: ALGORITMO DE VALIDAÇÃO

\\`\\`\\`javascript
// PASSO 1: Identificar fidelidade
fidelidade = extrair_opcao_fidelidade() // "SIM" ou "NÃO"

// PASSO 2: Definir valores esperados
if (fidelidade === "SIM") {
    taxa_instalacao_esperada = extrair_valor_com_fidelidade()
    taxa_rescisao_esperada = 700 - taxa_instalacao_esperada
} else {
    taxa_instalacao_esperada = 700.00
    taxa_rescisao_esperada = 0.00
}

// PASSO 3: Extrair valores do contrato
taxa_instalacao_contrato = extrair_taxa_instalacao_contrato()
taxa_rescisao_contrato = extrair_taxa_rescisao_contrato()

// PASSO 4: Validar
if (taxa_instalacao_contrato !== taxa_instalacao_esperada) {
    // ERRO na taxa de instalação
}
if (taxa_rescisao_contrato !== taxa_rescisao_esperada) {
    // ERRO na taxa de rescisão  
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
    "taxa_instalacao_com_fidelidade": "R$ 120,00",
    "taxa_instalacao_sem_fidelidade": "R$ 700,00",
    "desconto_aplicado": "R$ 580,00",
    "regra_aplicada": "COM_FIDELIDADE"
  },
  "validacao_taxas": {
    "taxa_instalacao_esperada": "R$ 120,00",
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO",
    
    "taxa_rescisao_esperada": "R$ 580,00", 
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "ERRO",
    "taxa_rescisao_calculo": "700 - 120 = 580",
    
    "soma_esperada": "R$ 700,00",
    "soma_atual": "R$ 820,00"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "explicacao": "Com fidelidade, a taxa de rescisão deve ser: R$ 700,00 - Taxa_Instalação (R$ 120,00) = R$ 580,00. O desconto na instalação vira multa de rescisão.",
      "secao_origem": "Seção das taxas de rescisão",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00",
      "severidade": "critico"
    }
  ],
  "alertas": [],
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00", 
      "status": "✅ Correto - valor com fidelidade aplicada"
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
    "regra_aplicada": "Taxa_Instalação + Taxa_Rescisão = R$ 700,00"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Cliente optou pela fidelidade, então recebe desconto na instalação",
    "O desconto de R$ 580,00 na instalação vira multa de rescisão",
    "Taxa de rescisão deve ser R$ 580,00, não R$ 700,00"
  ]
}
\\`\\`\\`

## INSTRUÇÕES FINAIS

1. **IDENTIFIQUE** opção de fidelidade (SIM/NÃO)
2. **LOCALIZE** valores específicos nas seções corretas do contrato
3. **APLIQUE** regra da fidelidade para calcular valores esperados
4. **COMPARE** valores esperados vs encontrados
5. **EXPLIQUE** claramente a lógica da fidelidade
6. **DESTAQUE** que desconto na instalação vira multa de rescisão

**REGRA CHAVE**: Fidelidade muda a distribuição dos R$ 700,00 entre instalação e rescisão!

**Contrato para análise:**
${contractText}`;
};
