
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

### 2.1. VALIDAÇÃO DA TAXA DE RESCISÃO - LÓGICA CORRIGIDA COM FIDELIDADE:

**TABELA DE REFERÊNCIA OBRIGATÓRIA:**
```
| Valor Taxa de Instalação | Fidelidade | Taxa de Rescisão Calculada |
|-------------------------|-----------|---------------------------|
| R$ 0,00 (gratuita)     | Sim       | R$ 700,00                |
| R$ 120,00              | Sim       | R$ 580,00                |
| R$ 150,00              | Sim       | R$ 550,00                |
| R$ 200,00              | Sim       | R$ 500,00                |
| R$ 300,00              | Sim       | R$ 400,00                |
| Qualquer valor         | Não       | R$ 700,00                |
```

**REGRA ABSOLUTA**: A taxa de rescisão SEMPRE é R$ 700,00 menos o valor da taxa de instalação quando fidelidade está marcada.

**ETAPA 1 - DETECTAR FIDELIDADE:**
1. Procurar na seção "DA OPÇÃO DE FIDELIDADE" por "SIM (X)" marcado
2. Padrões específicos:
   - "DA OPÇÃO DE FIDELIDADE: SIM (X) NÃO ( )"
   - "SIM (X)" na seção de fidelidade
   - Qualquer marcação clara do SIM

**ETAPA 2 - EXTRAIR TAXA DE INSTALAÇÃO COM FIDELIDADE:**
⚠️ **CRÍTICO**: Use APENAS a taxa específica da linha de fidelidade!

Procurar ESPECIFICAMENTE por:
- "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ X,XX"
- Ignorar sufixos como "Av" após o valor
- Focar no valor exato desta linha específica

**ETAPA 3 - APLICAR LÓGICA SIMPLES:**

**SE FIDELIDADE = SIM (marcada):**
- Taxa Rescisão = R$ 700,00 - Taxa Instalação da Linha de Fidelidade
- Exemplo: Linha de Fidelidade R$ 120,00 → Rescisão = R$ 580,00 (700 - 120)
- NUNCA usar valores de outras linhas ou tabelas de referência

**SE FIDELIDADE = NÃO (não marcada):**
- Taxa Rescisão = SEMPRE R$ 700,00
- Não considerar nenhuma taxa de instalação

**VALIDAÇÃO FINAL:**
- SÓ reportar erro se: Valor no contrato ≠ Valor calculado pela lógica acima
- Se Fidelidade SIM + Taxa R$ 120,00: Esperar R$ 580,00 no contrato
- Se no contrato mostra R$ 580,00 → NÃO É ERRO

- **IP Fixo**: 
  - "INCLUSO": Apenas no contrato empresarial (Contrato 1)
  - "Variável": Todos os residenciais (cobrança de R$ 50,00 se fixo marcado)
- **Cláusulas**: TODOS os contratos devem ter cláusulas de 1 a 11

### 3. REGRA CRÍTICA - APENAS DIVERGÊNCIAS SÃO ERROS:

**ATENÇÃO: SÓ REPORTE COMO ERRO SE HOUVER DIFERENÇA REAL ENTRE OS VALORES**

ALGORITMO DE VALIDAÇÃO:
1. valor_contrato = extrair valor do contrato
2. valor_tabela = buscar valor na tabela de referência
3. SE (valor_contrato == valor_tabela):
     → IGNORAR COMPLETAMENTE (não é erro)
     → NÃO incluir no resultado
   SENÃO:
     → É UM ERRO REAL
     → Incluir no array de erros

**REGRA ABSOLUTA**: 
- Valores IGUAIS = NÃO É ERRO = NÃO REPORTAR
- Valores DIFERENTES = É ERRO = REPORTAR

### 4. EXEMPLOS PRÁTICOS - O QUE NÃO REPORTAR:

**NUNCA REPORTE ESTES COMO ERRO (valores iguais):**
- Contrato: "R$ 109,99" | Tabela: "R$ 109,99" → NÃO É ERRO - IGNORAR
- Contrato: "12 meses" | Tabela: "12 meses" → NÃO É ERRO - IGNORAR
- Contrato: "RESIDENCIAL" | Tabela: "RESIDENCIAL" → NÃO É ERRO - IGNORAR
- Contrato: "R$ 200,00" | Tabela: "R$ 200,00" → NÃO É ERRO - IGNORAR
- Contrato: "Variável (R$ 50,00 se fixo)" | Tabela: "Variável (R$ 50,00 se fixo)" → NÃO É ERRO - IGNORAR

**APENAS REPORTE ESTES COMO ERRO (valores diferentes):**
- Contrato: "R$ 120,00" | Tabela: "R$ 109,99" → É ERRO - REPORTAR
- Contrato: "24 meses" | Tabela: "12 meses" → É ERRO - REPORTAR
- Contrato: "CORPORATIVO" | Tabela: "RESIDENCIAL" → É ERRO - REPORTAR

### 5. INSTRUÇÕES OBRIGATÓRIAS:

**REGRA FUNDAMENTAL**: Só inclua no array de erros campos com DIVERGÊNCIA REAL

1. **COMPARE EXATAMENTE** os valores: contrato vs tabela
2. **SE FOREM IGUAIS**: NÃO inclua no resultado (não é erro)
3. **SE FOREM DIFERENTES**: Inclua no array de erros
4. **RESULTADO VAZIO []**: Quando TODOS os valores estão corretos
5. **STATUS "aprovado"**: Quando não há divergências reais

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
- **RESCISÃO**: ${model.cancellation_fee}
- **IP FIXO**: ${model.fixed_ip}
- **CLÁUSULAS**: ${model.clauses}`;
  }).join('\n\n');

  return `## TABELA DE REFERÊNCIA DOS CONTRATOS CIABRASNET

${contractsText}`;
};
