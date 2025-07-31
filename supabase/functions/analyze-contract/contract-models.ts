
export interface ContractModel {
  id: string;
  name: string;
  value: string;
  validity_period: string;
  type: 'CORPORATIVO' | 'RESIDENCIAL';
  installation_fee: string;
  equipment: string;
  cancellation_fee: string;
  fixed_ip: string;
  clauses: string;
}

export const CONTRACT_MODELS: ContractModel[] = [
  {
    id: 'empresarial_1gb',
    name: '1 Gb Empresarial',
    value: 'R$ 229,90',
    validity_period: '24 meses',
    type: 'CORPORATIVO',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'Calculada pela regra de fidelidade',
    fixed_ip: 'INCLUSO (Fixo marcado)',
    clauses: '1 a 11'
  },
  {
    id: 'combo_giga_2024',
    name: '2024 Combo Giga',
    value: 'R$ 209,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'Calculada pela regra de fidelidade',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    clauses: '1 a 11'
  },
  {
    id: 'combo_300mbps_2024',
    name: '2024 Combo 300Mbps',
    value: 'R$ 109,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'Varia conforme fidelidade (ver texto do contrato)',
    equipment: 'ONU R$ 350,00 + ROTEADOR R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'Calculada pela regra de fidelidade',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    clauses: '1 a 11'
  },
  {
    id: 'combo_500_megas_2025',
    name: 'COMBO 2025 500 MEGAS MATRIZ',
    value: 'R$ 119,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'Varia conforme fidelidade (ver texto do contrato)',
    equipment: 'ONU R$ 350,00 + ROTEADOR R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'Calculada pela regra de fidelidade',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    clauses: '1 a 11'
  },
  {
    id: 'combo_600mbps_2024',
    name: '2024 Combo 600Mbps',
    value: 'R$ 129,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'Varia conforme fidelidade (ver texto do contrato)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'Calculada pela regra de fidelidade',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    clauses: '1 a 11'
  },
  {
    id: 'combo_800mbps_2024',
    name: '2024 Combo 800Mbps',
    value: 'R$ 159,99',
    validity_period: '12 meses',
    type: 'RESIDENCIAL',
    installation_fee: 'GRATUITA (com fidelidade)',
    equipment: 'ONT R$ 350,00 + Conectores/cabos R$ 700,00',
    cancellation_fee: 'Calculada pela regra de fidelidade',
    fixed_ip: 'Variável (R$ 50,00 se fixo marcado)',
    clauses: '1 a 11'
  }
];

export const getContractModelById = (id: string): ContractModel | undefined => {
  return CONTRACT_MODELS.find(model => model.id === id);
};

export const getContractModelByName = (name: string): ContractModel | undefined => {
  return CONTRACT_MODELS.find(model => 
    model.name.toLowerCase() === name.toLowerCase() ||
    model.name.toLowerCase().includes(name.toLowerCase())
  );
};
