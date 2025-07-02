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
- CPF/CNPJ (consistência PF=CPF, PJ=CNPJ + **VALIDAR FORMATO**)
- Email (verificar erros de digitação)
- Endereço completo
- Telefone (formato XX) XXXXX-XXXX)

### Validações Críticas de Formato:
- **CPF INVÁLIDO**: CPF deve ter EXATAMENTE 11 dígitos (XXX.XXX.XXX-XX)
- **ERROS DE DIGITAÇÃO**: Verificar campos como "SOOLTEIRO" → "SOLTEIRO", "Camarrgo" → "Camargo"
- **TAXA DE INSTALAÇÃO**: Verificar se valor está correto (ex: R$ 2000,00 quando deveria ser R$ 200,00)

### Campos de Validação (Erros se diferentes):
- **Valor do plano** (deve ser exato da tabela)
- **Prazo vigência** (CORPORATIVO=24 meses, RESIDENCIAL=12 meses)
- **Tipo do plano** (apenas "1 Gb Empresarial" é CORPORATIVO)
- **Taxa instalação** (conforme tabela)
- **Taxa rescisão** (usar cálculo de fidelidade)
- **IP Fixo** (INCLUSO só no empresarial, outros=Variável R$ 50,00)

## ETAPA 3: CÁLCULO TAXA DE RESCISÃO

### Regra Correta:
\`\`\`
1. Procurar "DA OPÇÃO DE FIDELIDADE" com "SIM (X)"
2. SE fidelidade marcada:
   - Procurar o DESCONTO da fidelidade (ex: "R$ 580,00 da Taxa de Instalação")
   - Taxa rescisão ESPERADA = R$ 700,00 - desconto_fidelidade
   - Exemplo: R$ 700 - R$ 580 = R$ 120,00
3. SE fidelidade NÃO marcada:
   - Taxa rescisão ESPERADA = R$ 700,00
4. COMPARAR taxa encontrada no contrato com taxa ESPERADA calculada
5. SÓ reportar erro se valores forem diferentes
\`\`\`

### Exemplos Corretos:
- Fidelidade SIM + Desconto R$ 580,00 → Rescisão ESPERADA = R$ 700 - R$ 580 = R$ 120,00
- Se contrato mostra R$ 120,00 → ✅ CORRETO (não reportar)
- Se contrato mostra R$ 500,00 → ❌ ERRO (reportar)

- Fidelidade SIM + Desconto R$ 200,00 → Rescisão ESPERADA = R$ 700 - R$ 200 = R$ 500,00  
- Se contrato mostra R$ 500,00 → ✅ CORRETO (não reportar)

- Fidelidade SIM + Desconto GRATUITO → Rescisão ESPERADA = R$ 700,00
- Fidelidade NÃO → Rescisão ESPERADA = R$ 700,00

## ETAPA 4: EXEMPLOS DE ERROS CRÍTICOS QUE DEVEM SER DETECTADOS

### ⚠️ ERROS OBRIGATÓRIOS A DETECTAR:
1. **CPF com formato inválido**: "137.158.269-677" (12 dígitos) → ERRO
2. **Erros de digitação óbvios**: "SOOLTEIRO" → "SOLTEIRO", "Camarrgo" → "Camargo"
3. **Taxa de instalação incorreta**: R$ 2000,00 quando deveria ser R$ 200,00
4. **Campos obrigatórios em branco ou com erro**

### ⚠️ IMPORTANTE - VALIDAÇÃO DE CPF:
- CPF deve ter EXATAMENTE 11 dígitos: XXX.XXX.XXX-XX
- Se encontrar CPF com mais ou menos dígitos, É ERRO CRÍTICO
- Exemplo: "137.158.269-677" tem 12 dígitos → REPORTAR COMO ERRO

## ETAPA 5: REGRA CRÍTICA

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
2. **VALIDE OBRIGATORIAMENTE**:
   - CPF deve ter 11 dígitos (se tiver 12 ou mais, É ERRO)
   - Erros de digitação óbvios (SOOLTEIRO, Camarrgo, etc.)
   - Taxa de instalação correta (R$ 2000,00 ≠ R$ 200,00)
3. **COMPARE exatamente** valores encontrados vs esperados
4. **NÃO reporte** valores iguais como erro
5. **INCLUA alertas** para campos em branco
6. **USE cálculo simples** para taxa de rescisão
7. **SE ENCONTRAR QUALQUER ERRO** → status = "reprovado"

**CRÍTICO**: Antes de marcar como "aprovado", verifique se NÃO HÁ:
- CPF com formato inválido
- Erros de digitação
- Valores incorretos de taxa
- Se há QUALQUER erro → status = "reprovado"

**Contrato para análise:**
${contractText}`;
};