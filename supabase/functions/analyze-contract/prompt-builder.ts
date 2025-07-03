export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# ANÁLISE DE CONTRATOS CIABRASNET

## INSTRUÇÃO PRINCIPAL
Você é um especialista em análise de contratos da CIABRASNET. Analise o contrato fornecido e identifique TODOS os problemas, incluindo erros críticos, alertas de digitação e formatos inválidos. Use EXATAMENTE o formato JSON especificado.

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

## DETECÇÃO DE PROBLEMAS OBRIGATÓRIA

### ERROS CRÍTICOS (Impedem funcionamento):
- Valores do plano incorretos
- Taxa de instalação com valores impossíveis (ex: R$ 2000,00 → R$ 200,00)
- Tipo de contrato errado
- Vigência incorreta
- Cálculos de rescisão impossíveis (valores negativos)

### ALERTAS DE DIGITAÇÃO (erro_digitacao):
- "SOOLTEIRO" → "SOLTEIRO"
- "Camarrgo" → "Camargo"
- "SOLTERIO" → "SOLTEIRO"
- "CASDO" → "CASADO"
- Nomes com letras duplicadas ou faltando
- Endereços com erros de grafia

### ALERTAS DE FORMATO INVÁLIDO (formato_invalido):
- CPF com dígitos extras: "137.158.269-677" (tem 12 dígitos)
- CPF com dígitos faltando: "137.158.26-67" (tem 10 dígitos)
- CNPJ com formato incorreto
- Telefones mal formatados
- CEP inválido
- Emails mal formados

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
      "impacto": "Descrição do impacto do erro"
    }
  ],
  "alertas": [
    {
      "tipo": "erro_digitacao|formato_invalido",
      "campo": "Nome do campo com problema",
      "valor_encontrado": "Valor com problema",
      "sugestao": "Sugestão de correção"
    }
  ],
  "validacoes_corretas": [
    {
      "campo": "Nome do campo correto",
      "valor": "Valor encontrado",
      "status": "✅ Correto conforme tabela|✅ Marcado corretamente|✅ Formato válido"
    }
  ],
  "calculo_taxa_rescisao": {
    "fidelidade_marcada": true,
    "taxa_instalacao_encontrada": "R$ XXX,XX",
    "taxa_instalacao_correta": "R$ XXX,XX", 
    "calculo_incorreto": "Explicação do cálculo errado (se aplicável)",
    "calculo_correto": "700 - XXX = R$ XXX,XX",
    "observacao": "Observação sobre o cálculo"
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
      "Lista dos principais problemas encontrados"
    ]
  },
  "status_geral": "aprovado|reprovado",
  "observacoes": [
    "Observação contextualizada sobre a análise",
    "Sugestões de ações corretivas"
  ]
}
\`\`\`

## REGRAS CRÍTICAS

1. **IDENTIFICAÇÃO**: Primeiro identifique qual dos 6 contratos está sendo analisado
2. **DETECÇÃO OBRIGATÓRIA**: SEMPRE procure por:
   - Erros de digitação (SOOLTEIRO, Camarrgo, etc.)
   - Formatos inválidos de CPF/CNPJ (dígitos extras ou faltando)
   - Valores evidentemente incorretos (R$ 2000,00 ao invés de R$ 200,00)
3. **CATEGORIZAÇÃO**: 
   - **ERROS**: Valores incorretos que impedem funcionamento correto
   - **ALERTAS**: Problemas de digitação e formato que precisam atenção
   - **VALIDAÇÕES CORRETAS**: Campos que estão exatamente como esperado
4. **SEVERIDADE DOS ERROS**: 
   - **critico**: Valores que impossibilitam funcionamento (taxa negativa, plano errado)
   - **alto**: Dados importantes incorretos (taxa instalação, IP fixo)
   - **medio**: Campos secundários com valores errados
   - **baixo**: Problemas menores de formatação
5. **CÁLCULO RESCISÃO**: SEMPRE explicar:
   - Se fidelidade está marcada (SIM/NÃO)
   - Taxa de instalação encontrada vs. correta
   - Cálculo incorreto (se aplicável) e por que está errado
   - Cálculo correto usando a fórmula
6. **STATUS FINAL**: 
   - "reprovado" se há QUALQUER erro no array "erros"
   - "aprovado" APENAS se array "erros" estiver vazio (alertas não reprovam)

## PROCESSO DE ANÁLISE OBRIGATÓRIO

1. **Leia o contrato completo** palavra por palavra
2. **Identifique o modelo** baseado em valor/nome/características
3. **Procure ATIVAMENTE por**:
   - Erros de digitação em TODOS os campos (nome, endereço, estado civil)
   - Formatos inválidos de documentos (CPF, CNPJ, telefone)
   - Valores impossíveis ou claramente incorretos
4. **Categorize TODOS os problemas encontrados**:
   - Campos com valores incorretos → "erros"
   - Problemas de digitação/formato → "alertas"
   - Campos corretos → "validacoes_corretas"
5. **Calcule taxa de rescisão** com explicação completa
6. **Gere resumo detalhado** com principais problemas
7. **Determine status final** baseado na presença de erros críticos

## EXEMPLOS DE DETECÇÃO OBRIGATÓRIA

### Erros de Digitação a Detectar:
- "SOOLTEIRO" → alerta tipo "erro_digitacao"
- "Camarrgo" → alerta tipo "erro_digitacao"  
- "CASDO" → alerta tipo "erro_digitacao"
- Qualquer nome com letras duplicadas suspeitas

### Formatos Inválidos a Detectar:
- CPF "137.158.269-677" → alerta tipo "formato_invalido" (12 dígitos)
- CPF "137.158.26-67" → alerta tipo "formato_invalido" (10 dígitos)
- Telefones sem código de área ou mal formatados

### Valores Impossíveis a Detectar:
- Taxa instalação "R$ 2000,00" quando deveria ser "R$ 200,00" → erro crítico
- Qualquer valor monetário com zeros extras evidentes

**Contrato para análise:**
${contractText}`;
};