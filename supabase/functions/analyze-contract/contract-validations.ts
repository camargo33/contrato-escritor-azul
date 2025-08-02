// 🔍 FASE 2: VALIDAÇÕES CORRIGIDAS - SER CONSERVADOR E PRECISO
// CORREÇÃO: Telefone (42) 98833-3039 é VÁLIDO, não inventar erros

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

// 📱 VALIDAÇÃO CORRIGIDA DE TELEFONE CELULAR
export const validateCellPhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      message: "Telefone celular não informado",
      severity: 'error'
    };
  }

  // Extrair apenas números (remover espaços, parênteses, hífens)
  const numbers = phone.replace(/[^0-9]/g, '');
  
  // Log para debug
  console.log(`🔍 Validando telefone: "${phone}" → números: "${numbers}"`);
  
  // Deve ter exatamente 11 dígitos (DDD + 9 dígitos do celular)
  if (numbers.length !== 11) {
    return {
      valid: false,
      message: `Telefone deve ter 11 dígitos total (DDD + celular). Encontrado: ${numbers.length} dígitos`,
      found: phone,
      expected: "(XX) 9XXXX-XXXX",
      severity: 'error'
    };
  }

  // Extrair DDD e número do celular
  const ddd = numbers.substring(0, 2);      // Primeiros 2 dígitos
  const cellNumber = numbers.substring(2);  // Últimos 9 dígitos
  
  console.log(`📱 DDD: "${ddd}", Celular: "${cellNumber}"`);

  // Verificar se o número do celular tem exatamente 9 dígitos
  if (cellNumber.length !== 9) {
    return {
      valid: false,
      message: `Número do celular deve ter 9 dígitos. Encontrado: ${cellNumber.length} dígitos`,
      found: `${cellNumber} (${cellNumber.length} dígitos)`,
      expected: "9XXXX-XXXX (9 dígitos)",
      severity: 'error'
    };
  }

  // Verificar se o celular começa com 9 (padrão brasileiro)
  if (!cellNumber.startsWith('9')) {
    return {
      valid: false,
      message: "Número de celular deve começar com 9",
      found: `${cellNumber} (inicia com ${cellNumber[0]})`,
      expected: "9XXXX-XXXX (deve iniciar com 9)",
      severity: 'error'
    };
  }

  // Verificar se o DDD é válido (11-99)
  const dddNumber = parseInt(ddd);
  if (dddNumber < 11 || dddNumber > 99) {
    return {
      valid: false,
      message: "DDD inválido - deve estar entre 11 e 99",
      found: `DDD ${ddd}`,
      expected: "DDD entre 11 e 99",
      severity: 'error'
    };
  }

  // ✅ TELEFONE VÁLIDO!
  console.log(`✅ Telefone válido: DDD ${ddd}, Celular ${cellNumber}`);
  
  return {
    valid: true,
    message: `Telefone celular válido: (${ddd}) ${cellNumber.substring(0,5)}-${cellNumber.substring(5)}`,
    severity: 'info'
  };
};

// 🧪 FUNÇÃO DE TESTE PARA TELEFONES
export const testCellPhoneValidation = () => {
  const testCases = [
    { phone: "(42) 98833-3039", expected: true, description: "Número real do usuário" },
    { phone: "(42) 99955-4936", expected: true, description: "Exemplo válido" },
    { phone: "(47) 91234-5678", expected: true, description: "WNKBR válido" },
    { phone: "(42) 8833-3039", expected: false, description: "Sem 9 inicial - inválido" },
    { phone: "(42) 988333039", expected: true, description: "Sem hífen - válido" },
    { phone: "42988333039", expected: true, description: "Sem formatação - válido" },
    { phone: "(42) 988333-0393", expected: false, description: "10 dígitos - inválido" }
  ];

  console.log("🧪 Testando validação de telefones:");
  testCases.forEach(test => {
    const result = validateCellPhone(test.phone);
    const passed = result.valid === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.phone} → ${result.valid} (esperado: ${test.expected}) - ${test.description}`);
    if (!passed) {
      console.log(`   Mensagem: ${result.message}`);
    }
  });
};

// 🌐 VALIDAÇÃO DE IP FIXO vs VARIÁVEL (MANTIDA)
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
    valid: true, // MUDANÇA: Não reportar erro se tipo não identificado
    message: "Tipo de IP não identificado claramente - assumindo válido",
    found: ipType,
    severity: 'info'
  };
};

// 🔧 VALIDAÇÃO CONSERVADORA DE EQUIPAMENTOS
export const validateEquipment = (equipmentText: string, speed: string): ValidationResult => {
  if (!equipmentText || equipmentText.trim() === '') {
    return {
      valid: true, // CONSERVADOR: Não reportar erro se não conseguir identificar
      message: "Seção de equipamentos não identificada claramente",
      severity: 'info'
    };
  }

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
  
  // Validações específicas por velocidade (apenas se speed for identificado)
  if (speed === '600mb') {
    const hasRouter = text.includes('roteador');
    
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
  
  return {
    valid: true,
    message: "Equipamentos identificados corretamente",
    severity: 'info'
  };
};

// 💰 VALIDAÇÃO CONSERVADORA DE SERVIÇOS
export const validateServiceValues = (services: any, speed: string, company: string): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  // Só validar se os dados estão claramente identificados
  if (!services || !speed) {
    results.push({
      valid: true,
      message: "Serviços não identificados claramente - assumindo corretos",
      severity: 'info'
    });
    return results;
  }
  
  // CNET Livros sempre R$ 29,90 (apenas se identificado)
  if (services.cnet_livros && services.cnet_livros !== 'R$ 29,90') {
    results.push({
      valid: false,
      message: "CNET Livros deve ser sempre R$ 29,90",
      found: services.cnet_livros,
      expected: 'R$ 29,90',
      severity: 'error'
    });
  }
  
  return results;
};

// 🏢 VALIDAÇÃO CONSERVADORA DE EMPRESA vs DDD
export const validateCompanyDDD = (company: string, ddd: string): ValidationResult => {
  if (!company || !ddd) {
    return {
      valid: true,
      message: "Empresa ou DDD não identificados claramente",
      severity: 'info'
    };
  }

  const companyLower = company.toLowerCase();
  const dddNumber = ddd.replace(/[^0-9]/g, '');
  
  if (companyLower.includes('ciabrasnet') || companyLower.includes('matriz')) {
    if (dddNumber !== '42') {
      return {
        valid: false,
        message: "CIABRASNET (Matriz) geralmente usa DDD 42 (Porto União)",
        found: `DDD ${dddNumber}`,
        expected: "DDD 42",
        severity: 'warning' // WARNING, não ERROR
      };
    }
  } else if (companyLower.includes('wnkbr')) {
    if (dddNumber !== '47') {
      return {
        valid: false,
        message: "WNKBR geralmente usa DDD 47 (Papanduva)",
        found: `DDD ${dddNumber}`,
        expected: "DDD 47",
        severity: 'warning' // WARNING, não ERROR
      };
    }
  }
  
  return {
    valid: true,
    message: "DDD compatível com a empresa",
    severity: 'info'
  };
};

// 📊 VALIDAÇÃO CONSERVADORA DE FIDELIDADE
export const validateFidelityDiscount = (fidelityPeriod: string, cancellationFee: string): ValidationResult => {
  if (!fidelityPeriod || !cancellationFee) {
    return {
      valid: true,
      message: "Dados de fidelidade não identificados claramente",
      severity: 'info'
    };
  }

  const text = cancellationFee.toLowerCase();
  
  if (fidelityPeriod === '12 meses' || fidelityPeriod === '24 meses') {
    if (!text.includes('700') && !text.includes('desconto')) {
      return {
        valid: false,
        message: "Contratos com fidelidade geralmente têm desconto de R$ 700,00",
        found: cancellationFee,
        expected: "R$ 700,00 descontados proporcionalmente",
        severity: 'warning' // WARNING, não ERROR
      };
    }
  }
  
  return {
    valid: true,
    message: "Regra de fidelidade parece correta",
    severity: 'info'
  };
};

// 🎯 FUNÇÃO PRINCIPAL DE VALIDAÇÃO CONSERVADORA
export const validateContract = (contractData: any, identifiedModel?: any): ContractValidationResult => {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];
  const info: ValidationResult[] = [];
  const validatedFields: string[] = [];
  
  console.log("🔍 Iniciando validação conservadora do contrato");
  
  // 1. Validar telefone celular (apenas se identificado)
  if (contractData.cellPhone) {
    console.log("📱 Validando telefone:", contractData.cellPhone);
    const phoneResult = validateCellPhone(contractData.cellPhone);
    if (phoneResult.severity === 'error') errors.push(phoneResult);
    else if (phoneResult.severity === 'warning') warnings.push(phoneResult);
    else info.push(phoneResult);
    validatedFields.push('cellPhone');
  }
  
  // 2. Validar IP (apenas se dados claros)
  if (contractData.ipType && contractData.totalValue && contractData.baseValue) {
    const ipResult = validateIPConfiguration(contractData.ipType, contractData.totalValue, contractData.baseValue);
    if (ipResult.severity === 'error') errors.push(ipResult);
    else if (ipResult.severity === 'warning') warnings.push(ipResult);
    else info.push(ipResult);
    validatedFields.push('ipConfiguration');
  }
  
  // 3. Validar equipamentos (conservador)
  if (contractData.equipment && contractData.speed) {
    const equipmentResult = validateEquipment(contractData.equipment, contractData.speed);
    if (equipmentResult.severity === 'error') errors.push(equipmentResult);
    else if (equipmentResult.severity === 'warning') warnings.push(equipmentResult);
    else info.push(equipmentResult);
    validatedFields.push('equipment');
  }
  
  // 4. Validar serviços (conservador)
  if (contractData.services && contractData.speed) {
    const serviceResults = validateServiceValues(contractData.services, contractData.speed, contractData.company);
    serviceResults.forEach(result => {
      if (result.severity === 'error') errors.push(result);
      else if (result.severity === 'warning') warnings.push(result);
      else info.push(result);
    });
    validatedFields.push('services');
  }
  
  // 5. Validar empresa vs DDD (conservador)
  if (contractData.company && contractData.ddd) {
    const dddResult = validateCompanyDDD(contractData.company, contractData.ddd);
    if (dddResult.severity === 'error') errors.push(dddResult);
    else if (dddResult.severity === 'warning') warnings.push(dddResult);
    else info.push(dddResult);
    validatedFields.push('companyDDD');
  }
  
  console.log(`✅ Validação concluída: ${errors.length} erros, ${warnings.length} alertas`);
  
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

// 📋 LISTA DE VALIDAÇÕES DISPONÍVEIS
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

// 🧪 EXECUTAR TESTE AUTOMÁTICO
// testCellPhoneValidation(); // Descomente para testar
