// FASE 2: Sistema de Prompt Dinâmico por Velocidade e Empresa
// Categorização baseada nas velocidades e valores reais da CIABRASNET

interface ContractBaseCategory {
  name: string;
  empresa: string;
  velocidade: string;
  valor_scm: number;
  tipo_plano: 'RESIDENCIAL' | 'CORPORATIVO';
  fidelidade_meses: number;
  ip_fixo_incluso: boolean;
  servicos_padrao: {
    cnet_livros: number;
    suporte: number;
    cnet_educa?: number;
    cnet_play?: number;
  };
  equipamentos_padrao: string[];
  taxa_instalacao: number;
}

// Definição dos contratos base por velocidade e empresa
export const CONTRATOS_BASE_CIABRASNET: ContractBaseCategory[] = [
  {
    name: "2024 Combo 300Mbps",
    empresa: "CIABRASNET", 
    velocidade: "300",
    valor_scm: 109.99,
    tipo_plano: "RESIDENCIAL",
    fidelidade_meses: 12,
    ip_fixo_incluso: false,
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 19.90,
      cnet_educa: 0,
      cnet_play: 0
    },
    equipamentos_padrao: ["ONU", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  },
  {
    name: "COMBO 2025 500 MEGAS MATRIZ",
    empresa: "CIABRASNET",
    velocidade: "500", 
    valor_scm: 119.99,
    tipo_plano: "RESIDENCIAL",
    fidelidade_meses: 12,
    ip_fixo_incluso: false,
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 19.90,
      cnet_educa: 19.90,
      cnet_play: 0
    },
    equipamentos_padrao: ["ONU", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  },
  {
    name: "2024 Combo 600Mbps",
    empresa: "CIABRASNET",
    velocidade: "600",
    valor_scm: 129.99,
    tipo_plano: "RESIDENCIAL", 
    fidelidade_meses: 12,
    ip_fixo_incluso: false,
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 14.90,
      cnet_educa: 19.90,
      cnet_play: 0
    },
    equipamentos_padrao: ["700ONU", "ROTEADOR", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  },
  {
    name: "2024 Combo 800Mbps", 
    empresa: "CIABRASNET",
    velocidade: "800",
    valor_scm: 159.99,
    tipo_plano: "RESIDENCIAL",
    fidelidade_meses: 12,
    ip_fixo_incluso: false,
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 14.90,
      cnet_educa: 19.90,
      cnet_play: 0
    },
    equipamentos_padrao: ["ONT", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  },
  {
    name: "2024 Combo Giga",
    empresa: "CIABRASNET", 
    velocidade: "1000",
    valor_scm: 209.99,
    tipo_plano: "RESIDENCIAL",
    fidelidade_meses: 12,
    ip_fixo_incluso: false,
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 14.90,
      cnet_educa: 19.90,
      cnet_play: 0
    },
    equipamentos_padrao: ["ONT", "ROTEADOR", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  },
  {
    name: "1Gb Empresarial",
    empresa: "CIABRASNET",
    velocidade: "1000", 
    valor_scm: 229.90,
    tipo_plano: "CORPORATIVO",
    fidelidade_meses: 24,
    ip_fixo_incluso: true, // IP FIXO INCLUSO
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 14.90,
      cnet_educa: 19.90,
      cnet_play: 0
    },
    equipamentos_padrao: ["ONT", "ROTEADOR", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  }
];

// Contratos WNKBR (expandir conforme necessário)
export const CONTRATOS_BASE_WNKBR: ContractBaseCategory[] = [
  {
    name: "CONVENIO COMBO 300MBPS WNKBR",
    empresa: "WNKBR",
    velocidade: "300",
    valor_scm: 100.00, // Valor promocional identificado
    tipo_plano: "RESIDENCIAL",
    fidelidade_meses: 12,
    ip_fixo_incluso: false,
    servicos_padrao: {
      cnet_livros: 29.90,
      suporte: 19.90,
      cnet_educa: 0,
      cnet_play: 0
    },
    equipamentos_padrao: ["ONU", "ROTEADOR", "Conectores", "Cabos", "Acessórios"],
    taxa_instalacao: 200.00
  }
  // Adicionar outros planos WNKBR conforme necessário
];

// Função para identificar categoria do contrato
export function identificarCategoriaContrato(contractText: string) {
  const todosContratos = [...CONTRATOS_BASE_CIABRASNET, ...CONTRATOS_BASE_WNKBR];
  
  // Extrair informações básicas do contrato
  const empresaMatch = contractText.match(/(CIABRASNET|WNKBR)/i);
  const velocidadeMatch = contractText.match(/(\d+)\s*(?:MB|MEGA|GB|GIGA)/i);
  const valorMatch = contractText.match(/R\$\s*(\d+[,.]\d+)/);
  const tipoMatch = contractText.match(/TIPO DO PLANO.*?(RESIDENCIAL|CORPORATIVO)/i);
  
  const empresa = empresaMatch ? empresaMatch[1].toUpperCase() : null;
  const velocidade = velocidadeMatch ? velocidadeMatch[1] : null;
  const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
  const tipo = tipoMatch ? tipoMatch[1].toUpperCase() : 'RESIDENCIAL';
  
  // Buscar contrato base correspondente
  const contratoBase = todosContratos.find(contrato => {
    const empresaMatch = contrato.empresa === empresa;
    const velocidadeMatch = contrato.velocidade === velocidade || 
                           (velocidade === '1000' && contrato.velocidade === '1000') ||
                           (velocidade === '1' && contrato.velocidade === '1000'); // 1GB = 1000MB
    const tipoMatch = contrato.tipo_plano === tipo;
    
    return empresaMatch && velocidadeMatch && tipoMatch;
  });
  
  return {
    empresa,
    velocidade, 
    valor,
    tipo,
    contratoBase,
    categoriaEncontrada: !!contratoBase
  };
}

// Função para validar valores do contrato
export function validarValoresContrato(contractText: string, contratoBase: ContractBaseCategory) {
  const erros = [];
  const alertas = [];
  
  // Validar valor SCM
  const valorMatch = contractText.match(/Internet.*?R\$\s*(\d+[,.]\d+)/i);
  if (valorMatch) {
    const valorEncontrado = parseFloat(valorMatch[1].replace(',', '.'));
    const valorEsperado = contratoBase.valor_scm;
    
    if (Math.abs(valorEncontrado - valorEsperado) > 5) { // Tolerância de R$ 5
      erros.push({
        campo: "VALOR SCM",
        encontrado: `R$ ${valorEncontrado.toFixed(2)}`,
        esperado: `R$ ${valorEsperado.toFixed(2)}`,
        explicacao: `Valor não confere com o padrão da categoria ${contratoBase.name}`
      });
    }
  }
  
  // Validar fidelidade
  const fidelidadeMatch = contractText.match(/(\d+)\s*(?:doze|vinte e quatro)\s*meses/i);
  if (fidelidadeMatch) {
    const fidelidadeEncontrada = parseInt(fidelidadeMatch[1]);
    if (fidelidadeEncontrada !== contratoBase.fidelidade_meses) {
      erros.push({
        campo: "FIDELIDADE",
        encontrado: `${fidelidadeEncontrada} meses`,
        esperado: `${contratoBase.fidelidade_meses} meses`,
        explicacao: `Prazo de fidelidade incorreto para ${contratoBase.tipo_plano}`
      });
    }
  }
  
  // Validar IP Fixo para planos corporativos
  if (contratoBase.tipo_plano === 'CORPORATIVO' && contratoBase.ip_fixo_incluso) {
    const ipFixoMatch = contractText.match(/IP.*?Fixo.*?R\$\s*0[.,]00|INCLUSO/i);
    if (!ipFixoMatch) {
      erros.push({
        campo: "IP FIXO",
        encontrado: "Não incluso ou cobrando valor",
        esperado: "IP Fixo INCLUSO (R$ 0,00)",
        explicacao: "Planos corporativos devem ter IP Fixo incluso"
      });
    }
  }
  
  // Validar serviços padrão
  const servicosEsperados = contratoBase.servicos_padrao;
  
  if (servicosEsperados.cnet_livros > 0) {
    const cnetLivrosMatch = contractText.match(/CNET.*?LIVROS.*?R\$\s*(\d+[,.]\d+)/i);
    if (cnetLivrosMatch) {
      const valorEncontrado = parseFloat(cnetLivrosMatch[1].replace(',', '.'));
      if (valorEncontrado !== servicosEsperados.cnet_livros) {
        alertas.push({
          campo: "CNET LIVROS",
          encontrado: `R$ ${valorEncontrado.toFixed(2)}`,
          esperado: `R$ ${servicosEsperados.cnet_livros.toFixed(2)}`,
          tipo: "valor_servico"
        });
      }
    }
  }
  
  return { erros, alertas };
}

// Função para calcular valor total esperado
export function calcularValorTotalEsperado(contratoBase: ContractBaseCategory, ipFixo: boolean = false) {
  let total = contratoBase.valor_scm;
  
  // Adicionar serviços padrão
  total += contratoBase.servicos_padrao.cnet_livros;
  total += contratoBase.servicos_padrao.suporte;
  if (contratoBase.servicos_padrao.cnet_educa) {
    total += contratoBase.servicos_padrao.cnet_educa;
  }
  if (contratoBase.servicos_padrao.cnet_play) {
    total += contratoBase.servicos_padrao.cnet_play;
  }
  
  // IP Fixo (só adiciona se não for incluso e estiver solicitado)
  if (ipFixo && !contratoBase.ip_fixo_incluso) {
    total += 50.00;
  }
  
  return total;
}

// Validação específica para telefones celulares
export function validarTelefoneCelular(telefone: string) {
  const dddMatch = telefone.match(/\((\d{2})\)/);
  const numeroMatch = telefone.match(/\((?:\d{2})\)\s*(\d{4,5})[- ]?(\d{4})/);
  
  if (!dddMatch || !numeroMatch) {
    return {
      valido: false,
      erro: "Formato de telefone inválido"
    };
  }
  
  const ddd = parseInt(dddMatch[1]);
  const parte1 = numeroMatch[1];
  const parte2 = numeroMatch[2];
  const numeroCompleto = parte1 + parte2;
  
  // Validar DDD brasileiro (11-99)
  if (ddd < 11 || ddd > 99) {
    return {
      valido: false,
      erro: `DDD ${ddd} inválido. Deve estar entre 11 e 99`
    };
  }
  
  // Validar celular (9 dígitos começando com 9)
  if (numeroCompleto.length === 9) {
    if (!numeroCompleto.startsWith('9')) {
      return {
        valido: false,
        erro: `Celular deve começar com 9. Encontrado: ${numeroCompleto}`
      };
    }
    return { valido: true, tipo: "celular" };
  }
  
  // Validar fixo (8 dígitos)
  if (numeroCompleto.length === 8) {
    return { valido: true, tipo: "fixo" };
  }
  
  return {
    valido: false,
    erro: `Número com ${numeroCompleto.length} dígitos. Deve ter 8 (fixo) ou 9 (celular começando com 9)`
  };
}
