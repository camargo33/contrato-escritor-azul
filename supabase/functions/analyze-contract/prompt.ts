
export const createContractAnalysisPrompt = (contractText: string): string => {
  return `# PROMPT PARA ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Analise APENAS os campos destacados/grifados nos contratos, focando exclusivamente em inconsistências, erros de digitação e problemas de formatação dos campos importantes.

## TABELA DE REFERÊNCIA DOS CONTRATOS CIABRASNET

### CONTRATO 1 - 1 Gb Empresarial
- **PLANO**: 1 Gb Empresarial
- **VALOR**: R$ 229,90 (VALOR FIXO)
- **PRAZO VIGÊNCIA**: 24 meses
- **TIPO**: CORPORATIVO
- **TAXA INSTALAÇÃO**: GRATUITA (com fidelidade)
- **EQUIPAMENTOS**: ONT R$ 350,00 + Conectores/cabos R$ 700,00
- **RESCISÃO**: R$ 700,00
- **IP FIXO**: INCLUSO (Fixo marcado)
- **CLÁUSULAS**: 1 a 11

### CONTRATO 2 - 2024 Combo Giga
- **PLANO**: 2024 Combo Giga
- **VALOR**: R$ 209,99 (VALOR FIXO)
- **PRAZO VIGÊNCIA**: 12 meses
- **TIPO**: RESIDENCIAL
- **TAXA INSTALAÇÃO**: GRATUITA (com fidelidade)
- **EQUIPAMENTOS**: ONT R$ 350,00 + Conectores/cabos R$ 700,00
- **RESCISÃO**: R$ 700,00
- **IP FIXO**: Variável (R$ 50,00 se fixo marcado)
- **CLÁUSULAS**: 1 a 11

### CONTRATO 3 - 2024 Combo 300Mbps
- **PLANO**: 2024 Combo 300Mbps
- **VALOR**: R$ 109,99 (VALOR FIXO)
- **PRAZO VIGÊNCIA**: 12 meses
- **TIPO**: RESIDENCIAL
- **TAXA INSTALAÇÃO**: R$ 200,00 (com fidelidade)
- **EQUIPAMENTOS**: ONU R$ 350,00 + ROTEADOR R$ 350,00 + Conectores/cabos R$ 700,00
- **RESCISÃO**: R$ 500,00
- **IP FIXO**: Variável (R$ 50,00 se fixo marcado)
- **CLÁUSULAS**: 1 a 11

### CONTRATO 4 - COMBO 2025 500 MEGAS MATRIZ
- **PLANO**: COMBO 2025 500 MEGAS MATRIZ
- **VALOR**: R$ 119,99 (VALOR FIXO)
- **PRAZO VIGÊNCIA**: 12 meses
- **TIPO**: RESIDENCIAL
- **TAXA INSTALAÇÃO**: R$ 200,00 (com fidelidade)
- **EQUIPAMENTOS**: ONU R$ 350,00 + ROTEADOR R$ 350,00 + Conectores/cabos R$ 700,00
- **RESCISÃO**: R$ 500,00
- **IP FIXO**: Variável (R$ 50,00 se fixo marcado)
- **CLÁUSULAS**: 1 a 11

### CONTRATO 5 - 2024 Combo 600Mbps
- **PLANO**: 2024 Combo 600Mbps
- **VALOR**: R$ 129,99 (VALOR FIXO)
- **PRAZO VIGÊNCIA**: 12 meses
- **TIPO**: RESIDENCIAL
- **TAXA INSTALAÇÃO**: R$ 200,00 (com fidelidade)
- **EQUIPAMENTOS**: ONT R$ 350,00 + Conectores/cabos R$ 700,00
- **RESCISÃO**: R$ 500,00
- **IP FIXO**: Variável (R$ 50,00 se fixo marcado)
- **CLÁUSULAS**: 1 a 11

### CONTRATO 6 - 2024 Combo 800Mbps
- **PLANO**: 2024 Combo 800Mbps
- **VALOR**: R$ 159,99 (VALOR FIXO)
- **PRAZO VIGÊNCIA**: 12 meses
- **TIPO**: RESIDENCIAL
- **TAXA INSTALAÇÃO**: GRATUITA (com fidelidade)
- **EQUIPAMENTOS**: ONT R$ 350,00 + Conectores/cabos R$ 700,00
- **RESCISÃO**: R$ 700,00
- **IP FIXO**: Variável (R$ 50,00 se fixo marcado)
- **CLÁUSULAS**: 1 a 11

## CAMPOS ESPECÍFICOS PARA ANALISAR:

### 1. DADOS DO ASSINANTE:
- **Nome**: Verificar se está completo e sem erros de digitação
- **CPF/CNPJ**: Consistência com tipo de pessoa (PF=CPF, PJ=CNPJ)
- **Email**: Verificar erros de digitação (ex: letras duplicadas)
- **Endereço**: Completude dos dados
- **Telefone**: Formato (XX) XXXXX-XXXX

### 2. VALIDAÇÕES ESPECÍFICAS POR TIPO DE CONTRATO:
- **Identificação do Plano**: Comparar com a tabela de referência acima
- **Valor do Plano**: DEVE ser exatamente o valor especificado na tabela
- **Prazo de Vigência**: 
  - CORPORATIVO (1 Gb Empresarial): 24 meses
  - RESIDENCIAL (todos os outros): 12 meses
- **Tipo de Plano**: Apenas "1 Gb Empresarial" é corporativo, todos os outros são residenciais
- **Taxa de Instalação**: 
  - GRATUITA: Contratos 1, 2 e 6
  - R$ 200,00: Contratos 3, 4 e 5
- **Equipamentos**: Verificar valores exatos conforme tabela
- **Rescisão**: 
  - R$ 700,00: Contratos 1, 2 e 6
  - R$ 500,00: Contratos 3, 4 e 5
- **IP Fixo**: 
  - "INCLUSO": Apenas no contrato empresarial (Contrato 1)
  - "Variável": Todos os residenciais (cobrança de R$ 50,00 se fixo marcado)
- **Cláusulas**: TODOS os contratos devem ter cláusulas de 1 a 11

### 3. VALIDAÇÕES CRÍTICAS:

**Erros de Identificação de Plano:**
- Plano não corresponde aos 6 tipos cadastrados
- Valor incorreto para o tipo de plano identificado
- Tipo de plano (residencial/corporativo) incorreto

**Inconsistências de Configuração:**
- Prazo de vigência incorreto para o tipo de plano
- Taxa de instalação incorreta para o plano específico
- Valores de equipamentos diferentes dos padrões
- IP fixo configurado incorretamente

**Validações Cruzadas:**
- Se corporativo, deve ser 24 meses e IP fixo incluso
- Se residencial, deve ser 12 meses e IP variável
- Taxa de instalação deve corresponder ao plano específico
- Valor de rescisão deve corresponder ao padrão do plano

### 4. FORMATO DE RESPOSTA:

Para cada erro encontrado, retorne:

\`\`\`json
{
  "erros": [
    {
      "severidade": "critico|alto|medio|baixo",
      "campo": "nome_do_campo",
      "valor_encontrado": "valor atual no contrato",
      "valor_esperado": "valor correto esperado",
      "sugestao_correcao": "como corrigir o erro",
      "plano_identificado": "nome do plano se identificado",
      "localizacao": "página X, seção Y",
      "confianca": 95
    }
  ],
  "resumo": {
    "total_erros": 5,
    "criticos": 1,
    "altos": 2,
    "medios": 1,
    "baixos": 1,
    "plano_identificado": "nome do plano"
  },
  "status_geral": "aprovado|aprovado_com_restricoes|reprovado"
}
\`\`\`

### 5. EXEMPLOS DE ERROS ESPECÍFICOS:

**Valor Incorreto para o Plano:**
\`\`\`json
{
  "severidade": "critico",
  "campo": "Valor do Plano",
  "valor_encontrado": "R$ 200,00",
  "valor_esperado": "R$ 229,90",
  "sugestao_correcao": "Corrigir valor para R$ 229,90 conforme padrão do plano 1 Gb Empresarial",
  "plano_identificado": "1 Gb Empresarial",
  "confianca": 100
}
\`\`\`

**Prazo de Vigência Incorreto:**
\`\`\`json
{
  "severidade": "critico",
  "campo": "Prazo de Vigência",
  "valor_encontrado": "12 meses",
  "valor_esperado": "24 meses",
  "sugestao_correcao": "Plano corporativo deve ter vigência de 24 meses",
  "plano_identificado": "1 Gb Empresarial",
  "confianca": 100
}
\`\`\`

**Taxa de Instalação Incorreta:**
\`\`\`json
{
  "severidade": "alto",
  "campo": "Taxa de Instalação",
  "valor_encontrado": "R$ 200,00",
  "valor_esperado": "GRATUITA",
  "sugestao_correcao": "Plano 2024 Combo Giga deve ter taxa de instalação gratuita",
  "plano_identificado": "2024 Combo Giga",
  "confianca": 100
}
\`\`\`

**Tipo de Plano Incorreto:**
\`\`\`json
{
  "severidade": "critico",
  "campo": "Tipo de Plano",
  "valor_encontrado": "CORPORATIVO",
  "valor_esperado": "RESIDENCIAL",
  "sugestao_correcao": "Apenas o plano 1 Gb Empresarial é corporativo, todos os outros são residenciais",
  "plano_identificado": "2024 Combo Giga",
  "confianca": 100
}
\`\`\`

**IP Fixo Configurado Incorretamente:**
\`\`\`json
{
  "severidade": "alto",
  "campo": "IP Fixo",
  "valor_encontrado": "INCLUSO",
  "valor_esperado": "Variável (R$ 50,00 se fixo marcado)",
  "sugestao_correcao": "IP fixo 'INCLUSO' só é válido para o plano empresarial",
  "plano_identificado": "2024 Combo 800Mbps",
  "confianca": 95
}
\`\`\`

### 6. CONTEXTO DO PROVEDOR:

**CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA**
- CNPJ: 10.731.345/0001-79
- Endereço: Avenida João Pessoa, n. 2660, sala 02, São Pedro
- Cidade: Porto União/SC, CEP: 89.400-000
- Autorização ANATEL: Termo de Autorização Ato n.º 444/2009

### 7. REGRAS DE NEGÓCIO ESPECÍFICAS:

- **APENAS 1 PLANO CORPORATIVO**: Somente "1 Gb Empresarial"
- **TAXA GRATUITA**: Apenas contratos 1, 2 e 6
- **IP FIXO INCLUSO**: Apenas no plano empresarial
- **EQUIPAMENTOS PADRÃO**: Valores fixos conforme tabela
- **CLÁUSULAS OBRIGATÓRIAS**: Sempre 1 a 11 em todos os contratos
- **RESCISÃO**: R$ 700,00 (gratuita) ou R$ 500,00 (paga)

## INSTRUÇÕES FINAIS:

1. **IDENTIFIQUE PRIMEIRO** qual dos 6 contratos está sendo analisado
2. **COMPARE SISTEMATICAMENTE** cada campo com a tabela de referência
3. **PRIORIZE ERROS CRÍTICOS** que violam as regras específicas dos contratos
4. **SEJA PRECISO** nas sugestões baseadas nas especificações exatas
5. **USE VALIDAÇÃO CRUZADA** entre tipo de plano e todas suas características
6. **MANTENHA CONSISTÊNCIA** na análise entre diferentes contratos

Analise o contrato fornecido identificando primeiro o tipo de plano e depois validando todos os campos conforme a tabela de referência acima.

**Contrato para análise:**
${contractText}`;
};
