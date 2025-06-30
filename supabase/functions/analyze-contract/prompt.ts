
import { buildContractAnalysisPrompt } from './prompt-builder.ts';

export const createContractAnalysisPrompt = (contractText: string): string => {
  return buildContractAnalysisPrompt(contractText);
};
