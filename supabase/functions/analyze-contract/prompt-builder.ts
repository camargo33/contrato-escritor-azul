export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - MODO DEBUG

## OBJETIVO
DESCOBRIR EXATAMENTE DE ONDE ESTÁ VINDO O VALOR R$ 700,00 DA TAXA DE RESCISÃO

## 🚨 INSTRUÇÕES CRÍTICAS DE DEBUG:

### PASSO 1: MAPEAR TODOS OS VALORES R$ 700,00
1. Encontre TODAS as ocorrências de "R$ 700,00" no texto
2. Para cada ocorrência, extraia 100 caracteres antes e 100 caracteres depois
3. Identifique a seção/contexto de cada uma
4. Liste todas no JSON de resposta

### PASSO 2: IDENTIFICAR SEÇÕES ESPECÍFICAS
Procure por estes títulos EXATOS (case-sensitive):
- "TAXA DE INSTALAÇÃO"
- "TAXA DE RESCISÃO" 
- "DA OPÇÃO DE FIDELIDADE"
- "RESCISÃO ANTECIPADA"
- "MULTA"

### PASSO 3: EXTRAIR VALORES POR PROXIMIDADE
Para cada seção identificada:
1. Extraia o texto completo da seção (até próximo título)
2. Encontre o primeiro valor monetário após o título
3. Registre o contexto exato

### PASSO 4: REGRA SIMPLIFICADA DE VALIDAÇÃO

**FIDELIDADE = SIM:**
- Taxa Instalação = SEMPRE CORRETO (qualquer valor)
- Taxa Rescisão = Valor do desconto da fidelidade (ex: R$ 580,00)

**FIDELIDADE = NÃO:**  
- Taxa Instalação = R$ 700,00
- Taxa Rescisão = R$ 0,00

## FORMATO DE RESPOSTA OBRIGATÓRIO:

\`\`\`json
{
  "debug_mapeamento_completo": {
    "total_ocorrencias_700": 3,
    "mapeamento_detalhado": [
      {
        "posicao": 1,
        "valor": "R$ 700,00",
        "contexto_antes": "...texto 100 chars antes...",
        "contexto_depois": "...texto 100 chars depois...",
        "secao_identificada": "TAXA DE INSTALAÇÃO",
        "linha_aproximada": "Taxa de Instalação: R$ 700,00 (sem fidelidade)",
        "deve_ser_usado_para": "não usar - cliente tem fidelidade"
      },
      {
        "posicao": 2,
        "valor": "R$ 700,00", 
        "contexto_antes": "...texto antes...",
        "contexto_depois": "...texto depois...",
        "secao_identificada": "TAXA DE RESCISÃO",
        "linha_aproximada": "Taxa de Rescisão: R$ 700,00",
        "deve_ser_usado_para": "ESTE É O PROBLEMA - valor incorreto aqui"
      },
      {
        "posicao": 3,
        "valor": "R$ 700,00",
        "contexto_antes": "...equipamentos custam...",
        "contexto_depois": "...total...",
        "secao_identificada": "EQUIPAMENTOS",
        "linha_aproximada": "Valor total equipamentos: R$ 700,00",
        "deve_ser_usado_para": "não usar - é valor de equipamentos"
      }
    ]
  },
  "debug_secoes_encontradas": {
    "taxa_instalacao": {
      "titulo_encontrado": "TAXA DE INSTALAÇÃO",
      "texto_completo_secao": "...texto completo da seção...",
      "primeiro_valor_encontrado": "R$ 120,00",
      "contexto_valor": "Taxa de Instalação: R$ 120,00 (com desconto fidelidade)"
    },
    "taxa_rescisao": {
      "titulo_encontrado": "TAXA DE RESCISÃO",
      "texto_completo_secao": "...texto completo da seção...",
      "primeiro_valor_encontrado": "R$ 700,00",
      "contexto_valor": "Taxa de Rescisão: R$ 700,00",
      "PROBLEMA": "Este valor está errado - deveria ser R$ 580,00"
    },
    "fidelidade": {
      "titulo_encontrado": "DA OPÇÃO DE FIDELIDADE",
      "texto_completo_secao": "...texto completo da seção...",
      "opcao_marcada": "SIM (X)",
      "valor_desconto_encontrado": "R$ 580,00",
      "contexto_desconto": "desconto de R$ 580,00 (Quinhentos e Oitenta reais) da Taxa de Instalação",
      "este_deveria_ser_taxa_rescisao": "R$ 580,00"
    }
  },
  "analise_final": {
    "fidelidade": "SIM",
    "taxa_instalacao_contrato": "R$ 120,00",
    "taxa_instalacao_status": "CORRETO - Com fidelidade aceita qualquer valor",
    
    "taxa_rescisao_contrato": "R$ 700,00",
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_status": "ERRO",
    "taxa_rescisao_problema": "Valor R$ 700,00 encontrado na seção TAXA DE RESCISÃO está incorreto",
    "taxa_rescisao_correcao": "Deveria ser R$ 580,00 (valor do desconto da fidelidade)"
  },
  "erros": [
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "explicacao": "Com fidelidade, taxa de rescisão deve ser igual ao desconto: R$ 580,00",
      "origem_erro": "Valor extraído incorretamente da seção TAXA DE RESCISÃO",
      "correcao_necessaria": "Alterar no contrato de R$ 700,00 para R$ 580,00"
    }
  ],
  "validacoes_corretas": [
    {
      "campo": "Taxa de Instalação",
      "valor": "R$ 120,00",
      "status": "✅ CORRETO - Com fidelidade, qualquer valor é aceito"
    }
  ],
  "resumo_debug": {
    "total_erros": 1,
    "problema_principal": "Taxa de rescisão no contrato está R$ 700,00 mas deveria ser R$ 580,00",
    "valor_correto_instalacao": "R$ 120,00 ✅",
    "valor_correto_rescisao": "R$ 580,00 ❌ (contrato tem R$ 700,00)",
    "desconto_fidelidade_encontrado": "R$ 580,00"
  }
}
\`\`\`

## 🎯 REGRAS FINAIS:

1. **MAPEIE TODOS** os R$ 700,00 encontrados no texto
2. **IDENTIFIQUE** de qual seção cada um vem
3. **EXPLIQUE** por que está usando cada valor específico
4. **COM FIDELIDADE**: Instalação = SEMPRE OK, Rescisão = Valor do desconto
5. **SEM FIDELIDADE**: Instalação = R$ 700,00, Rescisão = R$ 0,00

**CRÍTICO**: O JSON deve mostrar EXATAMENTE de onde cada R$ 700,00 está sendo extraído!

**Contrato para análise:**
${contractText}`;
};