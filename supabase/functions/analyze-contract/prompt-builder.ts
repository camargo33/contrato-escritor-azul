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
- **Taxa instalação** (pode ser qualquer valor, mas deve somar com rescisão = R$ 700,00)
- **Taxa rescisão** (usar REGRA DA SOMA R$ 700,00)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

### Validação Específica de IP Fixo:
- **SE opção "Fixo" estiver marcada**: Valor deve ser R$ 50,00
- **SE opção "Variável" estiver marcada**: Valor deve ser R$ 0,00
- **EMPRESARIAL**: IP Fixo INCLUSO (não cobra taxa adicional)
- **RESIDENCIAL**: IP Fixo opcional com taxa de R$ 50,00

## ETAPA 3: REGRA FUNDAMENTAL DAS TAXAS

### ⚠️ REGRA OBRIGATÓRIA - SOMA DAS TAXAS:

\\`\\`\\`
REGRA PRINCIPAL:
Taxa_de_Instalação + Taxa_de_Rescisão = R$ 700,00 (SEMPRE)

PASSO 1: Extrair valores do contrato
- Taxa_Instalação_Encontrada = [valor no contrato]
- Taxa_Rescisão_Encontrada = [valor no contrato]

PASSO 2: Calcular soma atual
- Soma_Atual = Taxa_Instalação_Encontrada + Taxa_Rescisão_Encontrada

PASSO 3: Verificar se soma é R$ 700,00
- SE Soma_Atual = 700,00 → CORRETO
- SE Soma_Atual ≠ 700,00 → ERRO

PASSO 4: Calcular valores corretos
- Taxa_Rescisão_Correta = 700,00 - Taxa_Instalação_Encontrada
- Taxa_Instalação_Correta = 700,00 - Taxa_Rescisão_Encontrada
\\`\\`\\`

### Exemplos da Regra:
- **Taxa Instalação R$ 120,00 + Taxa Rescisão R$ 580,00 = R$ 700,00** ✅ CORRETO
- **Taxa Instalação R$ 200,00 + Taxa Rescisão R$ 500,00 = R$ 700,00** ✅ CORRETO  
- **Taxa Instalação R$ 50,00 + Taxa Rescisão R$ 650,00 = R$ 700,00** ✅ CORRETO
- **Taxa Instalação R$ 0,00 + Taxa Rescisão R$ 700,00 = R$ 700,00** ✅ CORRETO
- **Taxa Instalação R$ 120,00 + Taxa Rescisão R$ 700,00 = R$ 820,00** ❌ ERRO

## ETAPA 4: REGRA CRÍTICA

**⚠️ SÓ REPORTAR COMO ERRO SE SOMA ≠ R$ 700,00**

\\`\\`\\`javascript
// ALGORITMO DE VALIDAÇÃO DAS TAXAS
taxa_instalacao = extrair_taxa_instalacao_do_contrato()
taxa_rescisao = extrair_taxa_rescisao_do_contrato()
soma_atual = taxa_instalacao + taxa_rescisao

if (soma_atual === 700.00) {
    // CORRETO - NÃO É ERRO
} else {
    // ERRO - Soma diferente de R$ 700,00
    taxa_rescisao_correta = 700.00 - taxa_instalacao
    // OU
    taxa_instalacao_correta = 700.00 - taxa_rescisao
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
    ],
    "caracteristicas_esperadas": {
      "valor": "R$ 129,99",
      "tipo": "RESIDENCIAL",
      "vigencia": "12 meses",
      "regra_taxas": "Taxa_Instalação + Taxa_Rescisão = R$ 700,00"
    }
  },
  "validacao_taxas": {
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_rescisao_encontrada": "R$ 700,00", 
    "soma_atual": "R$ 820,00",
    "soma_esperada": "R$ 700,00",
    "status": "ERRO - Soma incorreta",
    "taxa_rescisao_correta": "R$ 580,00",
    "calculo": "700 - 120 = 580"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "explicacao": "Taxa_Instalação (R$ 120,00) + Taxa_Rescisão deve somar R$ 700,00. Logo: 700 - 120 = R$ 580,00",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00",
      "severidade": "critico"
    }
  ],
  "alertas": [
    // Apenas problemas de formato e digitação
  ],
  "validacoes_corretas": [
    {
      "campo": "Valor do Plano", 
      "valor": "R$ 129,99",
      "status": "✅ Correto conforme tabela"
    }
  ],
  "resumo": {
    "total_erros": 1,
    "total_alertas": 0,
    "plano_identificado": "2024 Combo 600Mbps",
    "soma_taxas_atual": "R$ 820,00",
    "soma_taxas_esperada": "R$ 700,00"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Soma das taxas (Instalação + Rescisão) deve ser sempre R$ 700,00",
    "Taxa de rescisão deve ser ajustada para R$ 580,00"
  ]
}
\\`\\`\\`

## INSTRUÇÕES FINAIS

1. **IDENTIFIQUE** o modelo baseado no valor
2. **EXTRAIA** taxa de instalação e taxa de rescisão do contrato
3. **CALCULE** a soma: Taxa_Instalação + Taxa_Rescisão
4. **VERIFIQUE** se soma = R$ 700,00
5. **SE soma ≠ R$ 700,00** → É ERRO, calcule valores corretos
6. **SE soma = R$ 700,00** → Está CORRETO, não reportar erro
7. **INCLUA** seção "validacao_taxas" detalhada
8. **EXPLIQUE** claramente a regra da soma R$ 700,00

**REGRA FUNDAMENTAL**: Taxa_Instalação + Taxa_Rescisão = R$ 700,00 SEMPRE!

**Contrato para análise:**
${contractText}`;
};
