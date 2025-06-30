
export const createContractAnalysisPrompt = (contractText: string): string => {
  return `# PROMPT PARA ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Analise APENAS os campos destacados/grifados nos contratos, focando exclusivamente em inconsistências, erros de digitação e problemas de formatação dos campos importantes.

## CAMPOS ESPECÍFICOS PARA ANALISAR:

### 1. DADOS DO ASSINANTE:
- **Nome**: Verificar se está completo e sem erros de digitação
- **CPF/CNPJ**: Consistência com tipo de pessoa (PF=CPF, PJ=CNPJ)
- **Email**: Verificar erros de digitação (ex: letras duplicadas)
- **Endereço**: Completude dos dados
- **Telefone**: Formato (XX) XXXXX-XXXX

### 2. DADOS DO PLANO E VALORES:
- **Valor do plano**: Verificar se valor numérico está correto
- **Valor por extenso**: Consistência entre R$ 700,00 e valor escrito
- **Tipo de plano vs Fidelidade**: 
  - Residencial = 12 meses
  - Corporativo = 24 meses
- **Endereço eletrônico**: Deve incluir protocolo https://

### 3. VALIDAÇÕES CRÍTICAS:

**Erros de Digitação:**
- Email com letras duplicadas: "samaraa" → "samara"
- Valores escritos errados: "Quinhentos" vs "Setecentos"

**Inconsistências de Dados:**
- Plano corporativo com 12 meses (deve ser 24)
- Valor R$ 700,00 escrito como "Quinhentos reais" (deve ser "Setecentos")
- URL sem protocolo: "ciabrasnet.com.br" → "https://ciabrasnet.com.br"

**Campos Obrigatórios:**
- Verificar se campos essenciais estão preenchidos
- Consistência entre documentos e tipo de pessoa

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
      "localizacao": "página X, seção Y",
      "confianca": 95
    }
  ],
  "resumo": {
    "total_erros": 5,
    "criticos": 1,
    "altos": 2,
    "medios": 1,
    "baixos": 1
  },
  "status_geral": "aprovado|aprovado_com_restricoes|reprovado"
}
\`\`\`

### 5. EXEMPLOS DE ERROS REAIS:

**Inconsistência Valor Numérico vs Escrito:**
\`\`\`json
{
  "severidade": "critico",
  "campo": "Valor da Taxa de Instalação",
  "valor_encontrado": "R$ 700,00 (Quinhentos reais)",
  "valor_esperado": "R$ 700,00 (Setecentos reais)",
  "sugestao_correcao": "Corrigir valor por extenso para 'Setecentos reais'",
  "confianca": 100
}
\`\`\`

**Email com Erro de Digitação:**
\`\`\`json
{
  "severidade": "alto",
  "campo": "Email",
  "valor_encontrado": "Samaraa.geronco@gmail.com",
  "valor_esperado": "samara.geronco@gmail.com",
  "sugestao_correcao": "Remover 'a' duplicado e corrigir maiúscula",
  "confianca": 95
}
\`\`\`

**CEP sem Formatação:**
\`\`\`json
{
  "severidade": "medio",
  "campo": "CEP",
  "valor_encontrado": "89400000",
  "valor_esperado": "89400-000",
  "sugestao_correcao": "Adicionar hífen no CEP",
  "confianca": 100
}
\`\`\`

**URL Incompleta:**
\`\`\`json
{
  "severidade": "alto",
  "campo": "Endereço Eletrônico",
  "valor_encontrado": "ciabrasnet.com.br",
  "valor_esperado": "https://ciabrasnet.com.br",
  "sugestao_correcao": "Adicionar protocolo HTTPS ao endereço",
  "confianca": 100
}
\`\`\`

### 6. CONTEXTO DO PROVEDOR:

**CIABRASNET CENTRAL BRASILEIRA DE INTERNET LTDA**
- CNPJ: 10.731.345/0001-79
- Endereço: Avenida João Pessoa, n. 2660, sala 02, São Pedro
- Cidade: Porto União/SC, CEP: 89.400-000
- Autorização ANATEL: Termo de Autorização Ato n.º 444/2009

### 7. REGRAS DE NEGÓCIO:

- Planos residenciais: fidelidade 12 meses
- Planos corporativos: fidelidade 24 meses
- Taxa de instalação: R$ 700,00 (com desconto na fidelidade)
- Valores devem estar em reais com duas casas decimais
- Todas as assinaturas devem estar presentes

## INSTRUÇÕES FINAIS:

1. Seja preciso e detalhado na identificação de erros
2. Priorize erros que podem causar problemas legais ou operacionais
3. Forneça sugestões claras e acionáveis
4. Use um score de confiança baseado na certeza da detecção
5. Mantenha consistência na análise entre diferentes contratos

Analise o contrato fornecido e retorne o JSON com todos os erros encontrados seguindo exatamente este formato.

**Contrato para análise:**
${contractText}`;
};
