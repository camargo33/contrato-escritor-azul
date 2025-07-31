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

### Critérios de Identificação:
- **Valor do plano** (mais confiável)
- **Nome do plano** no texto
- **Velocidade mencionada**

### ⚠️ REGRA ABSOLUTA: A TABELA SERVE APENAS PARA:
- ✅ Identificar qual plano é (pelo valor)
- ✅ Validar prazo de vigência 
- ✅ Validar tipo (residencial/corporativo)

### ⚠️ A TABELA JAMAIS DEVE SER USADA PARA VALIDAR:
- ❌ Taxa de instalação (calculada pela fidelidade)
- ❌ Taxa de rescisão (calculada pela fidelidade)

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
- **Valor do plano** (deve ser exato da tabela acima)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

### Validação Específica de IP Fixo:
- **SE opção "Fixo" estiver marcada**: Valor deve ser R$ 50,00
- **SE opção "Variável" estiver marcada**: Valor deve ser R$ 0,00
- **EMPRESARIAL**: IP Fixo INCLUSO (não cobra taxa adicional)
- **RESIDENCIAL**: IP Fixo opcional com taxa de R$ 50,00

## ETAPA 3: REGRA ÚNICA E EXCLUSIVA DAS TAXAS

### 🚨 INSTRUÇÃO CRÍTICA - LEIA 3 VEZES:

**QUANDO HÁ FIDELIDADE (SIM):**
- ✅ Taxa de Instalação = QUALQUER VALOR é CORRETO (aceitar sempre)
- ✅ Taxa de Rescisão = Valor do desconto extraído do texto da fidelidade
- ❌ NUNCA comparar instalação com qualquer valor da tabela
- ❌ NUNCA dizer que instalação deveria ser R$ 200,00 ou qualquer valor fixo

**QUANDO NÃO HÁ FIDELIDADE (NÃO):**
- ✅ Taxa de Instalação = R$ 700,00 (valor fixo sem desconto)
- ✅ Taxa de Rescisão = R$ 0,00 (sem multa)

### 🔥 ALGORITMO OBRIGATÓRIO:

\`\`\`javascript
// PASSO 1: Identificar fidelidade
fidelidade = extrair_opcao_fidelidade() // "SIM" ou "NÃO"

// PASSO 2: Extrair valores do contrato
taxa_instalacao_contrato = extrair_taxa_instalacao_contrato()
taxa_rescisao_contrato = extrair_taxa_rescisao_contrato()

// PASSO 3: Aplicar validação conforme fidelidade
if (fidelidade === "SIM") {
    // ⚠️ COM FIDELIDADE: TAXA DE INSTALAÇÃO É SEMPRE CORRETA!
    console.log("Taxa de instalação com fidelidade:", taxa_instalacao_contrato, "- ACEITAR SEMPRE")
    
    // Buscar valor do desconto no texto da fidelidade
    valor_desconto = extrair_valor_desconto_do_texto_fidelidade()
    taxa_rescisao_esperada = valor_desconto
    
    // ✅ VALIDAÇÃO CORRETA:
    // Taxa de instalação = SEMPRE CORRETO (não validar)
    // Taxa de rescisão = Comparar com valor do desconto
    
    if (taxa_rescisao_contrato === taxa_rescisao_esperada) {
        // CORRETO - não reportar erro
    } else {
        // ERRO: Taxa de rescisão incorreta
    }
    
    // 🚨 JAMAIS VALIDAR TAXA DE INSTALAÇÃO COM FIDELIDADE!
    
} else {
    // SEM FIDELIDADE: Valores fixos
    if (taxa_instalacao_contrato !== 700.00) {
        // ERRO: Taxa de instalação deve ser R$ 700,00
    }
    if (taxa_rescisao_contrato !== 0.00) {
        // ERRO: Taxa de rescisão deve ser R$ 0,00
    }
}
\`\`\`

### Exemplo Prático CORRETO:

**Contrato com fidelidade:**
- Desconto encontrado no texto: "R$ 580,00"
- Taxa de Instalação no contrato: R$ 120,00
- Taxa de Rescisão no contrato: R$ 700,00

**Resultado CORRETO:**
```json
{
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00",
      "status": "✅ CORRETO - Com fidelidade, qualquer valor é aceito"
    }
  ],
  "erros": [
    {
      "campo": "Taxa de Rescisão", 
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00"
    }
  ]
}
```

**❌ EXEMPLO ERRADO (NÃO FAZER):**
```json
{
  "erros": [
    {
      "campo": "Taxa de Instalação",
      "valor_encontrado": "R$ 120,00", 
      "valor_esperado": "R$ 200,00"  // ❌ NUNCA FAZER ISSO!
    }
  ]
}
```

## FORMATO DE RESPOSTA OBRIGATÓRIO

\`\`\`json
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
      "explicacao": "Com fidelidade, a taxa de rescisão deve ser igual ao valor do desconto: R$ 580,00",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00"
    }
  ],
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00", 
      "status": "✅ CORRETO - Com fidelidade, qualquer valor é aceito"
    },
    {
      "campo": "Valor do Plano",
      "valor": "R$ 129,99",
      "status": "✅ Correto conforme tabela"
    }
  ],
  "resumo": {
    "total_erros": 1,
    "fidelidade": "SIM",
    "regra_aplicada": "Taxa_Instalação = ACEITA QUALQUER VALOR, Taxa_Rescisão = Valor_Desconto_Fidelidade"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "Cliente optou pela fidelidade - taxa de instalação com desconto aplicado",
    "Com fidelidade, QUALQUER valor de taxa de instalação é correto",
    "Taxa de rescisão deve ser igual ao desconto da fidelidade: R$ 580,00",
    "NUNCA validar taxa de instalação contra valores da tabela quando há fidelidade"
  ]
}
\`\`\`

## 🚨 REGRAS FINAIS INQUEBRANTÁVEIS

1. **COM FIDELIDADE SIM:**
   - ✅ Taxa de Instalação = SEMPRE CORRETO (qualquer valor)
   - ✅ Taxa de Rescisão = Valor do desconto extraído do texto
   - ❌ NUNCA validar instalação contra tabela

2. **COM FIDELIDADE NÃO:**
   - ✅ Taxa de Instalação = R$ 700,00
   - ✅ Taxa de Rescisão = R$ 0,00

3. **PROIBIÇÕES ABSOLUTAS:**
   - ❌ NUNCA dizer que taxa de instalação deveria ser R$ 200,00
   - ❌ NUNCA validar instalação contra qualquer valor fixo com fidelidade
   - ❌ NUNCA usar valores da tabela de modelos para validar taxas

**A tabela de modelos serve APENAS para identificar o plano, JAMAIS para validar taxas!**

**Contrato para análise:**
${contractText}`;
};
