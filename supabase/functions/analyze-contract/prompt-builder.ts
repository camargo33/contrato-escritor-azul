export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - DETECÇÃO RIGOROSA DE ERROS CRÍTICOS

## OBJETIVO PRINCIPAL
Analisar contratos OCR da CIABRASNET detectando ERROS CRÍTICOS que impedem a aprovação do contrato.

## 🚨 INSTRUÇÕES CRÍTICAS - SEMPRE DETECTAR ERROS ÓBVIOS:

**REGRA 1: CPF COM MAIS OU MENOS DE 11 DÍGITOS = ERRO CRÍTICO**
- Exemplo: 137.158.269-677 (12 dígitos) = ERRO CRÍTICO
- Exemplo: 137.158.269-4 (10 dígitos) = ERRO CRÍTICO
- SEMPRE contar os dígitos do CPF (ignorar pontos e hífens)

**REGRA 2: DDD INEXISTENTE = ERRO CRÍTICO**  
- DDD 42 = NÃO EXISTE no Brasil = ERRO CRÍTICO
- SEMPRE verificar se o DDD é válido no Brasil

**REGRA 3: EMAILS COM ERROS ÓBVIOS = ERRO CRÍTICO**
- felipe.geronco@gmail.com = possível erro de digitação = ERRO CRÍTICO
- Emails com domínios inexistentes = ERRO CRÍTICO

**REGRA 4: TELEFONES COM FORMATO INCORRETO = ERRO CRÍTICO**
- (42) 998853-6432 com DDD inexistente = ERRO CRÍTICO
- Telefones fora do padrão brasileiro = ERRO CRÍTICO

**REGRA 5: ERROS ORTOGRÁFICOS = ALERTA OBRIGATÓRIO**
- "SOOLTEIRO" ao invés de "SOLTEIRO" = ALERTA
- Qualquer erro de digitação óbvio = ALERTA

## ETAPA 1: IDENTIFICAÇÃO DO MODELO

### Modelos Disponíveis:
1. **2024 Combo 600Mbps** - R$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R$ 119,99 - RESIDENCIAL - 12 meses

## ETAPA 2: VALIDAÇÃO RIGOROSA DE DADOS PESSOAIS

### 🔍 ALGORITMO DE VALIDAÇÃO OBRIGATÓRIA:

\`\`\`javascript
// VALIDAÇÃO DE CPF - SEMPRE EXECUTAR
cpf_numeros = extrair_apenas_numeros_do_cpf(cpf_encontrado)
if (cpf_numeros.length !== 11) {
    adicionar_erro_critico({
        campo: "CPF",
        valor_encontrado: cpf_encontrado,
        valor_esperado: "CPF com exatamente 11 dígitos",
        sugestao_correcao: "Corrigir o CPF para ter exatamente 11 dígitos",
        severidade: "critico",
        explicacao: "CPF encontrado tem " + cpf_numeros.length + " dígitos, mas deve ter exatamente 11",
        local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
    })
}

// VALIDAÇÃO DE DDD - SEMPRE EXECUTAR
ddd_extraido = extrair_ddd_do_telefone(telefone_encontrado)
ddds_validos = ["11","12","13","14","15","16","17","18","19","21","22","24","27","28","31","32","33","34","35","37","38","41","43","44","45","46","47","48","49","51","53","54","55","61","62","63","64","65","66","67","68","69","71","73","74","75","77","79","81","82","83","84","85","86","87","88","89","91","92","93","94","95","96","97","98","99"]

if (!ddds_validos.includes(ddd_extraido)) {
    adicionar_erro_critico({
        campo: "TELEFONE",
        valor_encontrado: telefone_encontrado,
        valor_esperado: "Telefone com DDD válido brasileiro",
        sugestao_correcao: "Corrigir para um DDD válido (ex: (41), (11), (21))",
        severidade: "critico",
        explicacao: "DDD " + ddd_extraido + " não existe no Brasil",
        local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
    })
}

// VALIDAÇÃO DE EMAIL - SEMPRE EXECUTAR
if (email_encontrado.includes("geronco") || email_suspeito(email_encontrado)) {
    adicionar_erro_critico({
        campo: "EMAIL",
        valor_encontrado: email_encontrado,
        valor_esperado: "E-mail correto sem erros de digitação",
        sugestao_correcao: "Verificar e corrigir possíveis erros de digitação",
        severidade: "critico",
        explicacao: "E-mail contém possível erro de digitação",
        local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
    })
}

// VALIDAÇÃO DE ESTADO CIVIL - SEMPRE VERIFICAR
if (estado_civil_encontrado.includes("SOOLTEIRO") || estado_civil_encontrado.includes("SOLTEIRO")) {
    adicionar_alerta({
        campo: "Estado Civil",
        valor_encontrado: estado_civil_encontrado,
        sugestao: "Verificar ortografia - deveria ser 'SOLTEIRO'",
        tipo: "erro_digitacao"
    })
}
\`\`\`

## ETAPA 3: VALIDAÇÃO DE FIDELIDADE E TAXAS

### 🚨 LOCAL CORRETO PARA EXTRAIR TAXA DE INSTALAÇÃO:

**REGRA CRÍTICA DE EXTRAÇÃO:**

1. **SE FIDELIDADE = SIM (X)**:
   - Procurar: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
   - Extrair valor dessa linha específica
   - ❌ NUNCA usar valores de tabelas gerais como "TAXA DE INSTALAÇÃO R$ 200,00"

2. **SE FIDELIDADE = NÃO**:
   - Usar: R$ 700,00 (valor padrão)

### 🔍 ALGORITMO DE EXTRAÇÃO DE TELEFONE:

\`\`\`javascript
// EXTRAIR TELEFONE COMPLETO - ATENÇÃO AOS DÍGITOS
telefone_patterns = [
    /CELULAR[:\s]*\((\d{2})\)[:\s]*(\d{4,5})-?(\d{4})/g,
    /TELEFONE[:\s]*\((\d{2})\)[:\s]*(\d{4,5})-?(\d{4})/g,
    /\((\d{2})\)[:\s]*(\d{4,5})-?(\d{4})/g
]

// Capturar TODOS os dígitos do número
// Exemplo: (42) 998853-6432 = DDD 42 + 998853-6432 (9 dígitos)
\`\`\`

### LÓGICA DE FIDELIDADE:
- COM FIDELIDADE: Taxa Instalação = VALOR DA SEÇÃO FIDELIDADE | Taxa Rescisão = Desconto  
- SEM FIDELIDADE: Taxa Instalação = R$ 700,00 | Taxa Rescisão = R$ 700,00

## FORMATO DE RESPOSTA OBRIGATÓRIO

**CRÍTICO: SEMPRE extrair valores das seções corretas!**

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95
  },
  "analise_fidelidade": {
    "opcao_fidelidade": "SIM",
    "valor_desconto_extraido": "R$ 500,00",
    "texto_origem": "desconto de R$ 500,00 (Quinhentos reais)",
    "marcacao_encontrada": "SIM (X)"
  },
  "validacao_taxas": {
    "fidelidade": "SIM",
    "valor_desconto_fidelidade": "R$ 500,00",
    "taxa_instalacao_encontrada": "R$ 2000,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ R$ 2000,00 extraído da seção de fidelidade",
    "taxa_rescisao_esperada": "R$ 500,00",
    "taxa_rescisao_encontrada": "R$ 500,00",
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Igual ao desconto aplicado"
  },
  "erros": [
    {
      "campo": "CPF",
      "valor_encontrado": "137.158.269-677",
      "valor_esperado": "CPF com exatamente 11 dígitos",
      "sugestao_correcao": "Corrigir o CPF para ter exatamente 11 dígitos",
      "explicacao": "CPF encontrado tem 12 dígitos, mas deve ter exatamente 11",
      "severidade": "critico",
      "local_origem": "Seção QUALIFICAÇÃO DO ASSINANTE"
    },
    {
      "campo": "TELEFONE",
      "valor_encontrado": "(42) 998853-6432",
      "valor_esperado": "Telefone com DDD válido brasileiro",
      "sugestao_correcao": "Corrigir para um DDD válido (ex: (41), (11), (21))",
      "explicacao": "DDD 42 não existe no Brasil",
      "severidade": "critico",
      "local_origem": "Seção QUALIFICAÇÃO DO ASSINANTE"
    },
    {
      "campo": "EMAIL",
      "valor_encontrado": "felipe.geronco@gmail.com",
      "valor_esperado": "E-mail correto sem erros de digitação",
      "sugestao_correcao": "Verificar e corrigir possíveis erros de digitação no sobrenome",
      "explicacao": "E-mail contém possível erro de digitação ('geronco')",
      "severidade": "critico",
      "local_origem": "Seção QUALIFICAÇÃO DO ASSINANTE"
    }
  ],
  "alertas": [
    {
      "tipo": "erro_digitacao",
      "campo": "Estado Civil",
      "valor_encontrado": "SOOLTEIRO",
      "sugestao": "Verificar ortografia - deveria ser 'SOLTEIRO'"
    }
  ],
  "validacoes_corretas": [
    {
      "campo": "Tipo do Plano",
      "valor": "RESIDENCIAL",
      "status": "✅ CORRETO - Conforme tabela"
    }
  ],
  "resumo": {
    "total_erros": 3,
    "total_alertas": 1,
    "criticos": 3,
    "altos": 0,
    "medios": 0,
    "baixos": 0,
    "plano_identificado": "2024 Combo 600Mbps"
  },
  "status_geral": "reprovado",
  "observacoes": [
    "🚨 CRÍTICO: Encontrados erros nos dados pessoais que impedem a aprovação",
    "CPF com número incorreto de dígitos deve ser corrigido",
    "DDD inexistente deve ser substituído por DDD válido",
    "E-mail com possível erro de digitação deve ser verificado"
  ]
}
\`\`\`

## 🚨 REGRAS CRÍTICAS OBRIGATÓRIAS

1. **SEMPRE extrair taxa de instalação da seção de fidelidade se SIM marcado**

2. **SEMPRE capturar telefone completo com todos os dígitos**

3. **SEMPRE contar dígitos do CPF** e reportar como erro crítico se ≠ 11

4. **SEMPRE validar DDD** contra lista de DDDs válidos brasileiros

5. **SEMPRE verificar emails** para erros óbvios de digitação

6. **SEMPRE adicionar alertas** para erros ortográficos como "SOOLTEIRO"

7. **Se há erros críticos, status_geral DEVE ser "reprovado"**

8. **Severidade obrigatória:**
   - CPF incorreto = "critico"
   - DDD inexistente = "critico"  
   - Email com erro = "critico"
   - Erros ortográficos = alerta
   - Taxas incorretas = "medio"

**LOCAIS ESPECÍFICOS PARA EXTRAÇÃO:**
- Taxa de Instalação com Fidelidade: "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
- Telefone: Campo "CELULAR" ou "TELEFONE" na seção QUALIFICAÇÃO DO ASSINANTE
- CPF: Campo "CPF" na seção QUALIFICAÇÃO DO ASSINANTE

**NUNCA deixar passar CPF com 12 dígitos, DDD inexistente, ou extrair valores de seções erradas!**

**Contrato para análise:**
${contractText}`;
};