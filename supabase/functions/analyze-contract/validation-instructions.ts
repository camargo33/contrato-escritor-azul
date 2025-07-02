
import { CONTRACT_MODELS } from './contract-models.ts';
import { VALIDATION_FIELDS } from './validation-fields.ts';

export const createValidationInstructions = (): string => {
  const fieldsText = VALIDATION_FIELDS.map(field => 
    `- **${field.name}**: ${field.description}`
  ).join('\n');

  return `## ETAPA 2: CAMPOS ESPECÍFICOS PARA ANALISAR (APÓS IDENTIFICAÇÃO):

### 1. DADOS DO ASSINANTE:
${fieldsText}

### 2. VALIDAÇÕES ESPECÍFICAS BASEADAS NO MODELO IDENTIFICADO:
- **Identificação do Plano**: Comparar com a tabela de referência
- **Valor do Plano**: DEVE ser exatamente o valor especificado na tabela
- **Prazo de Vigência**: 
  - CORPORATIVO (1 Gb Empresarial): 24 meses
  - RESIDENCIAL (todos os outros): 12 meses
- **Tipo de Plano**: Apenas "1 Gb Empresarial" é corporativo, todos os outros são residenciais
- **Taxa de Instalação**: Verificar conforme tabela de referência
- **Equipamentos**: Verificar valores exatos conforme tabela
- **Taxa de Rescisão**: VALIDAÇÃO ESPECIAL NOVA - Verificar usando a seguinte lógica:

### 3. REGRA CRÍTICA NOVA - TAXA DE RESCISÃO BASEADA EM FIDELIDADE:

**ETAPA 1: DETECTAR SE FIDELIDADE ESTÁ MARCADA**
- Procurar no contrato por padrões como:
  * "Fidelidade: SIM (X)"
  * "SIM (X)" na seção de fidelidade
  * "Prazo de fidelidade: SIM" com marcação
  * Qualquer indicação de que a opção SIM está marcada para fidelidade

**ETAPA 2: APLICAR LÓGICA CONDICIONAL**

**SE FIDELIDADE = SIM (MARCADA):**
- Taxa Instalação R$ 0,00 (gratuita) → Taxa Rescisão = R$ 700,00
- Taxa Instalação R$ 150,00 → Taxa Rescisão = R$ 550,00 (700 - 150)
- Taxa Instalação R$ 200,00 → Taxa Rescisão = R$ 500,00 (700 - 200)
- Taxa Instalação R$ 300,00 → Taxa Rescisão = R$ 400,00 (700 - 300)

**SE FIDELIDADE = NÃO (NÃO MARCADA) OU NÃO DETECTADA:**
- Taxa Rescisão = **SEMPRE R$ 700,00** (independente da taxa de instalação)

- **IP Fixo**: 
  - "INCLUSO": Apenas no contrato empresarial (Contrato 1)
  - "Variável": Todos os residenciais (cobrança de R$ 50,00 se fixo marcado)
- **Cláusulas**: TODOS os contratos devem ter cláusulas de 1 a 11

### 4. REGRA CRÍTICA - APENAS DIVERGÊNCIAS SÃO ERROS:

**ATENÇÃO: SÓ REPORTE COMO ERRO SE HOUVER DIFERENÇA REAL ENTRE OS VALORES**

ALGORITMO DE VALIDAÇÃO:
1. valor_contrato = extrair valor do contrato
2. valor_esperado = buscar valor na tabela de referência OU calcular usando regra especial (rescisão com fidelidade)
3. SE (valor_contrato == valor_esperado):
     → IGNORAR COMPLETAMENTE (não é erro)
     → NÃO incluir no resultado
   SENÃO:
     → É UM ERRO REAL
     → Incluir no array de erros

**REGRA ESPECIAL ATUALIZADA PARA TAXA DE RESCISÃO:**
- PRIMEIRA: Detecte se a opção "Fidelidade" está marcada como SIM no contrato
- SEGUNDA: Identifique o valor da Taxa de Instalação no contrato
- TERCEIRA: Use a lógica condicional:
  * SE fidelidade NÃO marcada: Taxa Rescisão esperada = R$ 700,00
  * SE fidelidade SIM marcada: Use tabela de cálculo (700 - taxa instalação)
- QUARTA: Compare o valor encontrado no contrato com o valor calculado
- QUINTA: Só reporte erro se houver divergência

**REGRA ABSOLUTA**: 
- Valores IGUAIS = NÃO É ERRO = NÃO REPORTAR
- Valores DIFERENTES = É ERRO = REPORTAR

### 5. EXEMPLOS PRÁTICOS ATUALIZADOS - TAXA DE RESCISÃO:

**CENÁRIO 1 - FIDELIDADE NÃO MARCADA - NÃO É ERRO:**
- Fidelidade: NÃO (X) ou não marcada
- Taxa Instalação no contrato: "R$ 200,00"
- Taxa Rescisão no contrato: "R$ 700,00"
- Taxa Rescisão esperada: "R$ 700,00" (valor fixo quando sem fidelidade)
- RESULTADO: NÃO REPORTAR (valores iguais)

**CENÁRIO 2 - FIDELIDADE MARCADA - NÃO É ERRO:**
- Fidelidade: SIM (X)
- Taxa Instalação no contrato: "R$ 200,00"
- Taxa Rescisão no contrato: "R$ 500,00"
- Taxa Rescisão esperada: "R$ 500,00" (700 - 200)
- RESULTADO: NÃO REPORTAR (valores iguais)

**CENÁRIO 3 - FIDELIDADE MARCADA - É ERRO:**
- Fidelidade: SIM (X)
- Taxa Instalação no contrato: "R$ 200,00"
- Taxa Rescisão no contrato: "R$ 700,00"
- Taxa Rescisão esperada: "R$ 500,00" (700 - 200)
- RESULTADO: REPORTAR ERRO (valores diferentes)

**CENÁRIO 4 - FIDELIDADE NÃO MARCADA - É ERRO:**
- Fidelidade: NÃO (X)
- Taxa Instalação no contrato: "R$ 200,00"
- Taxa Rescisão no contrato: "R$ 500,00"
- Taxa Rescisão esperada: "R$ 700,00" (valor fixo)
- RESULTADO: REPORTAR ERRO (valores diferentes)

### 6. EXEMPLOS PRÁTICOS - OUTROS CAMPOS:

**NUNCA REPORTE ESTES COMO ERRO (valores iguais):**
- Contrato: "R$ 109,99" | Tabela: "R$ 109,99" → NÃO É ERRO - IGNORAR
- Contrato: "12 meses" | Tabela: "12 meses" → NÃO É ERRO - IGNORAR
- Contrato: "RESIDENCIAL" | Tabela: "RESIDENCIAL" → NÃO É ERRO - IGNORAR

**APENAS REPORTE ESTES COMO ERRO (valores diferentes):**
- Contrato: "R$ 120,00" | Tabela: "R$ 109,99" → É ERRO - REPORTAR
- Contrato: "24 meses" | Tabela: "12 meses" → É ERRO - REPORTAR

### 7. INSTRUÇÕES OBRIGATÓRIAS:

**REGRA FUNDAMENTAL**: Só inclua no array de erros campos com DIVERGÊNCIA REAL

1. **PARA TAXA DE RESCISÃO**: Use SEMPRE a nova lógica baseada em fidelidade
2. **DETECTE FIDELIDADE PRIMEIRO**: Procure se está marcada como SIM
3. **APLIQUE LÓGICA CONDICIONAL**: Com ou sem fidelidade
4. **COMPARE EXATAMENTE** os valores: contrato vs esperado (calculado)
5. **SE FOREM IGUAIS**: NÃO inclua no resultado (não é erro)
6. **SE FOREM DIFERENTES**: Inclua no array de erros
7. **RESULTADO VAZIO []**: Quando TODOS os valores estão corretos
8. **STATUS "aprovado"**: Quando não há divergências reais

**IMPORTANTE**: O sistema deve agora considerar a opção de fidelidade antes de calcular a taxa de rescisão esperada.`;
};

export const createContractReferenceTable = (): string => {
  const contractsText = CONTRACT_MODELS.map((model, index) => {
    return `### CONTRATO ${index + 1} - ${model.name}
- **PLANO**: ${model.name}
- **VALOR**: ${model.value} (VALOR FIXO)
- **PRAZO VIGÊNCIA**: ${model.validity_period}
- **TIPO**: ${model.type}
- **TAXA INSTALAÇÃO**: ${model.installation_fee}
- **EQUIPAMENTOS**: ${model.equipment}
- **RESCISÃO**: CALCULAR baseado na FIDELIDADE (ver tabela abaixo)
- **IP FIXO**: ${model.fixed_ip}
- **CLÁUSULAS**: ${model.clauses}`;
  }).join('\n\n');

  return `## TABELA DE REFERÊNCIA DOS CONTRATOS CIABRASNET

${contractsText}

## NOVA TABELA DE CÁLCULO DA TAXA DE RESCISÃO (BASEADA EM FIDELIDADE)

**REGRA PRINCIPAL**: A Taxa de Rescisão depende se a FIDELIDADE está marcada:

### CENÁRIO A: FIDELIDADE = NÃO (não marcada)
| Qualquer Taxa de Instalação | Taxa de Rescisão FIXA |
|-----------------------------|-----------------------|
| Qualquer valor (R$ 0 a R$ 300) | **R$ 700,00** |

### CENÁRIO B: FIDELIDADE = SIM (marcada)
| Taxa de Instalação | Taxa de Rescisão Calculada |
|-------------------|----------------------------|
| R$ 0,00 (gratuita) | R$ 700,00 |
| R$ 150,00 | R$ 550,00 (700 - 150) |
| R$ 200,00 | R$ 500,00 (700 - 200) |
| R$ 300,00 | R$ 400,00 (700 - 300) |

**ALGORITMO DE VALIDAÇÃO ATUALIZADO:**
1. **PRIMEIRO**: Detectar se fidelidade está marcada como SIM
2. **SEGUNDO**: Se NÃO marcada → Taxa Rescisão = R$ 700,00 (sempre)
3. **TERCEIRO**: Se SIM marcada → Taxa Rescisão = 700 - Taxa Instalação
4. **QUARTO**: Comparar valor encontrado vs valor esperado calculado
5. **QUINTO**: Só reportar erro se houver divergência real

**IMPORTANTE**: Agora é obrigatório verificar a marcação da fidelidade antes de calcular o valor esperado da rescisão.`;
};
