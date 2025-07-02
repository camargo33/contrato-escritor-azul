
// Função para detectar se a opção Fidelidade está marcada no contrato
export const detectFidelityOption = (contractText: string): boolean => {
  if (!contractText) return false;
  
  // Padrões para detectar fidelidade marcada como SIM
  const fidelityPatterns = [
    /fidelidade[:\s]*sim[^\w]*\(?\s*x\s*\)?/i,
    /fidelidade[:\s]*\(?\s*x\s*\)?\s*sim/i,
    /sim[^\w]*\(?\s*x\s*\)?[^\w]*fidelidade/i,
    /prazo.*fidelidade[:\s]*sim[^\w]*\(?\s*x\s*\)?/i,
    /adesão.*fidelidade[:\s]*sim[^\w]*\(?\s*x\s*\)?/i,
    /contrato.*fidelidade[:\s]*sim[^\w]*\(?\s*x\s*\)?/i
  ];
  
  // Verifica se algum padrão indica que a fidelidade está marcada como SIM
  for (const pattern of fidelityPatterns) {
    if (pattern.test(contractText)) {
      console.log(`Fidelidade detectada como SIM através do padrão: ${pattern}`);
      return true;
    }
  }
  
  console.log('Fidelidade não detectada como marcada (SIM) - usando valor padrão R$ 700,00');
  return false;
};
