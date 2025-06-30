
export interface IdentificationPattern {
  modelId: string;
  patterns: string[];
  valuePattern: string;
  keywords: string[];
}

export const IDENTIFICATION_PATTERNS: IdentificationPattern[] = [
  {
    modelId: 'empresarial_1gb',
    patterns: ['1 Gb', 'Empresarial', 'Corporativo'],
    valuePattern: '229,90',
    keywords: ['empresarial', '1gb', 'corporativo']
  },
  {
    modelId: 'combo_giga_2024',
    patterns: ['Combo Giga', 'Giga'],
    valuePattern: '209,99',
    keywords: ['combo giga', 'giga', '2024']
  },
  {
    modelId: 'combo_300mbps_2024',
    patterns: ['300', '300Mbps'],
    valuePattern: '109,99',
    keywords: ['300', '300mbps', 'combo']
  },
  {
    modelId: 'combo_500_megas_2025',
    patterns: ['500', 'MATRIZ', '2025'],
    valuePattern: '119,99',
    keywords: ['500', 'matriz', '2025', 'megas']
  },
  {
    modelId: 'combo_600mbps_2024',
    patterns: ['600', '600Mbps'],
    valuePattern: '129,99',
    keywords: ['600', '600mbps', 'combo']
  },
  {
    modelId: 'combo_800mbps_2024',
    patterns: ['800', '800Mbps'],
    valuePattern: '159,99',
    keywords: ['800', '800mbps', 'combo']
  }
];

export const createIdentificationInstructions = (): string => {
  return `
## ETAPA 1: IDENTIFICAÇÃO DO MODELO DE CONTRATO

Antes de qualquer análise, você DEVE identificar qual dos 6 modelos de contrato está sendo analisado:

### PADRÕES DE IDENTIFICAÇÃO:
${IDENTIFICATION_PATTERNS.map(pattern => 
  `- **${pattern.modelId}**: Busque por ${pattern.patterns.map(p => `"${p}"`).join(', ')}, valor "${pattern.valuePattern}"`
).join('\n')}

### INSTRUÇÕES DE IDENTIFICAÇÃO:
1. **SEMPRE IDENTIFIQUE PRIMEIRO** qual dos 6 contratos está sendo analisado
2. **USE A CONFIANÇA** para indicar certeza na identificação (0-100%)
3. **BASEIE TODAS AS VALIDAÇÕES** no modelo identificado
4. **INCLUA AS CARACTERÍSTICAS ESPERADAS** do modelo na resposta
5. **SEJA ESPECÍFICO** nas sugestões baseadas no modelo identificado
6. **INDIQUE INCERTEZA** quando não conseguir identificar com confiança
7. **SEMPRE INCLUA** o campo "modelo_identificado" na resposta JSON
`;
};
