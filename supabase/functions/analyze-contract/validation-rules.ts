
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

### 3. ⚠️ REGRA CRÍTICA DE VALIDAÇÃO:

**ANTES DE REPORTAR QUALQUER ERRO, FAÇA ESTA VERIFICAÇÃO:**

\`\`\`
Para cada campo analisado:
  valor_encontrado = [extrair do contrato]
  valor_esperado = [buscar na tabela de referência]
  
  SE (valor_encontrado === valor_esperado):
    → Campo está CORRETO
    → NÃO incluir no array "erros"
  SENÃO:
    → Campo tem ERRO
    → Incluir no array "erros" com severidade apropriada
\`\`\`

### 4. EXEMPLOS PRÁTICOS DE VALIDAÇÃO:

**✅ CENÁRIO: Valores CORRETOS (não reportar como erro)**
- Contrato: "Prazo: 12 meses" / Tabela: "12 meses" → **NÃO É ERRO**
- Contrato: "Taxa: R$ 200,00" / Tabela: "R$ 200,00" → **NÃO É ERRO**
- Contrato: "Valor: R$ 129,99" / Tabela: "R$ 129,99" → **NÃO É ERRO**

**❌ CENÁRIO: Valores INCORRETOS (reportar como erro)**
- Contrato: "Prazo: 24 meses" / Tabela: "12 meses" → **É ERRO - incluir**
- Contrato: "Taxa: GRATUITA" / Tabela: "R$ 200,00" → **É ERRO - incluir**
- Contrato: "Valor: R$ 120,00" / Tabela: "R$ 129,99" → **É ERRO - incluir**

### 5. INSTRUÇÕES FINAIS:

1. **COMPARE EXATAMENTE** cada valor encontrado com o valor esperado da tabela
2. **SÓ REPORTE COMO ERRO** quando houver diferença real entre os valores
3. **VALORES IGUAIS** nunca devem ser incluídos no array de erros
4. **STATUS "aprovado"** quando não há diferenças reais encontradas
5. **ARRAY VAZIO** [] quando todos os valores estão corretos

**LEMBRE-SE: O objetivo é encontrar ERROS REAIS, não confirmar valores corretos.**`;
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
