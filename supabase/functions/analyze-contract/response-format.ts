
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
    // ⚠️ REGRA CRÍTICA: SÓ INCLUA ERROS SE HOUVER DIFERENÇA REAL
    // SE valor_encontrado === valor_esperado → NÃO É ERRO, NÃO INCLUIR
    // EXEMPLO: Encontrado "12 meses" e Esperado "12 meses" → NÃO INCLUIR
    // EXEMPLO: Encontrado "R$ 200,00" e Esperado "R$ 200,00" → NÃO INCLUIR
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

### 5. ⚠️ REGRAS CRÍTICAS PARA VALIDAÇÃO:

**ANTES DE INCLUIR QUALQUER ITEM NO ARRAY "erros", FAÇA ESTA VERIFICAÇÃO:**

1. **Compare EXATAMENTE** o valor encontrado com o valor esperado
2. **SE SÃO IDÊNTICOS** → NÃO É ERRO → NÃO INCLUIR no array
3. **SÓ INCLUA** se houver diferença real entre os valores

**EXEMPLOS PRÁTICOS:**

❌ **NÃO REPORTAR COMO ERRO (valores iguais):**
- Encontrado: "12 meses" / Esperado: "12 meses" → **SÃO IGUAIS → NÃO É ERRO**
- Encontrado: "R$ 200,00" / Esperado: "R$ 200,00" → **SÃO IGUAIS → NÃO É ERRO**
- Encontrado: "RESIDENCIAL" / Esperado: "RESIDENCIAL" → **SÃO IGUAIS → NÃO É ERRO**
- Encontrado: "R$ 129,99" / Esperado: "R$ 129,99" → **SÃO IGUAIS → NÃO É ERRO**

✅ **SIM, REPORTAR COMO ERRO (valores diferentes):**
- Encontrado: "24 meses" / Esperado: "12 meses" → **DIFERENTES → É ERRO**
- Encontrado: "R$ 150,00" / Esperado: "R$ 200,00" → **DIFERENTES → É ERRO**
- Encontrado: "CORPORATIVO" / Esperado: "RESIDENCIAL" → **DIFERENTES → É ERRO**

### 6. ALGORITMO DE DECISÃO:

Para cada campo validado:
  SE (valor_encontrado == valor_esperado):
    → NÃO incluir no array "erros"
    → Campo está correto
  SENÃO:
    → Incluir no array "erros"
    → Definir severidade apropriada

### 7. EXEMPLOS DE RESPOSTA:

**Exemplo de Contrato CORRETO (sem erros reais):**
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

**Exemplo com ERRO REAL (valores diferentes):**
\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95,
    "criterios_identificacao": ["Menção a 600Mbps encontrada"],
    "caracteristicas_esperadas": {
      "valor": "R$ 129,99",
      "vigencia": "12 meses"
    }
  },
  "erros": [
    {
      "severidade": "critico",
      "campo": "Valor do Plano",
      "valor_encontrado": "R$ 120,00",
      "valor_esperado": "R$ 129,99",
      "sugestao_correcao": "Corrigir valor para R$ 129,99",
      "confianca": 100
    }
  ],
  "resumo": {
    "total_erros": 1,
    "criticos": 1,
    "altos": 0,
    "medios": 0,
    "baixos": 0
  },
  "status_geral": "reprovado"
}
\`\`\`

### 8. ⚠️ INSTRUÇÃO FINAL CRÍTICA:

**NUNCA inclua no array "erros" um campo onde valor_encontrado = valor_esperado**
**Se todos os valores estão corretos, o array "erros" deve estar vazio: []**
**Status deve ser "aprovado" quando não há erros reais**
`;
};
