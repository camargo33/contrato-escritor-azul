/**
 * Exemplos de uso da detecção de fidelidade e cálculo de taxa de rescisão
 */

export const createFidelityValidationExamples = (): string => {
  return `
### TABELA DE REFERÊNCIA OFICIAL PARA VALIDAÇÃO:

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

### EXEMPLOS DETALHADOS DA LÓGICA DE FIDELIDADE:

#### CENÁRIO A - FIDELIDADE MARCADA + TAXA LINHA FIDELIDADE R$ 120,00:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
**Linha específica:** "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ 120,00"
**Cálculo:** 700 - 120 = 580
**Taxa rescisão esperada:** R$ 580,00
**Status:** Se contrato mostra R$ 580,00 → CORRETO (não reportar erro)
**Status:** Se contrato mostra R$ 500,00 → ERRO (diferença real detectada)

#### CENÁRIO A2 - FIDELIDADE MARCADA + TAXA LINHA FIDELIDADE R$ 200,00:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
**Linha específica:** "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ 200,00"
**Cálculo:** 700 - 200 = 500
**Taxa rescisão esperada:** R$ 500,00
**Status:** Se contrato mostra R$ 500,00 → CORRETO (não reportar erro)

#### CENÁRIO A3 - FIDELIDADE MARCADA + TAXA LINHA FIDELIDADE R$ 150,00:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
**Linha específica:** "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ 150,00"
**Cálculo:** 700 - 150 = 550
**Taxa rescisão esperada:** R$ 550,00

#### CENÁRIO A4 - FIDELIDADE MARCADA + TAXA LINHA FIDELIDADE R$ 300,00:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
**Linha específica:** "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ 300,00"
**Cálculo:** 700 - 300 = 400
**Taxa rescisão esperada:** R$ 400,00

#### CENÁRIO B - FIDELIDADE MARCADA + TAXA GRATUITA:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
**Taxa de instalação:** GRATUITA (R$ 0,00)
**Cálculo:** Taxa gratuita com fidelidade = 700
**Taxa rescisão esperada:** R$ 700,00
**Status:** Se contrato mostra R$ 700,00 → CORRETO (não reportar erro)

#### CENÁRIO C - FIDELIDADE NÃO MARCADA:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM ( ) NÃO (X)"
**Taxa de instalação:** Qualquer valor (R$ 200,00, gratuita, etc.)
**Cálculo:** Sem fidelidade = valor fixo padrão
**Taxa rescisão esperada:** R$ 700,00
**Status:** Se contrato mostra R$ 700,00 → CORRETO (não reportar erro)
**Status:** Se contrato mostra R$ 500,00 → ERRO (reportar divergência)

#### CENÁRIO D - FIDELIDADE NÃO DETECTADA/CLARA:
**Texto do contrato:** Seção de fidelidade ausente ou ambígua
**Taxa de instalação:** Qualquer valor
**Cálculo:** Assumir sem fidelidade = valor fixo padrão
**Taxa rescisão esperada:** R$ 700,00

### ALGORITMO OBRIGATÓRIO PARA VALIDAÇÃO:

\`\`\`
1. texto_fidelidade = extrair_secao_fidelidade(contrato)
2. fidelidade_marcada = detectar_sim_marcado(texto_fidelidade)
3. taxa_instalacao_real = extrair_taxa_instalacao_real_do_contrato(contrato) // ⚠️ MUDANÇA CRÍTICA

4. SE (fidelidade_marcada == TRUE):
     SE (taxa_instalacao_real > 0):
       taxa_esperada = 700 - taxa_instalacao_real // Usar valor REAL do contrato
     SENÃO:
       taxa_esperada = 700
   SENÃO:
     taxa_esperada = 700

5. taxa_contrato = extrair_taxa_rescisao_do_contrato()
6. SE (taxa_contrato != taxa_esperada):
     REPORTAR_ERRO("Taxa de rescisão", taxa_contrato, taxa_esperada, "Baseado em fidelidade e taxa real")
\`\`\`

### ⚠️ PADRÕES PARA EXTRAIR TAXA REAL DE INSTALAÇÃO:

**PROCURAR POR:**
- "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ X,XX"
- "Taxa de Instalação: R$ X,XX"
- "Valor da Taxa de Instalação: R$ X,XX"
- "GRATUITA" ou "R$ 0,00" (valor = 0)

### PADRÕES DE DETECÇÃO DE FIDELIDADE:

**FIDELIDADE MARCADA (SIM):**
- "DA OPÇÃO DE FIDELIDADE: SIM (X)"
- "FIDELIDADE: SIM X"
- "[X] SIM - Fidelidade"
- "SIM (X) para opção de fidelidade"

**FIDELIDADE NÃO MARCADA (NÃO):**
- "DA OPÇÃO DE FIDELIDADE: SIM ( ) NÃO (X)"
- "FIDELIDADE: NÃO X"
- "[X] NÃO - Fidelidade"
- Ausência de marcação clara
`;
};

/**
 * Instruções específicas para implementação no prompt
 */
export const createImplementationInstructions = (): string => {
  return `
### IMPLEMENTAÇÃO OBRIGATÓRIA NO PROMPT:

1. **ANTES de validar taxa de rescisão**, execute:
   - Detectar seção de fidelidade no texto
   - Identificar se SIM está marcado com (X)
   - Extrair taxa de instalação do modelo identificado

2. **CALCULAR taxa esperada usando a nova lógica:**
   - NÃO use valor fixo da tabela de referência
   - USE o algoritmo de cálculo baseado em fidelidade

3. **COMPARAR e reportar apenas divergências reais:**
   - Valor encontrado vs. valor calculado (não valor da tabela)
   - Incluir na mensagem de erro a lógica usada no cálculo

4. **DOCUMENTAR o processo de decisão:**
   - Incluir evidência da detecção de fidelidade
   - Mostrar cálculo realizado
   - Explicar por que o valor é considerado correto/incorreto
`;
};