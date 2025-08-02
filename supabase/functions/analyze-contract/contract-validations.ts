// 🔍 VALIDAÇÕES COMPLETAS - DETECTA ERROS REAIS + INCONSISTÊNCIAS DE TAXAS
// CORREÇÃO: Detectar telefone, ortografia, taxas e lógica de valores

import { validateTaxLogic } from './tax-validations.ts';

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

// 📱 VALIDAÇÃO RIGOROSA DE TELEFONE CELULAR - DETECTA ERROS REAIS
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
  console.log(`🔍 VALIDAÇÃO RIGOROSA - Telefone: "${phone}" → números: "${numbers}"`);
  
  // VERIFICAÇÃO 1: Deve ter exatamente 11 dígitos (DDD + 9 dígitos do celular)
  if (numbers.length !== 11) {
    return {
      valid: false,
      message: `Telefone celular inválido - deve ter 11 dígitos total (DDD + 9 dígitos)`,
      found: `${phone} (${numbers.length} dígitos)`,
      expected: "(XX) 9XXXX-XXXX (11 dígitos total)",
      severity: 'error'
    };
  }

  // Extrair DDD e número do celular
  const ddd = numbers.substring(0, 2);      // Primeiros 2 dígitos
  const cellNumber = numbers.substring(2);  // Últimos 9 dígitos
  
  console.log(`📱 DDD: "${ddd}", Celular: "${cellNumber}" (${cellNumber.length} dígitos)`);

  // VERIFICAÇÃO 2: Número do celular deve ter exatamente 9 dígitos
  if (cellNumber.length !== 9) {
    return {
      valid: false,
      message: `Número do celular deve ter exatamente 9 dígitos`,
      found: `${cellNumber} (${cellNumber.length} dígitos)`,
      expected: "9XXXX-XXXX (9 dígitos)",
      severity: 'error'
    };
  }

  // VERIFICAÇÃO 3: Celular deve começar com 9 (padrão brasileiro)
  if (!cellNumber.startsWith('9')) {
    return {
      valid: false,
      message: "Número de celular deve começar com 9",
      found: `${cellNumber} (inicia com ${cellNumber[0]})`,
      expected: "9XXXX-XXXX (deve iniciar com 9)",
      severity: 'error'
    };
  }

  // VERIFICAÇÃO 4: DDD deve ser válido (11-99)
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

// 📝 VALIDAÇÃO DE ERROS ORTOGRÁFICOS ÓBVIOS
export const validateSpelling = (text: string): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  
  // Palavras com erros óbvios - APENAS detectar se existirem no texto
  const spellingErrors = {
    'SOOLTEIRO': 'SOLTEIRO',
    'SOLETEIRO': 'SOLTEIRO', 
    'SOLTERO': 'SOLTEIRO',
    'CAZADO': 'CASADO',
    'CASDO': 'CASADO',
    'VIUVA': 'VIÚVA',
    'VIUVO': 'VIÚVO'
  };
  
  console.log("🔍 VERIFICANDO ORTOGRAFIA - Procurando erros óbvios...");
  
  // Verificar se alguma palavra incorreta está presente no texto
  for (const [incorreta, correta] of Object.entries(spellingErrors)) {
    if (text.includes(incorreta)) {
      console.log(`❌ ERRO ORTOGRÁFICO ENCONTRADO: "${incorreta}" → deveria ser "${correta}"`);
      errors.push({
        valid: false,
        message: `Erro ortográfico: "${incorreta}" deveria ser "${correta}"`,
        found: incorreta,
        expected: correta,
        severity: 'error'
      });
    }
  }
  
  if (errors.length === 0) {
    console.log("✅ Nenhum erro ortográfico óbvio encontrado");
  }
  
  return errors;
};

// 🗓️ VALIDAÇÃO DE FORMATO DE DATAS (NÃO ANO)
export const validateDateFormat = (text: string): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  const dateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g;
  
  let match;
  while ((match = dateRegex.exec(text)) !== null) {
    const dia = parseInt(match[1]);
    const mes = parseInt(match[2]);
    const dataCompleta = match[0];
    
    // Validar apenas formato básico - NÃO ANO
    if (dia < 1 || dia > 31) {
      errors.push({
        valid: false,
        message: `Data com dia inválido: ${dataCompleta}`,
        found: dataCompleta,
        expected: "DD/MM/AAAA (dia 01-31)",
        severity: 'error'
      });
    }
    
    if (mes < 1 || mes > 12) {
      errors.push({
        valid: false,
        message: `Data com mês inválido: ${dataCompleta}`,
        found: dataCompleta,
        expected: "DD/MM/AAAA (mês 01-12)",
        severity: 'error'
      });
    }
  }
  
  return errors;
};

// 🌐 VALIDAÇÃO DE IP FIXO vs VARIÁVEL (MANTIDA PARA COMPATIBILIDADE)
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
    valid: true,
    message: "Tipo de IP não identificado claramente - assumindo válido",
    found: ipType,
    severity: 'info'
  };
};

// 🔧 VALIDAÇÃO CONSERVADORA DE EQUIPAMENTOS (MANTIDA)
export const validateEquipment = (equipmentText: string, speed: string): ValidationResult => {
  if (!equipmentText || equipmentText.trim() === '') {
    return {
      valid: true,
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

// 🎯 FUNÇÃO PRINCIPAL DE VALIDAÇÃO COMPLETA - DETECTA TODOS OS ERROS
export const validateContract = (contractData: any, identifiedModel?: any): ContractValidationResult => {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];
  const info: ValidationResult[] = [];
  const validatedFields: string[] = [];
  
  console.log("🔍 INICIANDO VALIDAÇÃO COMPLETA - ERROS REAIS + TAXAS");
  
  // 1. Validar telefone celular (RIGOROSO)
  if (contractData.cellPhone) {
    console.log("📱 Validando telefone rigorosamente:", contractData.cellPhone);
    const phoneResult = validateCellPhone(contractData.cellPhone);
    if (phoneResult.severity === 'error') errors.push(phoneResult);
    else if (phoneResult.severity === 'warning') warnings.push(phoneResult);
    else info.push(phoneResult);
    validatedFields.push('cellPhone');
  }
  
  // 2. Validar erros ortográficos óbvios
  if (contractData.fullText) {
    console.log("📝 Verificando ortografia...");
    const spellingErrors = validateSpelling(contractData.fullText);
    spellingErrors.forEach(error => {
      if (error.severity === 'error') errors.push(error);
      else if (error.severity === 'warning') warnings.push(error);
      else info.push(error);
    });
    if (spellingErrors.length > 0) validatedFields.push('spelling');
  }
  
  // 3. Validar formato de datas (NÃO ANO)
  if (contractData.fullText) {
    console.log("🗓️ Verificando formato de datas...");
    const dateErrors = validateDateFormat(contractData.fullText);
    dateErrors.forEach(error => {
      if (error.severity === 'error') errors.push(error);
      else if (error.severity === 'warning') warnings.push(error);
      else info.push(error);
    });
    if (dateErrors.length > 0) validatedFields.push('dateFormat');
  }
  
  // 4. 💰 NOVA: Validar lógica de taxas, IP e fidelidade
  if (contractData.fullText) {
    console.log("💰 Verificando lógica de taxas...");
    const taxErrors = validateTaxLogic(contractData.fullText);
    taxErrors.forEach(error => {
      if (error.severity === 'error') errors.push(error);
      else if (error.severity === 'warning') warnings.push(error);
      else info.push(error);
    });
    if (taxErrors.length > 0) validatedFields.push('taxLogic');
  }
  
  // 5. Validar IP (conservador - compatibilidade)
  if (contractData.ipType && contractData.totalValue && contractData.baseValue) {
    const ipResult = validateIPConfiguration(contractData.ipType, contractData.totalValue, contractData.baseValue);
    if (ipResult.severity === 'error') errors.push(ipResult);
    else if (ipResult.severity === 'warning') warnings.push(ipResult);
    else info.push(ipResult);
    validatedFields.push('ipConfiguration');
  }
  
  // 6. Validar equipamentos (conservador)
  if (contractData.equipment && contractData.speed) {
    const equipmentResult = validateEquipment(contractData.equipment, contractData.speed);
    if (equipmentResult.severity === 'error') errors.push(equipmentResult);
    else if (equipmentResult.severity === 'warning') warnings.push(equipmentResult);
    else info.push(equipmentResult);
    validatedFields.push('equipment');
  }
  
  console.log(`✅ Validação completa concluída: ${errors.length} erros, ${warnings.length} alertas`);
  console.log("📋 Erros encontrados:", errors.map(e => e.message));
  
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

// 📋 LISTA DE VALIDAÇÕES DISPONÍVEIS COMPLETA
export const AVAILABLE_VALIDATIONS = [
  'cellPhone',
  'spelling',
  'dateFormat',
  'taxLogic',         // NOVA
  'ipConfiguration', 
  'equipment'
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