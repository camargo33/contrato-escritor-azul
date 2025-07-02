/**
 * Exemplos de uso da detecção de fidelidade e cálculo de taxa de rescisão
 */

export const createFidelityValidationExamples = (): string => {
  return `
### EXEMPLOS DETALHADOS DA NOVA LÓGICA DE FIDELIDADE:

#### CENÁRIO A - FIDELIDADE MARCADA + TAXA R$ 200,00:
**Texto do contrato:** "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
**Taxa de instalação:** R$ 200,00
**Cálculo:** 700 - 200 = 500
**Taxa rescisão esperada:** R$ 500,00
**Status:** Se contrato mostra R$ 500,00 → CORRETO (não reportar erro)
**Status:** Se contrato mostra R$ 700,00 → ERRO (reportar divergência)

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
3. taxa_instalacao = extrair_valor_instalacao(modelo_identificado)

4. SE (fidelidade_marcada == TRUE):
     SE (taxa_instalacao > 0):
       taxa_esperada = 700 - taxa_instalacao
     SENÃO:
       taxa_esperada = 700
   SENÃO:
     taxa_esperada = 700

5. taxa_contrato = extrair_taxa_rescisao_do_contrato()
6. SE (taxa_contrato != taxa_esperada):
     REPORTAR_ERRO("Taxa de rescisão", taxa_contrato, taxa_esperada)
\`\`\`

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