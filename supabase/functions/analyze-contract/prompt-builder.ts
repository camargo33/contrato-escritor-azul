
import { createIdentificationInstructions } from './identification-patterns.ts';
import { createValidationInstructions, createContractReferenceTable } from './validation-rules.ts';
import { createResponseFormatInstructions } from './response-format.ts';
import { createFidelityValidationExamples, createImplementationInstructions } from './fidelity-examples.ts';

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

### 8. INSTRUÇÕES ESPECIAIS PARA TAXA DE RESCISÃO:

**REGRA ABSOLUTA**: A validação da taxa de rescisão DEVE seguir esta lógica obrigatória:

1. **DETECTAR FIDELIDADE PRIMEIRO:**
   - Procure especificamente por "DA OPÇÃO DE FIDELIDADE" ou seções similares
   - Identifique se há "SIM (X)", "SIM X", "[X] SIM" marcado
   - Se não encontrar evidência clara de marcação, assuma que NÃO está marcado

2. **EXTRAIR TAXA REAL DE INSTALAÇÃO:**
   - **CRÍTICO**: Use a taxa de instalação REAL do contrato, NÃO da tabela de referência
   - Procure por "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ X,XX"
   - Padrões: "Taxa de Instalação: R$ X,XX", "GRATUITA", "R$ 0,00"

3. **CALCULAR TAXA ESPERADA (com valor REAL):**
   - **COM fidelidade marcada**: 
     - Taxa instalação REAL > 0: Taxa rescisão = 700 - valor_real_instalação
     - Taxa gratuita: Taxa rescisão = R$ 700,00
   - **SEM fidelidade marcada**: Taxa rescisão = SEMPRE R$ 700,00

4. **VALIDAR CONTRA O CALCULADO:**
   - Compare o valor encontrado no contrato com o valor CALCULADO usando taxa REAL
   - Só reporte erro se o valor do contrato ≠ valor calculado baseado na fidelidade e taxa real

**EXEMPLO REAL (CORREÇÃO):**
- Fidelidade: SIM (X) + Taxa REAL: R$ 120,00 → Rescisão esperada: R$ 580,00 (700-120)
- Fidelidade: SIM (X) + Taxa REAL: R$ 200,00 → Rescisão esperada: R$ 500,00 (700-200)
- Fidelidade: NÃO + Qualquer taxa → Rescisão esperada: R$ 700,00

${createFidelityValidationExamples()}

${createImplementationInstructions()}

Analise o contrato fornecido identificando PRIMEIRO o modelo e depois validando todos os campos conforme a tabela de referência do modelo identificado.

**Contrato para análise:**
${contractText}`;
};
