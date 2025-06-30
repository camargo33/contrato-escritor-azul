
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
    // APENAS INCLUIR SE HOUVER DIFERENÇA REAL ENTRE ENCONTRADO E ESPERADO
    // SE TODOS OS VALORES ESTIVEREM CORRETOS, DEIXAR ESTE ARRAY VAZIO: []
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
    "total_erros": 0,
    "criticos": 0,
    "altos": 0,
    "medios": 0,
    "baixos": 0,
    "plano_identificado": "nome do plano"
  },
  "status_geral": "aprovado|aprovado_com_restricoes|reprovado"
}
\`\`\`

### 5. REGRAS IMPORTANTES PARA O ARRAY DE ERROS:

**CRÍTICO:** Apenas inclua erros quando há DIFERENÇA REAL entre encontrado e esperado.

**EXEMPLOS DE QUANDO NÃO INCLUIR NO ARRAY DE ERROS:**
- ✅ Encontrado: "R$ 129,99" / Esperado: "R$ 129,99" → Valor correto, não incluir
- ✅ Encontrado: "12 meses" / Esperado: "12 meses" → Valor correto, não incluir
- ✅ Encontrado: "RESIDENCIAL" / Esperado: "RESIDENCIAL" → Valor correto, não incluir

**EXEMPLOS DE QUANDO INCLUIR NO ARRAY DE ERROS:**
- ❌ Encontrado: "R$ 120,00" / Esperado: "R$ 129,99" → Diferença real, incluir
- ❌ Encontrado: "24 meses" / Esperado: "12 meses" → Diferença real, incluir
- ❌ Encontrado: "CORPORATIVO" / Esperado: "RESIDENCIAL" → Diferença real, incluir

### 6. EXEMPLOS DE RESPOSTA:

**Exemplo de Contrato SEM ERROS:**
\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95,
    "criterios_identificacao": ["Valor R$ 129,99 encontrado", "Menção a 600Mbps"],
    "caracteristicas_esperadas": {
      "valor": "R$ 129,99",
      "tipo": "RESIDENCIAL",
      "vigencia": "12 meses",
      "taxa_instalacao": "R$ 200,00",
      "rescisao": "R$ 500,00"
    }
  },
  "erros": [],
  "resumo": {
    "total_erros": 0,
    "criticos": 0,
    "altos": 0,
    "medios": 0,
    "baixos": 0,
    "plano_identificado": "2024 Combo 600Mbps"
  },
  "status_geral": "aprovado"
}
\`\`\`

**Exemplo de Contrato COM ERROS:**
\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95,
    "criterios_identificacao": ["Menção a 600Mbps encontrada"],
    "caracteristicas_esperadas": {
      "valor": "R$ 129,99",
      "tipo": "RESIDENCIAL",
      "vigencia": "12 meses"
    }
  },
  "erros": [
    {
      "severidade": "critico",
      "campo": "Valor do Plano",
      "valor_encontrado": "R$ 120,00",
      "valor_esperado": "R$ 129,99",
      "sugestao_correcao": "Corrigir valor para R$ 129,99 conforme padrão do plano",
      "plano_identificado": "2024 Combo 600Mbps",
      "confianca": 100
    }
  ],
  "resumo": {
    "total_erros": 1,
    "criticos": 1,
    "altos": 0,
    "medios": 0,
    "baixos": 0,
    "plano_identificado": "2024 Combo 600Mbps"
  },
  "status_geral": "reprovado"
}
\`\`\`

### 7. CASOS DE IDENTIFICAÇÃO INCERTA:

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
