

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
    // ⚠️ REGRA CRÍTICA ABSOLUTA: 
    // NUNCA INCLUA CAMPOS ONDE OS VALORES SÃO IDÊNTICOS
    // APENAS INCLUA SE HOUVER DIFERENÇA REAL
    // 
    // ❌ NUNCA FAÇA ISSO:
    // - Encontrado: "12 meses" / Esperado: "12 meses" → NÃO INCLUIR
    // - Encontrado: "R$ 200,00" / Esperado: "R$ 200,00" → NÃO INCLUIR
    // 
    // ✅ APENAS FAÇA ISSO:
    // - Encontrado: "24 meses" / Esperado: "12 meses" → INCLUIR COMO ERRO
    // - Encontrado: "R$ 150,00" / Esperado: "R$ 200,00" → INCLUIR COMO ERRO
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

### 5. ⚠️ REGRA CRÍTICA PARA VALIDAÇÃO - ALGORITMO OBRIGATÓRIO:

**PARA CADA CAMPO ANALISADO, EXECUTE ESTE ALGORITMO:**

\`\`\`
1. EXTRAIR valor_encontrado_no_contrato
2. OBTER valor_esperado_da_tabela_referencia  
3. COMPARAR EXATAMENTE os dois valores
4. SE (valor_encontrado_no_contrato === valor_esperado_da_tabela_referencia):
     → É UM ACERTO ✅
     → NÃO incluir no array "erros"
     → PULAR para o próximo campo
   SENÃO:
     → É UM ERRO REAL ❌  
     → Incluir no array "erros"
     → Definir severidade apropriada
\`\`\`

### 6. EXEMPLOS PRÁTICOS OBRIGATÓRIOS:

**❌ NUNCA REPORTAR COMO ERRO (são acertos):**
- Encontrado: "12 meses" | Esperado: "12 meses" → **ACERTO - NÃO INCLUIR**
- Encontrado: "R$ 200,00" | Esperado: "R$ 200,00" → **ACERTO - NÃO INCLUIR**  
- Encontrado: "RESIDENCIAL" | Esperado: "RESIDENCIAL" → **ACERTO - NÃO INCLUIR**
- Encontrado: "R$ 129,99" | Esperado: "R$ 129,99" → **ACERTO - NÃO INCLUIR**
- Encontrado: "Variável (R$ 50,00 se fixo)" | Esperado: "Variável (R$ 50,00 se fixo)" → **ACERTO - NÃO INCLUIR**

**✅ APENAS REPORTAR COMO ERRO (são divergências reais):**
- Encontrado: "24 meses" | Esperado: "12 meses" → **ERRO REAL - INCLUIR**
- Encontrado: "R$ 150,00" | Esperado: "R$ 200,00" → **ERRO REAL - INCLUIR**
- Encontrado: "CORPORATIVO" | Esperado: "RESIDENCIAL" → **ERRO REAL - INCLUIR**

### 7. INSTRUÇÕES FINAIS CRÍTICAS:

1. **VALORES IDÊNTICOS = ACERTO = IGNORAR COMPLETAMENTE**
2. **VALORES DIFERENTES = ERRO = INCLUIR NO ARRAY**  
3. **SE TODOS OS VALORES ESTÃO CORRETOS**: array "erros" deve ser vazio []
4. **SE NÃO HÁ ERROS REAIS**: status_geral deve ser "aprovado"
5. **NUNCA inclua no array "erros" campos onde valor_encontrado = valor_esperado**

### 8. EXEMPLO DE CONTRATO CORRETO (sem erros reais):

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

### 9. EXEMPLO COM ERRO REAL (valores diferentes):

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

### 10. ⚠️ INSTRUÇÃO FINAL ABSOLUTA:

**JAMAIS inclua no array "erros" um campo onde valor_encontrado = valor_esperado**
**Valores iguais significam que o campo está CORRETO**
**Array "erros" vazio [] quando todos os valores estão corretos**
**Status "aprovado" quando não há divergências reais**
`;
};

