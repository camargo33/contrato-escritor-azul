
import { CONTRACT_MODELS } from './contract-models.ts';

export interface ValidationField {
  name: string;
  description: string;
  validationType: 'required' | 'format' | 'consistency' | 'value_match';
}

export const VALIDATION_FIELDS: ValidationField[] = [
  {
    name: 'Nome',
    description: 'Verificar se está completo e sem erros de digitação',
    validationType: 'required'
  },
  {
    name: 'CPF/CNPJ',
    description: 'Consistência com tipo de pessoa (PF=CPF, PJ=CNPJ)',
    validationType: 'consistency'
  },
  {
    name: 'Email',
    description: 'Verificar erros de digitação (ex: letras duplicadas)',
    validationType: 'format'
  },
  {
    name: 'Endereço',
    description: 'Completude dos dados',
    validationType: 'required'
  },
  {
    name: 'Telefone',
    description: 'Formato (XX) XXXXX-XXXX',
    validationType: 'format'
  }
];

// Lógica específica para cálculo da Taxa de Rescisão
export const calculateExpectedCancellationFee = (installationFeeText: string): string => {
  // Extrair valor numérico da taxa de instalação
  const installationValue = extractMonetaryValue(installationFeeText);
  
  // Aplicar a lógica da tabela
  if (installationValue === 0) {
    return 'R$ 700,00';
  } else if (installationValue === 150) {
    return 'R$ 550,00';
  } else if (installationValue === 200) {
    return 'R$ 500,00';
  } else if (installationValue === 300) {
    return 'R$ 400,00';
  }
  
  // Valor padrão se não encontrar correspondência
  return 'R$ 500,00';
};

// Função auxiliar para extrair valor monetário
const extractMonetaryValue = (text: string): number => {
  if (!text) return 0;
  
  // Verificar se é gratuita
  if (text.toLowerCase().includes('gratuita') || text.toLowerCase().includes('grátis')) {
    return 0;
  }
  
  // Extrair valor numérico
  const match = text.match(/R\$\s*(\d+(?:,\d{2})?)/);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  
  return 0;
};

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
- **Taxa de Rescisão**: VALIDAÇÃO ESPECIAL - Verificar usando a seguinte lógica:
  * Se Taxa de Instalação = R$ 0,00 (gratuita) → Taxa de Rescisão = R$ 700,00
  * Se Taxa de Instalação = R$ 150,00 → Taxa de Rescisão = R$ 550,00
  * Se Taxa de Instalação = R$ 200,00 → Taxa de Rescisão = R$ 500,00
  * Se Taxa de Instalação = R$ 300,00 → Taxa de Rescisão = R$ 400,00
- **IP Fixo**: 
  - "INCLUSO": Apenas no contrato empresarial (Contrato 1)
  - "Variável": Todos os residenciais (cobrança de R$ 50,00 se fixo marcado)
- **Cláusulas**: TODOS os contratos devem ter cláusulas de 1 a 11

### 3. REGRA CRÍTICA - APENAS DIVERGÊNCIAS SÃO ERROS:

**ATENÇÃO: SÓ REPORTE COMO ERRO SE HOUVER DIFERENÇA REAL ENTRE OS VALORES**

ALGORITMO DE VALIDAÇÃO:
1. valor_contrato = extrair valor do contrato
2. valor_esperado = buscar valor na tabela de referência OU calcular usando regra especial (rescisão)
3. SE (valor_contrato == valor_esperado):
     → IGNORAR COMPLETAMENTE (não é erro)
     → NÃO incluir no resultado
   SENÃO:
     → É UM ERRO REAL
     → Incluir no array de erros

**REGRA ESPECIAL PARA TAXA DE RESCISÃO:**
- PRIMEIRA: Identifique o valor da Taxa de Instalação no contrato
- SEGUNDA: Use a tabela de cálculo para determinar o valor esperado da Taxa de Rescisão:
  * Taxa Instalação R$ 0,00 (gratuita) = Taxa Rescisão R$ 700,00
  * Taxa Instalação R$ 150,00 = Taxa Rescisão R$ 550,00
  * Taxa Instalação R$ 200,00 = Taxa Rescisão R$ 500,00
  * Taxa Instalação R$ 300,00 = Taxa Rescisão R$ 400,00
- TERCEIRA: Compare o valor encontrado no contrato com o valor calculado
- QUARTA: Só reporte erro se houver divergência

**REGRA ABSOLUTA**: 
- Valores IGUAIS = NÃO É ERRO = NÃO REPORTAR
- Valores DIFERENTES = É ERRO = REPORTAR

### 4. EXEMPLOS PRÁTICOS - TAXA DE RESCISÃO:

**CENÁRIO 1 - NÃO É ERRO:**
- Taxa Instalação no contrato: "GRATUITA"
- Taxa Rescisão no contrato: "R$ 700,00"
- Taxa Rescisão esperada (calculada): "R$ 700,00"
- RESULTADO: NÃO REPORTAR (valores iguais)

**CENÁRIO 2 - É ERRO:**
- Taxa Instalação no contrato: "R$ 200,00"
- Taxa Rescisão no contrato: "R$ 700,00"
- Taxa Rescisão esperada (calculada): "R$ 500,00"
- RESULTADO: REPORTAR ERRO (valores diferentes)

**CENÁRIO 3 - NÃO É ERRO:**
- Taxa Instalação no contrato: "R$ 150,00"
- Taxa Rescisão no contrato: "R$ 550,00"
- Taxa Rescisão esperada (calculada): "R$ 550,00"
- RESULTADO: NÃO REPORTAR (valores iguais)

### 5. EXEMPLOS PRÁTICOS - OUTROS CAMPOS:

**NUNCA REPORTE ESTES COMO ERRO (valores iguais):**
- Contrato: "R$ 109,99" | Tabela: "R$ 109,99" → NÃO É ERRO - IGNORAR
- Contrato: "12 meses" | Tabela: "12 meses" → NÃO É ERRO - IGNORAR
- Contrato: "RESIDENCIAL" | Tabela: "RESIDENCIAL" → NÃO É ERRO - IGNORAR

**APENAS REPORTE ESTES COMO ERRO (valores diferentes):**
- Contrato: "R$ 120,00" | Tabela: "R$ 109,99" → É ERRO - REPORTAR
- Contrato: "24 meses" | Tabela: "12 meses" → É ERRO - REPORTAR

### 6. INSTRUÇÕES OBRIGATÓRIAS:

**REGRA FUNDAMENTAL**: Só inclua no array de erros campos com DIVERGÊNCIA REAL

1. **PARA TAXA DE RESCISÃO**: Use SEMPRE a lógica de cálculo baseada na Taxa de Instalação
2. **COMPARE EXATAMENTE** os valores: contrato vs esperado (calculado ou tabela)
3. **SE FOREM IGUAIS**: NÃO inclua no resultado (não é erro)
4. **SE FOREM DIFERENTES**: Inclua no array de erros
5. **RESULTADO VAZIO []**: Quando TODOS os valores estão corretos
6. **STATUS "aprovado"**: Quando não há divergências reais

**IMPORTANTE**: O sistema está reportando valores corretos como erro. Isso está ERRADO. 
Apenas divergências devem ser reportadas.`;
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
- **RESCISÃO**: ${model.cancellation_fee} (CALCULAR conforme Taxa de Instalação)
- **IP FIXO**: ${model.fixed_ip}
- **CLÁUSULAS**: ${model.clauses}`;
  }).join('\n\n');

  return `## TABELA DE REFERÊNCIA DOS CONTRATOS CIABRASNET

${contractsText}

## TABELA DE CÁLCULO DA TAXA DE RESCISÃO

**REGRA ESPECIAL**: A Taxa de Rescisão deve ser calculada baseada na Taxa de Instalação:

| Taxa de Instalação | Fidelidade | Taxa de Rescisão Calculada |
|-------------------|------------|----------------------------|
| R$ 0,00 (gratuita) | Sim | R$ 700,00 |
| R$ 150,00 | Sim | R$ 550,00 |
| R$ 200,00 | Sim | R$ 500,00 |
| R$ 300,00 | Sim | R$ 400,00 |

**IMPORTANTE**: NÃO use o valor da rescisão da tabela de contratos. 
SEMPRE calcule baseado na Taxa de Instalação encontrada no contrato.`;
};
