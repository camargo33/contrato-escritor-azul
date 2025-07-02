/**
 * Funções para detectar opção de fidelidade e calcular taxa de rescisão
 */

export interface FidelityDetectionResult {
  isFidelityMarked: boolean;
  confidence: number;
  evidence: string[];
  context: string;
}

export interface CancellationFeeCalculation {
  expectedFee: string;
  calculation: string;
  fidelityRequired: boolean;
  installationFee: number;
}

/**
 * Detecta se a opção "Fidelidade" está marcada no contrato
 */
export const detectFidelityOption = (contractText: string): FidelityDetectionResult => {
  const evidence: string[] = [];
  let confidence = 0;
  let context = '';
  
  const normalizedText = contractText.toLowerCase();
  
  // Padrões que indicam fidelidade marcada como SIM
  const fidelityMarkedPatterns = [
    /da\s+opção\s+de\s+fidelidade[^X]*sim\s*\(?\s*x\s*\)?/i,
    /fidelidade[^X]*sim\s*\(?\s*x\s*\)?/i,
    /sim\s*\(?\s*x\s*\)?[^X]*fidelidade/i,
    /opção\s+fidelidade[^X]*sim\s*\(?\s*x\s*\)?/i,
    /\[\s*x\s*\]\s*sim[^X]*fidelidade/i,
    /fidelidade[^X]*\[\s*x\s*\]\s*sim/i
  ];
  
  // Padrões que indicam fidelidade NÃO marcada
  const fidelityNotMarkedPatterns = [
    /da\s+opção\s+de\s+fidelidade[^X]*não\s*\(?\s*x\s*\)?/i,
    /fidelidade[^X]*não\s*\(?\s*x\s*\)?/i,
    /não\s*\(?\s*x\s*\)?[^X]*fidelidade/i,
    /\[\s*x\s*\]\s*não[^X]*fidelidade/i,
    /fidelidade[^X]*\[\s*x\s*\]\s*não/i
  ];
  
  // Buscar evidências de fidelidade marcada
  for (const pattern of fidelityMarkedPatterns) {
    const match = contractText.match(pattern);
    if (match) {
      evidence.push(`Encontrado padrão "SIM (X)" para fidelidade: "${match[0]}"`);
      confidence += 30;
      context = match[0];
    }
  }
  
  // Buscar evidências de fidelidade NÃO marcada
  for (const pattern of fidelityNotMarkedPatterns) {
    const match = contractText.match(pattern);
    if (match) {
      evidence.push(`Encontrado padrão "NÃO (X)" para fidelidade: "${match[0]}"`);
      confidence = Math.max(0, confidence - 40); // Reduz confiança se encontrar padrão negativo
      context = match[0];
    }
  }
  
  // Padrões mais gerais para detectar seção de fidelidade
  const generalFidelityPatterns = [
    /da\s+opção\s+de\s+fidelidade/i,
    /seção.*fidelidade/i,
    /cláusula.*fidelidade/i
  ];
  
  for (const pattern of generalFidelityPatterns) {
    if (pattern.test(contractText)) {
      evidence.push(`Seção de fidelidade detectada`);
      confidence += 10;
    }
  }
  
  // Se não encontrou evidências específicas, assumir que não está marcado
  const isFidelityMarked = confidence >= 25;
  
  return {
    isFidelityMarked,
    confidence: Math.min(confidence, 100),
    evidence,
    context
  };
};

/**
 * Calcula a taxa de rescisão baseada na fidelidade e taxa de instalação REAL do contrato
 */
export const calculateExpectedCancellationFee = (
  contractText: string,
  modelCancellationFee: string,
  modelInstallationFee: string
): CancellationFeeCalculation => {
  const fidelityResult = detectFidelityOption(contractText);
  
  // Extrair valor REAL da taxa de instalação do contrato (não da tabela)
  const realInstallationFee = extractRealInstallationFeeFromContract(contractText);
  
  let expectedFee: string;
  let calculation: string;
  let fidelityRequired: boolean;
  
  if (fidelityResult.isFidelityMarked) {
    // Com fidelidade marcada: aplica lógica de cálculo
    if (realInstallationFee > 0) {
      // Se taxa > 0: Taxa Rescisão = 700 - Taxa Instalação REAL
      const calculatedFee = 700 - realInstallationFee;
      expectedFee = `R$ ${calculatedFee.toFixed(2).replace('.', ',')}`;
      calculation = `700 - ${realInstallationFee} = ${calculatedFee} (baseado na taxa real do contrato)`;
      fidelityRequired = true;
    } else {
      // Se taxa = 0 (gratuita): Taxa Rescisão = R$ 700,00
      expectedFee = "R$ 700,00";
      calculation = "Taxa gratuita com fidelidade = R$ 700,00";
      fidelityRequired = true;
    }
  } else {
    // Sem fidelidade marcada: sempre R$ 700,00
    expectedFee = "R$ 700,00";
    calculation = "Sem fidelidade marcada = valor fixo R$ 700,00";
    fidelityRequired = false;
  }
  
  return {
    expectedFee,
    calculation,
    fidelityRequired,
    installationFee: realInstallationFee
  };
};

/**
 * Extrai o valor REAL da taxa de instalação para fidelidade do contrato
 */
export const extractRealInstallationFeeFromContract = (contractText: string): number => {
  // Padrão específico para taxa de instalação com fidelidade (padrão principal)
  const fidelityInstallationPatterns = [
    // Padrão específico: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ X,XX"
    /valor\s+total\s+da\s+taxa\s+de\s+instalação\s+caso\s+o\s+assinante\s+opte\s+pela\s+opção\s+de\s+fidelidade[:\s]*R\$\s*(\d+(?:,\d{2})?)(?:\s*\w+)?/i,
    
    // Variações do padrão principal
    /taxa.*instalação.*fidelidade[:\s]*R\$\s*(\d+(?:,\d{2})?)(?:\s*\w+)?/i,
    /fidelidade.*taxa.*instalação[:\s]*R\$\s*(\d+(?:,\d{2})?)(?:\s*\w+)?/i,
    /opte.*fidelidade[:\s]*R\$\s*(\d+(?:,\d{2})?)(?:\s*\w+)?/i,
    
    // Padrão em tabelas com fidelidade
    /com\s+fidelidade[:\s]*R\$\s*(\d+(?:,\d{2})?)(?:\s*\w+)?/i,
  ];
  
  // Primeiro, tentar encontrar o valor específico da taxa de instalação com fidelidade
  for (const pattern of fidelityInstallationPatterns) {
    const match = contractText.match(pattern);
    if (match) {
      // Extrair apenas os dígitos e vírgula, ignorando sufixos como "Av"
      const cleanValue = match[1];
      const value = parseFloat(cleanValue.replace(',', '.'));
      console.log(`Taxa de instalação com fidelidade encontrada: R$ ${value} (${cleanValue}) usando padrão: ${pattern}`);
      return value;
    }
  }
  
  // Se não encontrou valor específico, procurar por "gratuita" em contexto de fidelidade
  const gratuitaPatterns = [
    /fidelidade.*gratuita/i,
    /gratuita.*fidelidade/i,
    /opte.*fidelidade.*gratuita/i,
    /taxa.*instalação.*fidelidade.*gratuita/i,
    /taxa.*instalação.*fidelidade.*R\$\s*0[,.]?00/i
  ];
  
  for (const pattern of gratuitaPatterns) {
    if (pattern.test(contractText)) {
      console.log(`Taxa de instalação com fidelidade gratuita detectada usando padrão: ${pattern}`);
      return 0;
    }
  }
  
  console.log('Taxa de instalação com fidelidade não encontrada, assumindo valor 0');
  return 0;
};

/**
 * Extrai valor monetário de uma string
 */
export const extractMonetaryValue = (text: string): number => {
  const match = text.match(/R\$\s*(\d+(?:,\d{2})?)/);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
};