
import { detectFidelityOption } from './fidelity-detection.ts';

// Função auxiliar para extrair valor monetário
const extractMonetaryValue = (text: string): number => {
  if (!text) return 0;
  
  // Verificar se é gratuita
  if (text.toLowerCase().includes('gratuita') || text.toLowerCase().includes('grátis')) {
    return 0;
  }
  
  // Extrair valor numérico
  const match = text.match(/R\$\s*(\d+(?:,\d{2})?)/);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  
  return 0;
};

// Lógica específica para cálculo da Taxa de Rescisão baseada na Fidelidade
export const calculateExpectedCancellationFee = (installationFeeText: string, contractText: string): string => {
  // Primeiro, detectar se a fidelidade está marcada
  const hasFidelity = detectFidelityOption(contractText);
  
  // Se NÃO tem fidelidade marcada, sempre retorna R$ 700,00
  if (!hasFidelity) {
    console.log('Fidelidade não marcada - Taxa de Rescisão fixa: R$ 700,00');
    return 'R$ 700,00';
  }
  
  // Se TEM fidelidade marcada, aplicar a lógica da tabela
  console.log('Fidelidade marcada - aplicando lógica da tabela');
  
  // Extrair valor numérico da taxa de instalação
  const installationValue = extractMonetaryValue(installationFeeText);
  
  // Aplicar a lógica: Taxa Rescisão = 700 - Taxa Instalação
  if (installationValue === 0) {
    return 'R$ 700,00'; // Se instalação gratuita, rescisão é R$ 700,00
  } else if (installationValue === 150) {
    return 'R$ 550,00'; // 700 - 150 = 550
  } else if (installationValue === 200) {
    return 'R$ 500,00'; // 700 - 200 = 500
  } else if (installationValue === 300) {
    return 'R$ 400,00'; // 700 - 300 = 400
  }
  
  // Para outros valores, calcular dinamicamente
  const rescissionValue = 700 - installationValue;
  return `R$ ${rescissionValue.toFixed(2).replace('.', ',')}`;
};
