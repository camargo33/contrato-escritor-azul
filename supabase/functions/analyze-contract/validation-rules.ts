
import { calculateExpectedCancellationFee, detectFidelityOption } from './cancellation-fee-calculator.ts';
import { createValidationInstructions, createContractReferenceTable } from './validation-instructions.ts';
import { VALIDATION_FIELDS, ValidationField } from './validation-fields.ts';

// Re-export everything to maintain backward compatibility
export { 
  calculateExpectedCancellationFee, 
  detectFidelityOption,
  createValidationInstructions,
  createContractReferenceTable,
  VALIDATION_FIELDS,
  ValidationField
};
