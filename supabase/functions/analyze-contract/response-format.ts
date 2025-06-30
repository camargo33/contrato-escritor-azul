
export const createResponseFormatInstructions = (): string => {
  return `
### 4. FORMATO DE RESPOSTA:

Para cada análise, retorne OBRIGATORIAMENTE:

\`\`\`json
{
  "modelo_identificado": {
    "nome": "nome do modelo identificado",
    "confianca": 95,
    "criterios_identificacao": ["critério 1", "critério 2"],
    "caracteristicas_esperadas": {
      "valor": "R$ 209,99",
      "tipo": "RESIDENCIAL",
      "vigencia": "12 meses",
      "taxa_instalacao": "GRATUITA",
      "rescisao": "R$ 700,00"
    }
  },
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

### 5. EXEMPLOS DE IDENTIFICAÇÃO E ANÁLISE:

**Exemplo de Identificação Bem-Sucedida:**
\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo Giga",
    "confianca": 95,
    "criterios_identificacao": ["Texto contém 'Combo Giga'", "Valor R$ 209,99 encontrado"],
    "caracteristicas_esperadas": {
      "valor": "R$ 209,99",
      "tipo": "RESIDENCIAL", 
      "vigencia": "12 meses",
      "taxa_instalacao": "GRATUITA",
      "rescisao": "R$ 700,00"
    }
  }
}
\`\`\`

**Exemplo de Erro Baseado no Modelo Identificado:**
\`\`\`json
{
  "severidade": "critico",
  "campo": "Valor do Plano",
  "valor_encontrado": "R$ 200,00",
  "valor_esperado": "R$ 209,99",
  "sugestao_correcao": "Corrigir valor para R$ 209,99 conforme padrão do modelo '2024 Combo Giga' identificado",
  "plano_identificado": "2024 Combo Giga",
  "confianca": 100
}
\`\`\`

### 6. CASOS DE IDENTIFICAÇÃO INCERTA:

Quando a confiança for menor que 80%:
\`\`\`json
{
  "modelo_identificado": {
    "nome": "Incerto - Possível 2024 Combo 300Mbps",
    "confianca": 65,
    "criterios_identificacao": ["Valor próximo a R$ 109,99"],
    "observacao": "Identificação incerta. Recomenda-se revisão manual do contrato."
  }
}
\`\`\`
`;
};
