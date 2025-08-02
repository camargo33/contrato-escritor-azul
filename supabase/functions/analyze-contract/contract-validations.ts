// 🔍 FASE 2: SISTEMA DE VALIDAÇÕES ESPECÍFICAS POR VELOCIDADE + EMPRESA
// Baseado nas regras definidas: telefone celular, IP fixo, equipamentos, etc.

export interface ValidationRule {
  field: string;
  type: 'format' | 'value' | 'presence' | 'calculation';
  description: string;
  validate: (value: any, contractData?: any) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  expected?: string;
  found?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ContractValidationResult {
  isValid: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
  info: ValidationResult[];
  validatedFields: string[];
  model_identified?: string;
  total_errors: number;
  total_warnings: number;
}

// 📱 VALIDAÇÃO DE TELEFONE CELULAR (9 DÍGITOS + COMEÇAR COM 9)
export const validateCellPhone = (phone: string): ValidationResult => {
  if (!phone) {
    return {
      valid: false,
      message: "Telefone celular não informado",
      severity: 'error'
    };
  }

  // Extrair apenas números
  const numbers = phone.replace(/[^0-9]/g, '');
  
  // Deve ter 11 dígitos (DDD + 9 dígitos do celular)
  if (numbers.length !== 11) {
    return {
      valid: false,
      message: `Telefone deve ter 11 dígitos (DDD + celular). Encontrado: ${numbers.length} dígitos`,
      found: phone,
      expected: "(XX) 9XXXX-XXXX",
      severity: 'error'
    };
  }

  // Verificar se o celular tem 9 dígitos e começa com 9
  const cellNumber = numbers.substring(2); // Remove DDD
  
  if (cellNumber.length !== 9) {
    return {
      valid: false,
      message: `Celular deve ter 9 dígitos. Encontrado: ${cellNumber.length}`,
      found: cellNumber,
      expected: "9XXXX-XXXX",
      severity: 'error'
    };
  }

  if (!cellNumber.startsWith('9')) {
    return {
      valid: false,
      message: "Celular deve começar com 9",
      found: cellNumber,
      expected: "9XXXX-XXXX (iniciando com 9)",
      severity: 'error'
    };
  }

  return {
    valid: true,
    message: "Telefone celular válido",
    severity: 'info'
  };
};

// 🌐 VALIDAÇÃO DE IP FIXO vs VARIÁVEL
export const validateIPConfiguration = (ipType: string, totalValue: number, baseValue: number): ValidationResult => {
  const ipTypeLower = ipType?.toLowerCase() || '';
  
  if (ipTypeLower.includes('fixo')) {
    // IP Fixo deve adicionar R$ 50,00 ao total
    const expectedTotal = baseValue + 50.00;
    const tolerance = 0.01; // Tolerância de 1 centavo
    
    if (Math.abs(totalValue - expectedTotal) > tolerance) {
      return {
        valid: false,
        message: "IP Fixo deve adicionar R$ 50,00 ao valor total",
        found: `R$ ${totalValue.toFixed(2)}`,
        expected: `R$ ${expectedTotal.toFixed(2)}`,
        severity: 'error'
      };
    }
    
    return {
      valid: true,
      message: "IP Fixo configurado corretamente (+R$ 50,00)",
      severity: 'info'
    };
  } else if (ipTypeLower.includes('variável') || ipTypeLower.includes('variavel')) {
    // IP Variável NÃO deve adicionar valor extra
    const tolerance = 0.01;
    
    if (Math.abs(totalValue - baseValue) > tolerance) {
      return {
        valid: false,
        message: "IP Variável não deve adicionar valor extra",
        found: `R$ ${totalValue.toFixed(2)}`,
        expected: `R$ ${baseValue.toFixed(2)}`,
        severity: 'warning'
      };
    }
    
    return {
      valid: true,
      message: "IP Variável configurado corretamente (sem taxa adicional)",
      severity: 'info'
    };
  }
  
  return {
    valid: false,
    message: "Tipo de IP não identificado (deve ser 'Fixo' ou 'Variável')",
    found: ipType,
    expected: "Fixo ou Variável",
    severity: 'error'
  };
};

// 🔧 VALIDAÇÃO DE EQUIPAMENTOS (PADRÃO + EXTRAS)
export const validateEquipment = (equipmentText: string, speed: string): ValidationResult => {
  const text = equipmentText.toLowerCase();
  
  // Equipamentos base obrigatórios
  const hasONU = text.includes('onu') || text.includes('ont');
  const hasAccessories = text.includes('conectores') || text.includes('cabos') || text.includes('acessórios');
  
  if (!hasONU) {
    return {
      valid: false,
      message: "Equipamento ONU/ONT obrigatório não encontrado",
      found: equipmentText,
      expected: "Deve incluir ONU ou ONT",
      severity: 'error'
    };
  }
  
  if (!hasAccessories) {
    return {
      valid: false,
      message: "Conectores/cabos obrigatórios não encontrados",
      found: equipmentText,
      expected: "Deve incluir conectores/cabos",
      severity: 'error'
    };
  }
  
  // Validações específicas por velocidade
  if (speed === '600mb') {
    const hasRouter = text.includes('roteador');
    const has700ONU = text.includes('700onu');
    
    if (!hasRouter) {
      return {
        valid: false,
        message: "Plano 600mb deve incluir ROTEADOR",
        found: equipmentText,
        expected: "ONU + ROTEADOR + Conectores/cabos",
        severity: 'error'
      };
    }
  }
  
  // Contar equipamentos extras (cada R$ 350,00)
  const equipmentMatches = text.match(/r\$\s*350[,.]?00/g);
  const extraEquipmentCount = equipmentMatches ? equipmentMatches.length - 1 : 0; // -1 porque ONU base é obrigatório
  
  return {
    valid: true,
    message: `Equipamentos validados. ${extraEquipmentCount > 0 ? `${extraEquipmentCount} equipamento(s) extra(s) identificado(s)` : 'Equipamentos base'}`,
    severity: 'info'
  };
};

// 💰 VALIDAÇÃO DE VALORES PADRÃO POR VELOCIDADE
export const validateServiceValues = (services: any, speed: string, company: string): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  // CNET Livros sempre R$ 29,90
  if (services.cnet_livros !== 'R$ 29,90') {
    results.push({
      valid: false,
      message: "CNET Livros deve ser sempre R$ 29,90",
      found: services.cnet_livros || 'Não informado',
      expected: 'R$ 29,90',
      severity: 'error'
    });
  } else {
    results.push({
      valid: true,
      message: "CNET Livros correto (R$ 29,90)",
      severity: 'info'
    });
  }
  
  // CNET Play sempre R$ 0,00
  if (services.cnet_play !== 'R$ 0,00') {
    results.push({
      valid: false,
      message: "CNET Play deve ser sempre R$ 0,00",
      found: services.cnet_play || 'Não informado',
      expected: 'R$ 0,00',
      severity: 'error'
    });
  } else {
    results.push({
      valid: true,
      message: "CNET Play correto (R$ 0,00)",
      severity: 'info'
    });
  }
  
  // Validações específicas por velocidade
  switch (speed) {
    case '300mb':
      if (services.suporte !== 'R$ 19,90') {
        results.push({
          valid: false,
          message: "Suporte para 300mb deve ser R$ 19,90",
          found: services.suporte || 'Não informado',
          expected: 'R$ 19,90',
          severity: 'error'
        });
      }
      break;
      
    case '500mb':
      if (services.suporte !== 'R$ 14,90') {
        results.push({
          valid: false,
          message: "Suporte para 500mb deve ser R$ 14,90",
          found: services.suporte || 'Não informado',
          expected: 'R$ 14,90',
          severity: 'error'
        });
      }
      break;
      
    case '700mb':
    case '800mb':
      // Planos avançados devem ter CNET Educa
      if (!services.cnet_educa || services.cnet_educa !== 'R$ 19,90') {
        results.push({
          valid: false,
          message: `Planos ${speed} devem incluir CNET Educa R$ 19,90`,
          found: services.cnet_educa || 'Não informado',
          expected: 'R$ 19,90',
          severity: 'error'
        });
      }
      
      if (speed === '700mb' && services.suporte !== 'R$ 9,90') {
        results.push({
          valid: false,
          message: "Suporte para 700mb deve ser R$ 9,90",
          found: services.suporte || 'Não informado',
          expected: 'R$ 9,90',
          severity: 'error'
        });
      }
      
      if (speed === '800mb' && services.suporte !== 'R$ 14,90') {
        results.push({
          valid: false,
          message: "Suporte para 800mb deve ser R$ 14,90",
          found: services.suporte || 'Não informado',
          expected: 'R$ 14,90',
          severity: 'error'
        });
      }
      break;
      
    case '1gb':
      if (!services.cnet_educa || services.cnet_educa !== 'R$ 19,90') {
        results.push({
          valid: false,
          message: "Plano 1GB deve incluir CNET Educa R$ 19,90",
          found: services.cnet_educa || 'Não informado',
          expected: 'R$ 19,90',
          severity: 'error'
        });
      }
      
      if (services.suporte !== 'R$ 14,90') {
        results.push({
          valid: false,
          message: "Suporte para 1GB deve ser R$ 14,90",
          found: services.suporte || 'Não informado',
          expected: 'R$ 14,90',
          severity: 'error'
        });
      }
      break;
  }
  
  return results;
};

// 🏢 VALIDAÇÃO DE EMPRESA vs DDD
export const validateCompanyDDD = (company: string, ddd: string): ValidationResult => {
  const companyLower = company.toLowerCase();
  const dddNumber = ddd.replace(/[^0-9]/g, '');
  
  if (companyLower.includes('ciabrasnet') || companyLower.includes('matriz')) {
    if (dddNumber !== '42') {
      return {
        valid: false,
        message: "CIABRASNET (Matriz) deve ter DDD 42 (Porto União)",
        found: `DDD ${dddNumber}`,
        expected: "DDD 42",
        severity: 'warning' // Warning porque pode ser um contrato para outra região
      };
    }
  } else if (companyLower.includes('wnkbr')) {
    if (dddNumber !== '47') {
      return {
        valid: false,
        message: "WNKBR deve ter DDD 47 (Papanduva)",
        found: `DDD ${dddNumber}`,
        expected: "DDD 47",
        severity: 'warning'
      };
    }
  }
  
  return {
    valid: true,
    message: "DDD compatível com a empresa",
    severity: 'info'
  };
};

// 📊 VALIDAÇÃO DE FIDELIDADE E DESCONTO
export const validateFidelityDiscount = (fidelityPeriod: string, cancellationFee: string): ValidationResult => {
  const text = cancellationFee.toLowerCase();
  
  if (fidelityPeriod === '12 meses' || fidelityPeriod === '24 meses') {
    if (!text.includes('700') && !text.includes('desconto')) {
      return {
        valid: false,
        message: "Contratos com fidelidade devem ter desconto de R$ 700,00",
        found: cancellationFee,
        expected: "R$ 700,00 descontados proporcionalmente",
        severity: 'error'
      };
    }
  }
  
  return {
    valid: true,
    message: "Regra de fidelidade correta",
    severity: 'info'
  };
};

// 🎯 FUNÇÃO PRINCIPAL DE VALIDAÇÃO
export const validateContract = (contractData: any, identifiedModel?: any): ContractValidationResult => {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];
  const info: ValidationResult[] = [];
  const validatedFields: string[] = [];
  
  // 1. Validar telefone celular
  if (contractData.cellPhone) {
    const phoneResult = validateCellPhone(contractData.cellPhone);
    if (phoneResult.severity === 'error') errors.push(phoneResult);
    else if (phoneResult.severity === 'warning') warnings.push(phoneResult);
    else info.push(phoneResult);
    validatedFields.push('cellPhone');
  }
  
  // 2. Validar IP Fixo vs Variável
  if (contractData.ipType && contractData.totalValue && contractData.baseValue) {
    const ipResult = validateIPConfiguration(contractData.ipType, contractData.totalValue, contractData.baseValue);
    if (ipResult.severity === 'error') errors.push(ipResult);
    else if (ipResult.severity === 'warning') warnings.push(ipResult);
    else info.push(ipResult);
    validatedFields.push('ipConfiguration');
  }
  
  // 3. Validar equipamentos
  if (contractData.equipment && contractData.speed) {
    const equipmentResult = validateEquipment(contractData.equipment, contractData.speed);
    if (equipmentResult.severity === 'error') errors.push(equipmentResult);
    else if (equipmentResult.severity === 'warning') warnings.push(equipmentResult);
    else info.push(equipmentResult);
    validatedFields.push('equipment');
  }
  
  // 4. Validar valores de serviços
  if (contractData.services && contractData.speed && contractData.company) {
    const serviceResults = validateServiceValues(contractData.services, contractData.speed, contractData.company);
    serviceResults.forEach(result => {
      if (result.severity === 'error') errors.push(result);
      else if (result.severity === 'warning') warnings.push(result);
      else info.push(result);
    });
    validatedFields.push('services');
  }
  
  // 5. Validar empresa vs DDD
  if (contractData.company && contractData.ddd) {
    const dddResult = validateCompanyDDD(contractData.company, contractData.ddd);
    if (dddResult.severity === 'error') errors.push(dddResult);
    else if (dddResult.severity === 'warning') warnings.push(dddResult);
    else info.push(dddResult);
    validatedFields.push('companyDDD');
  }
  
  // 6. Validar fidelidade
  if (contractData.fidelityPeriod && contractData.cancellationFee) {
    const fidelityResult = validateFidelityDiscount(contractData.fidelityPeriod, contractData.cancellationFee);
    if (fidelityResult.severity === 'error') errors.push(fidelityResult);
    else if (fidelityResult.severity === 'warning') warnings.push(fidelityResult);
    else info.push(fidelityResult);
    validatedFields.push('fidelity');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    validatedFields,
    model_identified: identifiedModel?.id || 'Não identificado',
    total_errors: errors.length,
    total_warnings: warnings.length
  };
};

// 📋 LISTA DE TODAS AS VALIDAÇÕES DISPONÍVEIS
export const AVAILABLE_VALIDATIONS = [
  'cellPhone',
  'ipConfiguration', 
  'equipment',
  'services',
  'companyDDD',
  'fidelity'
] as const;

// 📊 RESUMO DE VALIDAÇÕES
export const getValidationSummary = (result: ContractValidationResult) => {
  return {
    status: result.isValid ? 'APROVADO' : 'REPROVADO',
    total_checks: result.validatedFields.length,
    errors: result.total_errors,
    warnings: result.total_warnings,
    info_messages: result.info.length,
    model_used: result.model_identified,
    fields_validated: result.validatedFields
  };
};
