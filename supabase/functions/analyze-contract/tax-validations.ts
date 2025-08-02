// 💰 VALIDAÇÕES RIGOROSAS DE TAXAS E VALORES
// DETECTA INCONSISTÊNCIAS NA LÓGICA DE TAXAS, IP FIXO/VARIÁVEL E FIDELIDADE

// 📋 INTERFACE PARA RESULTADOS DE VALIDAÇÃO
export interface ValidationResult {
  valid: boolean;
  message?: string;
  expected?: string;
  found?: string;
  severity: 'error' | 'warning' | 'info';
}

// 🌐 VALIDAÇÃO RIGOROSA DE IP E TAXAS
export const validateIPAndTaxes = (contractText: string): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  
  console.log("💰 VALIDANDO LÓGICA DE TAXAS E IP...");
  
  // Detectar tipo de IP marcado
  let ipType = '';
  let ipFixedTax = '';
  
  // Buscar padrões de IP no texto
  if (contractText.includes('(X) Variável') || contractText.includes('( X ) Variável')) {
    ipType = 'Variável';
  } else if (contractText.includes('(X) Fixo') || contractText.includes('( X ) Fixo')) {
    ipType = 'Fixo';
  }
  
  // Buscar taxa de IP Fixo
  const ipTaxMatch = contractText.match(/IP FIXO\s*R\$\s*([\d,]+)/);
  if (ipTaxMatch) {
    ipFixedTax = `R$ ${ipTaxMatch[1]}`;
  }
  
  console.log(`🔍 IP detectado: "${ipType}"`);
  console.log(`🔍 Taxa IP Fixo encontrada: "${ipFixedTax}"`);
  
  // VALIDAÇÃO 1: IP Variável não deve ter taxa de IP Fixo
  if (ipType === 'Variável' && ipFixedTax && ipFixedTax !== 'R$ 00,00' && ipFixedTax !== 'R$ 0,00') {
    errors.push({
      valid: false,
      message: `Inconsistência: IP marcado como VARIÁVEL mas mostra taxa de IP Fixo`,
      found: `IP: ${ipType}, Taxa: ${ipFixedTax}`,
      expected: "IP Variável não deve ter taxa adicional (R$ 0,00)",
      severity: 'error'
    });
  }
  
  // VALIDAÇÃO 2: IP Fixo deve ter taxa de R$ 50,00
  if (ipType === 'Fixo' && ipFixedTax && !ipFixedTax.includes('50')) {
    errors.push({
      valid: false,
      message: `IP Fixo deve ter taxa de R$ 50,00`,
      found: `Taxa: ${ipFixedTax}`,
      expected: "R$ 50,00",
      severity: 'error'
    });
  }
  
  return errors;
};

// 🎯 VALIDAÇÃO DE FIDELIDADE E TAXAS DE INSTALAÇÃO
export const validateFidelityLogic = (contractText: string): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  
  console.log("🎯 VALIDANDO LÓGICA DE FIDELIDADE...");
  
  // Extrair valores de taxa de instalação
  const taxaInstalacaoMatch = contractText.match(/TAXA DE INSTALAÇÃO[^R]*R\$\s*([\d,]+)/);
  const descontoFidelidadeMatch = contractText.match(/desconto de R\$\s*([\d,]+)/);
  const semFidelidadeMatch = contractText.match(/R\$\s*([\d,]+)[^0-9]*\(setecentos reais\)/);
  
  let taxaInstalacao = 0;
  let descontoFidelidade = 0;
  let valorSemFidelidade = 0;
  
  if (taxaInstalacaoMatch) {
    taxaInstalacao = parseFloat(taxaInstalacaoMatch[1].replace(',', '.'));
  }
  
  if (descontoFidelidadeMatch) {
    descontoFidelidade = parseFloat(descontoFidelidadeMatch[1].replace(',', '.'));
  }
  
  if (semFidelidadeMatch) {
    valorSemFidelidade = parseFloat(semFidelidadeMatch[1].replace(',', '.'));
  }
  
  console.log(`📊 Taxa instalação: R$ ${taxaInstalacao}`);
  console.log(`📊 Desconto fidelidade: R$ ${descontoFidelidade}`);
  console.log(`📊 Valor sem fidelidade: R$ ${valorSemFidelidade}`);
  
  // VALIDAÇÃO 1: Desconto não pode ser maior que taxa base
  if (taxaInstalacao > 0 && descontoFidelidade > taxaInstalacao) {
    errors.push({
      valid: false,
      message: `Desconto de fidelidade maior que taxa de instalação`,
      found: `Desconto: R$ ${descontoFidelidade}, Taxa: R$ ${taxaInstalacao}`,
      expected: "Desconto deve ser menor ou igual à taxa base",
      severity: 'error'
    });
  }
  
  // VALIDAÇÃO 2: Matemática da fidelidade deve fazer sentido
  if (taxaInstalacao > 0 && valorSemFidelidade > 0 && descontoFidelidade > 0) {
    const valorComFidelidade = taxaInstalacao - descontoFidelidade;
    const diferenca = valorSemFidelidade - valorComFidelidade;
    
    // Se a diferença não for aproximadamente igual ao desconto, há inconsistência
    if (Math.abs(diferenca - descontoFidelidade) > 50) { // Tolerância de R$ 50
      errors.push({
        valid: false,
        message: `Lógica de fidelidade inconsistente`,
        found: `Com fidelidade: R$ ${valorComFidelidade.toFixed(2)}, Sem fidelidade: R$ ${valorSemFidelidade}`,
        expected: `Diferença deveria ser aproximadamente R$ ${descontoFidelidade}`,
        severity: 'warning'
      });
    }
  }
  
  return errors;
};

// 💵 VALIDAÇÃO DE SOMA DOS VALORES MENSAIS
export const validateMonthlyTotals = (contractText: string): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  
  console.log("💵 VALIDANDO SOMA DOS VALORES MENSAIS...");
  
  // Buscar valores mensais no contrato
  const valorPatterns = [
    { name: 'Internet', pattern: /Internet.*?R\$\s*([\d,]+)/ },
    { name: 'CNET Livros', pattern: /CNET LIVROS.*?R\$\s*([\d,]+)/ },
    { name: 'Suporte', pattern: /Suporte.*?R\$\s*([\d,]+)/ },
    { name: 'CNET Educa', pattern: /CNET Educa.*?R\$\s*([\d,]+)/ },
    { name: 'CNET Play', pattern: /CNET Play.*?R\$\s*([\d,]+)/ }
  ];
  
  const valoresEncontrados: { [key: string]: number } = {};
  let somaCalculada = 0;
  
  valorPatterns.forEach(({ name, pattern }) => {
    const match = contractText.match(pattern);
    if (match) {
      const valor = parseFloat(match[1].replace(',', '.'));
      valoresEncontrados[name] = valor;
      somaCalculada += valor;
      console.log(`📊 ${name}: R$ ${valor.toFixed(2)}`);
    }
  });
  
  console.log(`📊 SOMA CALCULADA: R$ ${somaCalculada.toFixed(2)}`);
  
  // Buscar valor total declarado no contrato
  const totalDeclardoMatch = contractText.match(/VALOR TOTAL.*?R\$\s*([\d,]+)/);
  if (totalDeclardoMatch) {
    const totalDeclarado = parseFloat(totalDeclardoMatch[1].replace(',', '.'));
    console.log(`📊 TOTAL DECLARADO: R$ ${totalDeclarado.toFixed(2)}`);
    
    // Verificar se soma bate com total declarado (tolerância de R$ 1,00)
    if (Math.abs(somaCalculada - totalDeclarado) > 1.00) {
      errors.push({
        valid: false,
        message: `Soma dos valores mensais não confere com total declarado`,
        found: `Soma: R$ ${somaCalculada.toFixed(2)}, Declarado: R$ ${totalDeclarado.toFixed(2)}`,
        expected: `Valores devem ser iguais ou com diferença máxima de R$ 1,00`,
        severity: 'warning'
      });
    }
  }
  
  return errors;
};

// 🎯 VALIDAÇÃO COMPLETA DE TAXAS (FUNÇÃO PRINCIPAL)
export const validateTaxLogic = (contractText: string): ValidationResult[] => {
  const allErrors: ValidationResult[] = [];
  
  console.log("🎯 INICIANDO VALIDAÇÃO COMPLETA DE TAXAS");
  
  // 1. Validar IP e taxas relacionadas
  const ipErrors = validateIPAndTaxes(contractText);
  allErrors.push(...ipErrors);
  
  // 2. Validar lógica de fidelidade
  const fidelityErrors = validateFidelityLogic(contractText);
  allErrors.push(...fidelityErrors);
  
  // 3. Validar soma dos valores mensais
  const monthlyErrors = validateMonthlyTotals(contractText);
  allErrors.push(...monthlyErrors);
  
  console.log(`✅ Validação de taxas concluída: ${allErrors.length} inconsistências encontradas`);
  
  return allErrors;
};