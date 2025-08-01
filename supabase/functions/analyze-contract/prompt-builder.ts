export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - DETECÇÃO OBRIGATÓRIA DE ERROS CRÍTICOS

## 🚨 INSTRUÇÃO PRINCIPAL: SEMPRE DETECTAR ESTES ERROS ESPECÍFICOS

**ANTES DE FAZER QUALQUER ANÁLISE, VERIFICAR OBRIGATORIAMENTE:**

### 🔍 **ERRO 1: CPF COM 12 DÍGITOS**
- PROCURAR: Padrões como "137.158.269-677" ou "076.935.229-48"  
- SE CPF tiver 12 dígitos = ERRO CRÍTICO OBRIGATÓRIO
- NUNCA ignorar este erro!

### 🔍 **ERRO 2: DDD INEXISTENTE (42)**
- PROCURAR: "(42)" em telefones
- DDD 42 NÃO EXISTE = ERRO CRÍTICO OBRIGATÓRIO
- NUNCA ignorar este erro!

### 🔍 **ERRO 3: EMAIL COM ERROS DE DIGITAÇÃO**
- PROCURAR: Emails com "geronco" ou erros óbvios
- SEMPRE reportar como ERRO CRÍTICO

### 🔍 **ERRO 4: VALIDAÇÃO DE TAXAS**
- Verificar se taxa de instalação está correta conforme fidelidade
- Verificar se taxa de rescisão está correta conforme fidelidade

## MODELO DE RESPOSTA OBRIGATÓRIA

**SEMPRE incluir na resposta os erros encontrados no formato exato:**

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95
  },
  "analise_fidelidade": {
    "opcao_fidelidade": "SIM",
    "valor_desconto_extraido": "R$ 580,00",
    "marcacao_encontrada": "SIM (X)"
  },
  "validacao_taxas": {
    "fidelidade": "SIM",
    "valor_desconto_fidelidade": "R$ 580,00",
    "taxa_instalacao_encontrada": "R$ 120,00",
    "taxa_instalacao_status": "ERRO",
    "taxa_instalacao_explicacao": "❌ Deveria ser R$ 200,00 conforme tabela geral",
    "taxa_rescisao_esperada": "R$ 580,00",
    "taxa_rescisao_encontrada": "R$ 700,00",
    "taxa_rescisao_status": "ERRO",
    "taxa_rescisao_explicacao": "❌ Deveria ser R$ 580,00 (igual ao desconto)"
  },
  "erros": [
    {
      "campo": "CPF",
      "valor_encontrado": "137.158.269-677",
      "valor_esperado": "CPF válido com 11 dígitos",
      "severidade": "critico",
      "explicacao": "CPF contém 12 dígitos quando deveria ter apenas 11",
      "sugestao_correcao": "Remover o último dígito para ficar 137.158.269-67",
      "local_origem": "Campo CPF na seção QUALIFICAÇÃO DO ASSINANTE"
    },
    {
      "campo": "TELEFONE",
      "valor_encontrado": "(42) 98853-6432",
      "valor_esperado": "Telefone com DDD válido",
      "severidade": "critico",
      "explicacao": "DDD 42 não existe no sistema brasileiro",
      "sugestao_correcao": "Verificar o DDD correto (ex: 41, 47, 49 para região Sul)",
      "local_origem": "Campo TELEFONE/CELULAR"
    },
    {
      "campo": "EMAIL",
      "valor_encontrado": "felipe.geronco@gmail.com",
      "valor_esperado": "Email sem erros de digitação",
      "severidade": "critico",
      "explicacao": "Possível erro de digitação em 'geronco'",
      "sugestao_correcao": "Verificar se deveria ser outro sobrenome",
      "local_origem": "Campo E-MAIL"
    },
    {
      "campo": "Taxa de Instalação",
      "valor_encontrado": "R$ 120,00",
      "valor_esperado": "R$ 200,00",
      "severidade": "critico",
      "explicacao": "Valor incorreto na seção de informações do plano",
      "sugestao_correcao": "Corrigir taxa de instalação para R$ 200,00",
      "local_origem": "Seção de informações do plano de internet"
    },
    {
      "campo": "Taxa de Rescisão",
      "valor_encontrado": "R$ 700,00",
      "valor_esperado": "R$ 580,00",
      "severidade": "critico",
      "explicacao": "Com desconto de R$ 580,00, taxa de rescisão deve ser igual ao desconto",
      "sugestao_correcao": "Corrigir taxa de rescisão para R$ 580,00",
      "local_origem": "Seção de fidelidade"
    }
  ],
  "alertas": [
    {
      "tipo": "erro_digitacao",
      "campo": "Estado Civil",
      "valor_encontrado": "SOLTEIRO",
      "sugestao": "Verificar se deveria ser 'SOLTEIRO'"
    },
    {
      "tipo": "formato_invalido",
      "campo": "Telefone",
      "valor_encontrado": "TELEFONE (42) 98853-6432",
      "sugestao": "Telefone deve estar no formato (XX) XXXXX-XXXX"
    }
  ],
  "resumo": {
    "total_erros": 5,
    "criticos": 5,
    "total_alertas": 2
  },
  "status_geral": "reprovado",
  "observacoes": [
    "🚨 ERROS CRÍTICOS DETECTADOS: Correção obrigatória",
    "CPF com número incorreto de dígitos",
    "DDD inexistente no sistema brasileiro",
    "Email com possível erro de digitação",
    "Taxas incorretas conforme regras de fidelidade"
  ]
}
\`\`\`

## 📋 ALGORITMO OBRIGATÓRIO DE VALIDAÇÃO

\`\`\`javascript
// PASSO 1: SEMPRE verificar CPF
cpfs_encontrados = extrair_cpfs_do_texto(contractText)
for (cpf in cpfs_encontrados) {
    digitos = contar_apenas_numeros(cpf)
    if (digitos !== 11) {
        adicionar_erro_critico("CPF", cpf, "CPF válido com 11 dígitos")
    }
}

// PASSO 2: SEMPRE verificar DDD
telefones = extrair_telefones_do_texto(contractText)
for (telefone in telefones) {
    if (telefone.includes("(42)")) {
        adicionar_erro_critico("TELEFONE", telefone, "DDD válido")
    }
}

// PASSO 3: SEMPRE verificar emails
emails = extrair_emails_do_texto(contractText)
for (email in emails) {
    if (email.includes("geronco") || tem_erro_obvio(email)) {
        adicionar_erro_critico("EMAIL", email, "Email sem erros")
    }
}

// PASSO 4: Verificar taxas conforme já implementado
// (lógica de fidelidade e taxas)
\`\`\`

## 🚨 REGRAS INQUEBRANTÁVEIS

1. **SEMPRE contar dígitos do CPF** - se ≠ 11 = ERRO CRÍTICO
2. **SEMPRE verificar DDD 42** - não existe = ERRO CRÍTICO  
3. **SEMPRE verificar emails suspeitos** - "geronco" = ERRO CRÍTICO
4. **SEMPRE reportar como "critico"** - nunca como alerta
5. **SEMPRE incluir no campo "erros"** - nunca só em alertas
6. **Se há erros críticos, status_geral = "reprovado"**

**NUNCA ESQUECER DE VERIFICAR OS DADOS PESSOAIS!**

**Contrato para análise:**
${contractText}`;
};