
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
  return `
## ETAPA 2: CAMPOS ESPECÍFICOS PARA ANALISAR (APÓS IDENTIFICAÇÃO):

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

### 3. VALIDAÇÕES CRÍTICAS BASEADAS NO MODELO:

**Erros de Identificação de Plano:**
- Plano não corresponde aos 6 tipos cadastrados
- Valor incorreto para o tipo de plano identificado
- Tipo de plano (residencial/corporativo) incorreto

**Inconsistências de Configuração:**
- Prazo de vigência incorreto para o tipo de plano
- Taxa de instalação incorreta para o plano específico
- Valores de equipamentos diferentes dos padrões
- IP fixo configurado incorretamente

**Validações Cruzadas:**
- Se corporativo, deve ser 24 meses e IP fixo incluso
- Se residencial, deve ser 12 meses e IP variável
- Taxa de instalação deve corresponder ao plano específico
- Valor de rescisão deve corresponder ao padrão do plano
`;
};

export const createContractReferenceTable = (): string => {
  return `
## TABELA DE REFERÊNCIA DOS CONTRATOS CIABRASNET

${CONTRACT_MODELS.map((model, index) => `
### CONTRATO ${index + 1} - ${model.name}
- **PLANO**: ${model.name}
- **VALOR**: ${model.value} (VALOR FIXO)
- **PRAZO VIGÊNCIA**: ${model.validity_period}
- **TIPO**: ${model.type}
- **TAXA INSTALAÇÃO**: ${model.installation_fee}
- **EQUIPAMENTOS**: ${model.equipment}
- **RESCISÃO**: ${model.cancellation_fee}
- **IP FIXO**: ${model.fixed_ip}
- **CLÁUSULAS**: ${model.clauses}
`).join('\n')}
`;
};
