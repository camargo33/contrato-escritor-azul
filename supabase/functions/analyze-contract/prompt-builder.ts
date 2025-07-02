export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# ANÁLISE DE CONTRATOS CIABRASNET

## INSTRUÇÃO PRINCIPAL
Você é um especialista em análise de contratos da CIABRASNET. Analise o contrato fornecido e identifique erros seguindo EXATAMENTE o formato JSON especificado.

## TABELA DE REFERÊNCIA OFICIAL DOS CONTRATOS

### CONTRATO 1 - 1 Gb Empresarial
- **VALOR**: R$ 229,90
- **TIPO**: CORPORATIVO
- **VIGÊNCIA**: 24 meses
- **TAXA INSTALAÇÃO**: GRATUITA
- **IP FIXO**: INCLUSO
- **RESCISÃO**: R$ 700,00

### CONTRATO 2 - 2024 Combo Giga
- **VALOR**: R$ 209,99
- **TIPO**: RESIDENCIAL
- **VIGÊNCIA**: 12 meses
- **TAXA INSTALAÇÃO**: R$ 200,00
- **IP FIXO**: Variável (R$ 50,00 se fixo)
- **RESCISÃO**: R$ 500,00

### CONTRATO 3 - 2024 Combo 300Mbps
- **VALOR**: R$ 109,99
- **TIPO**: RESIDENCIAL
- **VIGÊNCIA**: 12 meses
- **TAXA INSTALAÇÃO**: R$ 200,00
- **IP FIXO**: Variável (R$ 50,00 se fixo)
- **RESCISÃO**: R$ 500,00

### CONTRATO 4 - 2025 Combo 500 Megas (MATRIZ)
- **VALOR**: R$ 119,99
- **TIPO**: RESIDENCIAL
- **VIGÊNCIA**: 12 meses
- **TAXA INSTALAÇÃO**: R$ 200,00
- **IP FIXO**: Variável (R$ 50,00 se fixo)
- **RESCISÃO**: R$ 500,00

### CONTRATO 5 - 2024 Combo 600Mbps
- **VALOR**: R$ 129,99
- **TIPO**: RESIDENCIAL
- **VIGÊNCIA**: 12 meses
- **TAXA INSTALAÇÃO**: R$ 200,00
- **IP FIXO**: Variável (R$ 50,00 se fixo)
- **RESCISÃO**: R$ 500,00

### CONTRATO 6 - 2024 Combo 800Mbps
- **VALOR**: R$ 159,99
- **TIPO**: RESIDENCIAL
- **VIGÊNCIA**: 12 meses
- **TAXA INSTALAÇÃO**: R$ 200,00
- **IP FIXO**: Variável (R$ 50,00 se fixo)
- **RESCISÃO**: R$ 500,00

## TAXA DE RESCISÃO - REGRA ESPECIAL

┌─────────────────────────┬───────────┬─────────────────────────────┐
│ Valor Taxa de Instalação│ Fidelidade│ Taxa de Rescisão Calculada  │
├─────────────────────────┼───────────┼─────────────────────────────┤
│ R$ 0,00 (gratuita)     │ Sim       │ R$ 700,00                   │
│ R$ 120,00              │ Sim       │ R$ 580,00                   │
│ R$ 150,00              │ Sim       │ R$ 550,00                   │
│ R$ 200,00              │ Sim       │ R$ 500,00                   │
│ R$ 300,00              │ Sim       │ R$ 400,00                   │
│ Qualquer valor         │ Não       │ R$ 700,00                   │
└─────────────────────────┴───────────┴─────────────────────────────┘

**FÓRMULA**: Taxa de Rescisão = R$ 700,00 - Valor da Taxa de Instalação (se fidelidade marcada)

## VALIDAÇÕES ADICIONAIS OBRIGATÓRIAS

### 1. ALERTAS DE DIGITAÇÃO E FORMATO (NÃO SÃO ERROS CRÍTICOS)
- **Erros de Digitação Específicos**: Apenas palavras com erros óbvios e inequívocos
  - SOOLTEIRO → SOLTEIRO
  - Camarrgo → Camargo
- **Valores Extremamente Suspeitos**: Apenas valores claramente absurdos
  - Taxa de instalação acima de R$ 1000,00
  - Mensalidades acima de R$ 1000,00 para planos residenciais

### 2. DETECÇÃO DE ERROS CRÍTICOS vs ALERTAS
- **ERROS**: Apenas diferenças nos valores oficiais dos planos (valor, tipo, vigência, taxa instalação)
- **ALERTAS**: Erros de digitação, CPF inválido, nomes com grafia suspeita
- **Taxa de Rescisão**: NÃO deve ser erro se for consequência de taxa de instalação incorreta

## FORMATO DE RESPOSTA OBRIGATÓRIO

Retorne EXATAMENTE este formato JSON:

\`\`\`json
{
  "modelo_identificado": {
    "nome": "Nome do plano identificado",
    "confianca": 100,
    "criterios_identificacao": [
      "Critério 1 usado para identificação",
      "Critério 2 usado para identificação"
    ],
    "caracteristicas_esperadas": {
      "valor": "R$ XXX,XX",
      "tipo": "CORPORATIVO|RESIDENCIAL",
      "vigencia": "XX meses",
      "taxa_instalacao": "GRATUITA|R$ XXX,XX",
      "ip_fixo": "INCLUSO|Variável (R$ 50,00 se fixo)",
      "rescisao": "R$ XXX,XX"
    }
  },
  "erros": [
    {
      "campo": "Nome do campo com erro",
      "valor_encontrado": "Valor atual no contrato",
      "valor_esperado": "Valor correto esperado",
      "sugestao_correcao": "Como corrigir o erro",
      "localizacao": "Seção onde o erro foi encontrado",
      "severidade": "critico|alto|medio|baixo",
      "impacto": "Descrição do impacto do erro (opcional)"
    }
  ],
  "alertas": [
    {
      "tipo": "erro_digitacao|formato_invalido|campo_suspeito",
      "campo": "Nome do campo",
      "valor_encontrado": "Valor encontrado",
      "sugestao": "Sugestão de correção"
    }
  ],
  "validacoes_corretas": [
    {
      "campo": "Nome do campo correto",
      "valor": "Valor encontrado",
      "status": "✅ Correto conforme tabela"
    }
  ],
  "calculo_taxa_rescisao": {
    "fidelidade_marcada": true,
    "taxa_instalacao_encontrada": "R$ XXX,XX",
    "taxa_instalacao_correta": "R$ XXX,XX",
    "calculo_incorreto": "700 - XXXX = negativo (impossível)",
    "calculo_correto": "700 - XXX = R$ XXX,XX",
    "observacao": "Explicação do cálculo e problemas detectados"
  },
  "resumo": {
    "total_erros": 0,
    "total_alertas": 0,
    "criticos": 0,
    "altos": 0,
    "medios": 0,
    "baixos": 0,
    "plano_identificado": "Nome do plano",
    "principais_problemas": [
      "Problema 1",
      "Problema 2"
    ]
  },
  "status_geral": "aprovado|reprovado",
  "observacoes": [
    "Observação 1 sobre a análise",
    "Observação 2 sobre a análise"
  ]
}
\`\`\`

## REGRAS CRÍTICAS

1. **IDENTIFICAÇÃO**: Primeiro identifique qual dos 6 contratos está sendo analisado
2. **DIFERENCIAÇÃO ERROS vs ALERTAS**:
   - **ERROS**: Apenas valores oficiais dos planos incorretos (valor, tipo, vigência, taxa instalação)
   - **ALERTAS**: Erros de digitação (SOOLTEIRO), CPF inválido, nomes suspeitos
3. **TAXA DE RESCISÃO**: NÃO deve ser erro separado se é consequência de taxa de instalação incorreta
4. **COMPARAÇÃO**: Compare APENAS valores que são DIFERENTES - valores iguais vão para "validacoes_corretas"
5. **CÁLCULO RESCISÃO**: Sempre incluir seção detalhada com cálculo incorreto E correto
6. **SEVERIDADE**: 
   - critico: Valor do plano, tipo, vigência, taxa instalação muito incorreta
   - alto: IP fixo incorreto  
   - medio: Campos secundários dos planos
   - baixo: Formatação menor
7. **STATUS**: "aprovado" se erros = 0, "reprovado" se erros > 0

## PROCESSO DE ANÁLISE

1. Leia o contrato completo
2. Identifique qual dos 6 modelos é baseado em valor/nome/características
3. Compare cada campo oficial do plano com a tabela de referência
4. Campos corretos → adicione em "validacoes_corretas"
5. Campos oficiais incorretos → adicione em "erros"
6. Erros de digitação/formato → adicione em "alertas" (NÃO em erros)
7. Calcule taxa de rescisão: se taxa instalação incorreta, mostre cálculo incorreto E correto
8. Gere resumo com principais problemas (incluindo alertas)
9. Adicione observações finais

**Contrato para análise:**
${contractText}`;
};