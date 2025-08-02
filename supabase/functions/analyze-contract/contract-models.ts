// 🚀 FASE 2: SISTEMA DE CATEGORIZAÇÃO POR VELOCIDADE + EMPRESA
// Baseado nos contratos fornecidos: 300mb, 500mb, 600mb, 700mb, 800mb, 1gb

export interface ContractModel {
  id: string;
  name: string;
  speed: string;
  company: 'CIABRASNET' | 'WNKBR';
  company_full_name: string;
  ddd: string;
  city: string;
  value: string;
  validity_period: string;
  type: 'CORPORATIVO' | 'RESIDENCIAL';
  installation_fee: string;
  equipment: string;
  cancellation_fee: string;
  fixed_ip: string;
  services: {
    cnet_livros: string;
    cnet_educa?: string;
    cnet_play: string;
    suporte: string;
  };
  clauses: string;
  contract_type?: 'PROMOCIONAL' | 'CONVENIO' | 'NORMAL';
}

// 📊 MODELOS DE CONTRATOS POR VELOCIDADE E EMPRESA
export const CONTRACT_MODELS: ContractModel[] = [
  // === CIABRASNET (MATRIZ) - Porto União - DDD 42 ===
  {
    id: 'ciabrasnet_300mb_residencial',
    name: '2025 PROMOCIONAL COMBO 300MBPS',
    speed: '300mb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 109,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade) ou R$ 200,00',
    equipment: 'ONU R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 19,90'
    },
    clauses: '1 a 11',
    contract_type: 'PROMOCIONAL'
  },
  {
    id: 'ciabrasnet_300mb_convenio',
    name: 'CONVENIO COMBO 300 Mbps MATRIZ',
    speed: '300mb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 109,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONU R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 19,90'
    },
    clauses: '1 a 11',
    contract_type: 'CONVENIO'
  },
  {
    id: 'ciabrasnet_500mb_residencial',
    name: 'Convenio Combo 500 Mbps MATRIZ',
    speed: '500mb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 119,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONU R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 14,90'
    },
    clauses: '1 a 11',
    contract_type: 'CONVENIO'
  },
  {
    id: 'ciabrasnet_600mb_residencial',
    name: 'COM IP UPGRADE COMBO 600 MB',
    speed: '600mb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 129,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT + 700ONU + ROTEADOR + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 14,90'
    },
    clauses: '1 a 11'
  },
  {
    id: 'ciabrasnet_700mb_residencial',
    name: 'Convenio Combo 700 Mbps Matriz',
    speed: '700mb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 139,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_educa: 'R$ 19,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 9,90'
    },
    clauses: '1 a 11',
    contract_type: 'CONVENIO'
  },
  {
    id: 'ciabrasnet_800mb_residencial',
    name: 'COMBO 800 Mbps R 14999 MATRIZ',
    speed: '800mb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 159,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_educa: 'R$ 19,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 14,90'
    },
    clauses: '1 a 11'
  },
  {
    id: 'ciabrasnet_1gb_residencial',
    name: '2024 Combo Giga',
    speed: '1gb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 209,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_educa: 'R$ 19,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 14,90'
    },
    clauses: '1 a 11'
  },
  {
    id: 'ciabrasnet_1gb_corporativo',
    name: '1 Gb Empresarial',
    speed: '1gb',
    company: 'CIABRASNET',
    company_full_name: 'CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA',
    ddd: '42',
    city: 'Porto União',
    value: 'R$ 229,90',
    validity_period: '24 meses',
    type: 'CORPORATIVO',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'INCLUSO (Fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_educa: 'R$ 19,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 14,90'
    },
    clauses: '1 a 11'
  },

  // === WNKBR - Papanduva - DDD 47 ===
  {
    id: 'wnkbr_300mb_residencial',
    name: 'CONVENIO COMBO 300MBPS WNKBR',
    speed: '300mb',
    company: 'WNKBR',
    company_full_name: 'WNKBR TELECOM LTDA',
    ddd: '47',
    city: 'Papanduva',
    value: 'R$ 109,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONU R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 19,90'
    },
    clauses: '1 a 11',
    contract_type: 'CONVENIO'
  },
  {
    id: 'wnkbr_500mb_residencial',
    name: 'CONVENIO COMBO 500MBPS WNKBR',
    speed: '500mb',
    company: 'WNKBR',
    company_full_name: 'WNKBR TELECOM LTDA',
    ddd: '47',
    city: 'Papanduva',
    value: 'R$ 119,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONU R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 14,90'
    },
    clauses: '1 a 11',
    contract_type: 'CONVENIO'
  },
  {
    id: 'wnkbr_700mb_residencial',
    name: 'CONVENIO COMBO 700 MBPS WNKBR',
    speed: '700mb',
    company: 'WNKBR',
    company_full_name: 'WNKBR TELECOM LTDA',
    ddd: '47',
    city: 'Papanduva',
    value: 'R$ 139,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'R$ 700,00 descontados proporcionalmente',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    services: {
      cnet_livros: 'R$ 29,90',
      cnet_educa: 'R$ 19,90',
      cnet_play: 'R$ 0,00',
      suporte: 'R$ 9,90'
    },
    clauses: '1 a 11',
    contract_type: 'CONVENIO'
  }
];

// 🔍 FUNÇÕES DE BUSCA E CATEGORIZAÇÃO
export const getContractModelById = (id: string): ContractModel | undefined => {
  return CONTRACT_MODELS.find(model => model.id === id);
};

export const getContractModelByName = (name: string): ContractModel | undefined => {
  return CONTRACT_MODELS.find(model => 
    model.name.toLowerCase() === name.toLowerCase() ||
    model.name.toLowerCase().includes(name.toLowerCase())
  );
};

// 🎯 BUSCA POR VELOCIDADE + EMPRESA
export const getModelsBySpeedAndCompany = (speed: string, company: 'CIABRASNET' | 'WNKBR'): ContractModel[] => {
  return CONTRACT_MODELS.filter(model => 
    model.speed === speed && model.company === company
  );
};

// 📊 BUSCA POR VELOCIDADE (TODAS AS EMPRESAS)
export const getModelsBySpeed = (speed: string): ContractModel[] => {
  return CONTRACT_MODELS.filter(model => model.speed === speed);
};

// 🏢 BUSCA POR EMPRESA
export const getModelsByCompany = (company: 'CIABRASNET' | 'WNKBR'): ContractModel[] => {
  return CONTRACT_MODELS.filter(model => model.company === company);
};

// 🔍 IDENTIFICAÇÃO AUTOMÁTICA DO MODELO BASEADO NO TEXTO
export const identifyContractModel = (contractText: string): ContractModel | null => {
  const text = contractText.toLowerCase();
  
  // Identificar empresa
  let company: 'CIABRASNET' | 'WNKBR' | null = null;
  if (text.includes('ciabrasnet') || text.includes('matriz') || text.includes('porto união')) {
    company = 'CIABRASNET';
  } else if (text.includes('wnkbr') || text.includes('papanduva')) {
    company = 'WNKBR';
  }
  
  // Identificar velocidade
  let speed: string | null = null;
  if (text.includes('300') && (text.includes('mb') || text.includes('mega'))) {
    speed = '300mb';
  } else if (text.includes('500') && (text.includes('mb') || text.includes('mega'))) {
    speed = '500mb';
  } else if (text.includes('600') && (text.includes('mb') || text.includes('mega'))) {
    speed = '600mb';
  } else if (text.includes('700') && (text.includes('mb') || text.includes('mega'))) {
    speed = '700mb';
  } else if (text.includes('800') && (text.includes('mb') || text.includes('mega'))) {
    speed = '800mb';
  } else if (text.includes('1') && (text.includes('gb') || text.includes('giga'))) {
    speed = '1gb';
  }
  
  // Identificar tipo
  let type: 'CORPORATIVO' | 'RESIDENCIAL' | null = null;
  if (text.includes('empresarial') || text.includes('corporativo')) {
    type = 'CORPORATIVO';
  } else {
    type = 'RESIDENCIAL';
  }
  
  // Buscar modelo correspondente
  if (company && speed) {
    const models = getModelsBySpeedAndCompany(speed, company);
    
    if (models.length === 1) {
      return models[0];
    } else if (models.length > 1) {
      // Se há múltiplos modelos, filtrar por tipo
      const filteredByType = models.filter(m => m.type === type);
      if (filteredByType.length === 1) {
        return filteredByType[0];
      }
      // Se ainda há múltiplos, retornar o primeiro
      return models[0];
    }
  }
  
  return null;
};

// 💰 CÁLCULO DE VALOR TOTAL ESPERADO
export const calculateExpectedTotal = (model: ContractModel, ipFixed: boolean = false): number => {
  let total = parseFloat(model.value.replace('R$', '').replace(',', '.').trim());
  
  // Adicionar serviços
  total += parseFloat(model.services.cnet_livros.replace('R$', '').replace(',', '.').trim());
  total += parseFloat(model.services.suporte.replace('R$', '').replace(',', '.').trim());
  
  if (model.services.cnet_educa) {
    total += parseFloat(model.services.cnet_educa.replace('R$', '').replace(',', '.').trim());
  }
  
  total += parseFloat(model.services.cnet_play.replace('R$', '').replace(',', '.').trim());
  
  // IP Fixo apenas se marcado como FIXO
  if (ipFixed && !model.fixed_ip.includes('INCLUSO')) {
    total += 50.00;
  }
  
  return Math.round(total * 100) / 100; // Arredondar para 2 casas decimais
};

// 📋 LISTA DE VELOCIDADES DISPONÍVEIS
export const AVAILABLE_SPEEDS = ['300mb', '500mb', '600mb', '700mb', '800mb', '1gb'] as const;

// 🏢 LISTA DE EMPRESAS
export const AVAILABLE_COMPANIES = ['CIABRASNET', 'WNKBR'] as const;

// 📊 ESTATÍSTICAS DOS MODELOS
export const getModelStats = () => {
  return {
    total_models: CONTRACT_MODELS.length,
    by_company: {
      CIABRASNET: CONTRACT_MODELS.filter(m => m.company === 'CIABRASNET').length,
      WNKBR: CONTRACT_MODELS.filter(m => m.company === 'WNKBR').length
    },
    by_speed: AVAILABLE_SPEEDS.reduce((acc, speed) => {
      acc[speed] = CONTRACT_MODELS.filter(m => m.speed === speed).length;
      return acc;
    }, {} as Record<string, number>),
    by_type: {
      RESIDENCIAL: CONTRACT_MODELS.filter(m => m.type === 'RESIDENCIAL').length,
      CORPORATIVO: CONTRACT_MODELS.filter(m => m.type === 'CORPORATIVO').length
    }
  };
};
