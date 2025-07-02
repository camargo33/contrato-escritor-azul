
import { createIdentificationInstructions } from './identification-patterns.ts';
import { createValidationInstructions, createContractReferenceTable } from './validation-rules.ts';
import { createResponseFormatInstructions } from './response-format.ts';

export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# PROMPT PARA ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Sua primeira tarefa é IDENTIFICAR qual dos 6 modelos de contrato está sendo analisado. Somente após a identificação, você deve analisar APENAS os campos destacados/grifados nos contratos, focando exclusivamente em inconsistências, erros de digitação e problemas de formatação dos campos importantes.

**ATENÇÃO ESPECIAL**: Para a Taxa de Rescisão, você DEVE primeiro verificar se a opção "Fidelidade" está marcada como SIM no contrato antes de calcular o valor esperado.

${createIdentificationInstructions()}

${createContractReferenceTable()}

${createValidationInstructions()}

${createResponseFormatInstructions()}

### 7. INSTRUÇÕES FINAIS:

1. **SEMPRE IDENTIFIQUE PRIMEIRO** qual dos 6 contratos está sendo analisado
2. **USE A CONFIANÇA** para indicar certeza na identificação (0-100%)
3. **BASEIE TODAS AS VALIDAÇÕES** no modelo identificado
4. **PARA TAXA DE RESCISÃO**: Detecte PRIMEIRO se fidelidade está marcada, depois calcule
5. **INCLUA AS CARACTERÍSTICAS ESPERADAS** do modelo na resposta
6. **SEJA ESPECÍFICO** nas sugestões baseadas no modelo identificado
7. **INDIQUE INCERTEZA** quando não conseguir identificar com confiança
8. **SEMPRE INCLUA** o campo "modelo_identificado" na resposta JSON
9. **NOVA REGRA**: Sempre mencione se detectou fidelidade marcada ou não na análise

Analise o contrato fornecido identificando PRIMEIRO o modelo, SEGUNDO se a fidelidade está marcada, e depois validando todos os campos conforme a nova lógica de fidelidade para rescisão.

**Contrato para análise:**
${contractText}`;
};
