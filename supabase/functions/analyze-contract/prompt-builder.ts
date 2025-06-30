
import { createIdentificationInstructions } from './identification-patterns.ts';
import { createValidationInstructions, createContractReferenceTable } from './validation-rules.ts';
import { createResponseFormatInstructions } from './response-format.ts';

export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# PROMPT PARA ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Sua primeira tarefa é IDENTIFICAR qual dos 6 modelos de contrato está sendo analisado. Somente após a identificação, você deve analisar APENAS os campos destacados/grifados nos contratos, focando exclusivamente em inconsistências, erros de digitação e problemas de formatação dos campos importantes.

${createIdentificationInstructions()}

${createContractReferenceTable()}

${createValidationInstructions()}

${createResponseFormatInstructions()}

### 7. INSTRUÇÕES FINAIS:

1. **SEMPRE IDENTIFIQUE PRIMEIRO** qual dos 6 contratos está sendo analisado
2. **USE A CONFIANÇA** para indicar certeza na identificação (0-100%)
3. **BASEIE TODAS AS VALIDAÇÕES** no modelo identificado
4. **INCLUA AS CARACTERÍSTICAS ESPERADAS** do modelo na resposta
5. **SEJA ESPECÍFICO** nas sugestões baseadas no modelo identificado
6. **INDIQUE INCERTEZA** quando não conseguir identificar com confiança
7. **SEMPRE INCLUA** o campo "modelo_identificado" na resposta JSON

Analise o contrato fornecido identificando PRIMEIRO o modelo e depois validando todos os campos conforme a tabela de referência do modelo identificado.

**Contrato para análise:**
${contractText}`;
};
