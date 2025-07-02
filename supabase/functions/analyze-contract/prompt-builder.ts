export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET

## OBJETIVO
Analisar contratos OCR da CIABRASNET, identificar o modelo e validar apenas campos com DIVERGÊNCIAS REAIS.

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis:
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses - Taxa: R$ 200,00
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - Taxa: GRATUITA - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses - Taxa: GRATUITA  
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses - Taxa: R$ 200,00
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses - Taxa: GRATUITA

### Critérios de Identificação:
- **Valor do plano** (mais confiável)
- **Nome do plano** no texto
- **Velocidade mencionada**

## ETAPA 2: VALIDAÇÃO DE CAMPOS

### Campos Obrigatórios (Alertas se vazios):
- Nome completo
- CPF/CNPJ (consistência PF=CPF, PJ=CNPJ)
- Email (verificar erros de digitação)
- Endereço completo
- Telefone (formato XX) XXXXX-XXXX)

### Campos de Validação (Erros se diferentes):
- **Valor do plano** (deve ser exato da tabela)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **Taxa instalação** (conforme tabela)
- **Taxa rescisão** (usar cálculo de fidelidade)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

## ETAPA 3: CÁLCULO TAXA DE RESCISÃO

### Regra Simples:
\`\`\`
1. Procurar "DA OPÇÃO DE FIDELIDADE" com "SIM (X)"
2. SE fidelidade marcada:
   - Extrair valor da linha: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE: R$ X,XX"
   - Taxa rescisão ESPERADA = 700 - valor_extraído_da_linha_fidelidade
3. SE fidelidade NÃO marcada:
   - Taxa rescisão ESPERADA = R$ 700,00
4. COMPARAR taxa encontrada no contrato com taxa ESPERADA calculada
5. SÓ reportar erro se valores forem diferentes
\`\`\`

### Exemplos:
- Fidelidade SIM + Linha fidelidade R$ 120,00 → Rescisão ESPERADA = R$ 580,00
- Se contrato mostra R$ 580,00 → ✅ CORRETO (não reportar)
- Se contrato mostra R$ 500,00 → ❌ ERRO (reportar)

- Fidelidade SIM + Linha fidelidade R$ 200,00 → Rescisão ESPERADA = R$ 500,00  
- Se contrato mostra R$ 500,00 → ✅ CORRETO (não reportar)

- Fidelidade SIM + GRATUITA → Rescisão ESPERADA = R$ 700,00
- Fidelidade NÃO → Rescisão ESPERADA = R$ 700,00

## ETAPA 4: REGRA CRÍTICA

**⚠️ SÓ REPORTAR COMO ERRO SE VALORES FOREM DIFERENTES**

\`\`\`javascript
// ALGORITMO DE VALIDAÇÃO
valor_contrato = extrair_do_contrato()
valor_esperado = buscar_na_tabela()

if (valor_contrato === valor_esperado) {
    // NÃO É ERRO - NÃO INCLUIR NO RESULTADO
} else {
    // É ERRO REAL - INCLUIR NO ARRAY DE ERROS
}
\`\`\`

## FORMATO DE RESPOSTA

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95
  },
  "erros": [
    // APENAS divergências reais aqui
    {
      "campo": "Valor do Plano",
      "valor_encontrado": "R$ 120,00",
      "valor_esperado": "R$ 129,99",
      "sugestao_correcao": "Corrigir valor para R$ 129,99"
    }
  ],
  "alertas": [
    // Campos em branco aqui
    "Campo 'Nome' está em branco"
  ],
  "status": "aprovado|reprovado"
}
\`\`\`

## INSTRUÇÕES FINAIS

1. **IDENTIFIQUE primeiro** o modelo baseado no valor
2. **COMPARE exatamente** valores encontrados vs esperados
3. **NÃO reporte** valores iguais como erro
4. **INCLUA alertas** para campos em branco
5. **USE cálculo simples** para taxa de rescisão
6. **ARRAY VAZIO []** quando todos valores corretos

**LEMBRE-SE**: Valores idênticos = ACERTO = Não reportar

**Contrato para análise:**
${contractText}`;
};