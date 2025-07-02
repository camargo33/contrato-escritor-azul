
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

### 8. TABELA DE REFERÊNCIA OFICIAL PARA TAXA DE RESCISÃO:

| Valor Taxa de Instalação | Fidelidade | Taxa de Rescisão Calculada |
|-------------------------|-----------|---------------------------|
| R$ 0,00 (gratuita)     | Sim       | R$ 700,00                |
| R$ 120,00              | Sim       | R$ 580,00                |
| R$ 150,00              | Sim       | R$ 550,00                |
| R$ 200,00              | Sim       | R$ 500,00                |
| R$ 300,00              | Sim       | R$ 400,00                |
| Qualquer valor         | Não       | R$ 700,00                |

### 9. INSTRUÇÕES CRÍTICAS PARA TAXA DE RESCISÃO:

**REGRA ABSOLUTA**: Taxa de rescisão SEMPRE = R$ 700,00 menos o valor da taxa de instalação (quando fidelidade marcada).

1. **DETECTAR FIDELIDADE:**
   - Procure por "DA OPÇÃO DE FIDELIDADE" com "SIM (X)" marcado
   - Se SIM está marcado com (X) → Fidelidade = TRUE
   - Se NÃO está marcado ou não encontrado → Fidelidade = FALSE

2. **EXTRAIR TAXA DE INSTALAÇÃO DA LINHA DE FIDELIDADE:**
   - **OBRIGATÓRIO**: Use APENAS a linha específica: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ X,XX"
   - Ignore sufixos como "Av" após o valor (ex: "R$ 120,00 Av" = R$ 120,00)
   - NÃO use valores de outras linhas ou tabelas

3. **CALCULAR TAXA ESPERADA SEGUINDO A TABELA OFICIAL:**
   - **SE Fidelidade = TRUE**: Taxa rescisão = 700 - taxa_instalação_linha_fidelidade
   - **SE Fidelidade = FALSE**: Taxa rescisão = R$ 700,00 (fixo)

4. **VALIDAR:**
   - SÓ reporte erro se valor no contrato ≠ valor calculado
   - Exemplo: Fidelidade SIM + Linha R$ 120,00 → Esperado R$ 580,00
   - Se contrato mostra R$ 580,00 → NÃO É ERRO

**CASOS ESPECÍFICOS CONFORME TABELA:**
- Fidelidade: SIM (X) + Linha Fidelidade: R$ 0,00 → Rescisão esperada: R$ 700,00
- Fidelidade: SIM (X) + Linha Fidelidade: R$ 120,00 → Rescisão esperada: R$ 580,00
- Fidelidade: SIM (X) + Linha Fidelidade: R$ 150,00 → Rescisão esperada: R$ 550,00
- Fidelidade: SIM (X) + Linha Fidelidade: R$ 200,00 → Rescisão esperada: R$ 500,00
- Fidelidade: SIM (X) + Linha Fidelidade: R$ 300,00 → Rescisão esperada: R$ 400,00
- Fidelidade: NÃO ou ausente → Rescisão esperada: R$ 700,00

${createFidelityValidationExamples()}

${createImplementationInstructions()}

Analise o contrato fornecido identificando PRIMEIRO o modelo e depois validando todos os campos conforme a tabela de referência do modelo identificado.

**Contrato para análise:**
${contractText}`;
};
