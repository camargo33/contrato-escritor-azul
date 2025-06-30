
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
  return `## ETAPA 2: CAMPOS ESPECÍFICOS PARA ANALISAR (APÓS IDENTIFICAÇÃO):

### 1. DADOS DO ASSINANTE:
${VALIDATION_FIELDS.map(field => 
  `- **${field.name}**: ${field.description}`
).join('\n')}

### 2. VALIDAÇÕES ESPECÍFICAS BASEADAS NO MODELO IDENTIFICADO:
- **Identificação do Plano**: Comparar com a tabela de referência
- **Valor do Plano**: DEVE ser exatamente o valor especificado na tabela
- **Prazo de Vigência**: 
  - CORPORATIVO (1 Gb Empresarial): 24 meses
  - RESIDENCIAL (todos os outros): 12 meses
- **Tipo de Plano**: Apenas "1 Gb Empresarial" é corporativo, todos os outros são residenciais
- **Taxa de Instalação**: Verificar conforme tabela de referência
- **Equipamentos**: Verificar valores exatos conforme tabela
- **Rescisão**: Verificar valores conforme tabela de referência
- **IP Fixo**: 
  - "INCLUSO": Apenas no contrato empresarial (Contrato 1)
  - "Variável": Todos os residenciais (cobrança de R$ 50,00 se fixo marcado)
- **Cláusulas**: TODOS os contratos devem ter cláusulas de 1 a 11

### 3. 🚨 REGRA CRÍTICA - APENAS DIVERGÊNCIAS SÃO ERROS:

**ATENÇÃO: SÓ REPORTE COMO ERRO SE HOUVER DIFERENÇA REAL ENTRE OS VALORES**

\`\`\`
ALGORITMO DE VALIDAÇÃO:
1. valor_contrato = [extrair valor do contrato]
2. valor_tabela = [buscar valor na tabela de referência]
3. SE (valor_contrato == valor_tabela):
     → IGNORAR COMPLETAMENTE (não é erro)
     → NÃO incluir no resultado
   SENÃO:
     → É UM ERRO REAL
     → Incluir no array de erros
\`\`\`

**REGRA ABSOLUTA**: 
- ✅ Valores IGUAIS = NÃO É ERRO = NÃO REPORTAR
- ❌ Valores DIFERENTES = É ERRO = REPORTAR

### 4. EXEMPLOS PRÁTICOS - O QUE NÃO REPORTAR:

**🚫 NUNCA REPORTE ESTES COMO ERRO (valores iguais):**
- Contrato: "R$ 109,99" | Tabela: "R$ 109,99" → **NÃO É ERRO - IGNORAR**
- Contrato: "12 meses" | Tabela: "12 meses" → **NÃO É ERRO - IGNORAR**  
- Contrato: "RESIDENCIAL" | Tabela: "RESIDENCIAL" → **NÃO É ERRO - IGNORAR**
- Contrato: "R$ 200,00" | Tabela: "R$ 200,00" → **NÃO É ERRO - IGNORAR**
- Contrato: "Variável (R$ 50,00 se fixo)" | Tabela: "Variável (R$ 50,00 se fixo)" → **NÃO É ERRO - IGNORAR**

**✅ APENAS REPORTE ESTES COMO ERRO (valores diferentes):**
- Contrato: "R$ 120,00" | Tabela: "R$ 109,99" → **É ERRO - REPORTAR**
- Contrato: "24 meses" | Tabela: "12 meses" → **É ERRO - REPORTAR**
- Contrato: "CORPORATIVO" | Tabela: "RESIDENCIAL" → **É ERRO - REPORTAR**

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
  return `## TABELA DE REFERÊNCIA DOS CONTRATOS CIABRASNET

${CONTRACT_MODELS.map((model, index) => `### CONTRATO ${index + 1} - ${model.name}
- **PLANO**: ${model.name}
- **VALOR**: ${model.value} (VALOR FIXO)
- **PRAZO VIGÊNCIA**: ${model.validity_period}
- **TIPO**: ${model.type}
- **TAXA INSTALAÇÃO**: ${model.installation_fee}
- **EQUIPAMENTOS**: ${model.equipment}
- **RESCISÃO**: ${model.cancellation_fee}
- **IP FIXO**: ${model.fixed_ip}
- **CLÁUSULAS**: ${model.clauses}`).join('\n\n')}`;
};
