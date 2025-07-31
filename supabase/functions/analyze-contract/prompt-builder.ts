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
- **Taxa instalação** (conforme tabela)
- **Taxa rescisão** (usar NOVA LÓGICA DE CÁLCULO abaixo)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

### Validação Específica de IP Fixo:
- **SE opção "Fixo" estiver marcada**: Valor deve ser R$ 50,00
- **SE opção "Variável" estiver marcada**: Valor deve ser R$ 0,00
- **EMPRESARIAL**: IP Fixo INCLUSO (não cobra taxa adicional)
- **RESIDENCIAL**: IP Fixo opcional com taxa de R$ 50,00

## ETAPA 3: NOVA LÓGICA DE CÁLCULO DA TAXA DE RESCISÃO

### ⚠️ REGRA OFICIAL ATUALIZADA (SEGUIR EXATAMENTE):

\\`\\`\\`
PASSO 1: Verificar se tem fidelidade
- Procurar por "DA OPÇÃO DE FIDELIDADE" 
- Se está marcado "SIM (X)" → TEM FIDELIDADE
- Se está marcado "NÃO (X)" → NÃO TEM FIDELIDADE

PASSO 2: Extrair valor da taxa de instalação do contrato
- Encontrar o valor real da taxa de instalação no contrato
- Converter para número (ex: R$ 200,00 → 200)

PASSO 3: Aplicar a lógica oficial
SE Fidelidade = "SIM":
  SE Valor_Taxa_Instalacao > 0:
    Taxa_Rescisao_Esperada = 700 - Valor_Taxa_Instalacao
  SENÃO:
    Taxa_Rescisao_Esperada = 700
SENÃO (Fidelidade = "NÃO"):
  Taxa_Rescisao_Esperada = 700

PASSO 4: Comparar com valor encontrado no contrato
- Se Taxa_Rescisao_Encontrada ≠ Taxa_Rescisao_Esperada → É ERRO
- Se Taxa_Rescisao_Encontrada = Taxa_Rescisao_Esperada → Está CORRETO
\\`\\`\\`

### Exemplos da Nova Lógica:
- **Fidelidade SIM + Taxa Instalação R$ 200,00** → Rescisão = 700 - 200 = **R$ 500,00**
- **Fidelidade SIM + Taxa Instalação R$ 120,00** → Rescisão = 700 - 120 = **R$ 580,00**
- **Fidelidade SIM + Taxa GRATUITA (R$ 0,00)** → Rescisão = 700 - 0 = **R$ 700,00**
- **Fidelidade NÃO + Qualquer taxa** → Rescisão = **R$ 700,00**

## ETAPA 4: REGRA CRÍTICA

**⚠️ SÓ REPORTAR COMO ERRO SE VALORES FOREM DIFERENTES**

\\`\\`\\`javascript
// ALGORITMO DE VALIDAÇÃO
valor_contrato = extrair_do_contrato()
valor_esperado = calcular_usando_nova_logica()

if (valor_contrato === valor_esperado) {
    // NÃO É ERRO - NÃO INCLUIR NO RESULTADO
} else {
    // É ERRO REAL - INCLUIR NO ARRAY DE ERROS
}
\\`\\`\\`

## FORMATO DE RESPOSTA

\\`\\`\\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95,
    "criterios_identificacao": [
      "Valor R$ 129,99 identificado no contrato",
      "Nome do plano encontrado"
    ],
    "caracteristicas_esperadas": {
      "valor": "R$ 129,99",
      "tipo": "RESIDENCIAL",
      "vigencia": "12 meses",
      "taxa_instalacao": "R$ 200,00",
      "rescisao": "Calculada pela nova lógica"
    }
  },
  "calculo_rescisao": {
    "fidelidade_encontrada": "SIM",
    "taxa_instalacao_encontrada": "R$ 120,00",
    "calculo_aplicado": "700 - 120 = 580",
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_contrato": "R$ 700,00",
    "status": "ERRO - Valor incorreto no contrato"
  },
  "erros": [
    // APENAS divergências reais aqui
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "calculo_detalhado": "Fidelidade=SIM, Taxa_Instalação=R$ 120,00, Logo: 700 - 120 = R$ 580,00",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00 conforme cálculo oficial",
      "localizacao": "Seção da taxa de rescisão",
      "severidade": "critico"
    }
  ],
  "alertas": [
    // APENAS problemas de formato e digitação (NÃO campos vazios)
    {
      "tipo": "erro_digitacao",
      "campo": "Estado Civil",
      "valor_encontrado": "SOOLTEIRO",
      "sugestao": "Verificar se deveria ser 'SOLTEIRO'"
    }
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
    "calculo_rescisao_aplicado": "700 - 120 = 580"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Taxa de rescisão calculada incorretamente no contrato",
    "Deve seguir a fórmula: 700 - valor_taxa_instalacao quando há fidelidade"
  ]
}
\\`\\`\\`

## INSTRUÇÕES FINAIS

1. **IDENTIFIQUE primeiro** o modelo baseado no valor
2. **EXTRAIA** valor real da taxa de instalação do contrato
3. **VERIFIQUE** se tem fidelidade marcada
4. **CALCULE** taxa de rescisão usando a NOVA LÓGICA OFICIAL
5. **COMPARE** valor calculado vs valor no contrato
6. **REPORTE** apenas se forem diferentes
7. **INCLUA** seção "calculo_rescisao" detalhada
8. **USE** nova fórmula: 700 - taxa_instalacao (se fidelidade=SIM e taxa>0)

**LEMBRE-SE**: A nova lógica é OBRIGATÓRIA para cálculo da taxa de rescisão!

**Contrato para análise:**
${contractText}`;
};
