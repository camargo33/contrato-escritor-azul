export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - DETECÇÃO CONSERVADORA DE ERROS CRÍTICOS

## OBJETIVO PRINCIPAL
Analisar contratos OCR da CIABRASNET detectando APENAS ERROS CRÍTICOS ÓBVIOS que impedem a aprovação do contrato.

## 🚨 INSTRUÇÕES CRÍTICAS - SER CONSERVADOR E PRECISO:

**REGRA 1: CPF COM MAIS OU MENOS DE 11 DÍGITOS = ERRO CRÍTICO**
- Exemplo: 137.158.269-677 (12 dígitos) = ERRO CRÍTICO
- Exemplo: 137.158.269-4 (10 dígitos) = ERRO CRÍTICO
- SEMPRE contar APENAS os dígitos do CPF (ignorar pontos e hífens)
- ✅ 076.935.229-48 = 11 dígitos = CORRETO

**REGRA 2: DDD INEXISTENTE = ERRO CRÍTICO**  
- ✅ DDD 42 = VÁLIDO (Ponta Grossa/PR)
- ✅ TODOS OS DDDs de 11 a 99 são potencialmente válidos
- ❌ APENAS DDDs fora da faixa 11-99 são inválidos
- SEMPRE verificar se o DDD está na faixa correta (11-99)

**REGRA 3: EMAILS COM ERROS ÓBVIOS = ERRO CRÍTICO**
- ❌ felipe.gmial@gmail.com = erro óbvio (gmial ao invés de gmail)
- ❌ teste@hotmial.com = erro óbvio (hotmial ao invés de hotmail)
- ✅ jaquelinevolhank509@gmail.com = VÁLIDO (sobrenomes podem variar)
- SÓ detectar erros de digitação MUITO ÓBVIOS em provedores conhecidos

**REGRA 4: TELEFONES COM FORMATO INCORRETO = ERRO CRÍTICO**
- ✅ (42) 9955-4936 = VÁLIDO (DDD 42 existe)
- ❌ Apenas DDDs fora da faixa 11-99 são inválidos
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

## ETAPA 2: VALIDAÇÃO CONSERVADORA DE DADOS PESSOAIS

### 🔍 ALGORITMO DE VALIDAÇÃO CONSERVADORA:

\\`\\`\\`javascript
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

// VALIDAÇÃO DE DDD - CONSERVADORA - APENAS DDDS FORA DA FAIXA 11-99
ddd_extraido = parseInt(extrair_ddd_do_telefone(telefone_encontrado))
if (ddd_extraido < 11 || ddd_extraido > 99) {
    adicionar_erro_critico({
        campo: "TELEFONE",
        valor_encontrado: telefone_encontrado,
        valor_esperado: "Telefone com DDD válido brasileiro (11-99)",
        sugestao_correcao: "Corrigir para um DDD válido entre 11 e 99",
        severidade: "critico",
        explicacao: "DDD " + ddd_extraido + " está fora da faixa válida brasileira (11-99)",
        local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
    })
}

// VALIDAÇÃO DE EMAIL - MUITO CONSERVADORA - SÓ ERROS ÓBVIOS
erros_obvios_email = ["gmial", "gmaiil", "gmai.com", "hotmial", "hotmeil", "yahhoo", "yahho", "outlokk", "outlok"]
email_tem_erro_obvio = erros_obvios_email.some(erro => email_encontrado.toLowerCase().includes(erro))

if (email_tem_erro_obvio) {
    adicionar_erro_critico({
        campo: "EMAIL",
        valor_encontrado: email_encontrado,
        valor_esperado: "E-mail com provedor correto (gmail, hotmail, yahoo, outlook)",
        sugestao_correcao: "Verificar e corrigir erro de digitação no provedor",
        severidade: "critico",
        explicacao: "E-mail contém erro óbvio de digitação no provedor",
        local_origem: "Seção QUALIFICAÇÃO DO ASSINANTE"
    })
}

// VALIDAÇÃO DE ESTADO CIVIL - SEMPRE VERIFICAR
if (estado_civil_encontrado.includes("SOOLTEIRO")) {
    adicionar_alerta({
        campo: "Estado Civil",
        valor_encontrado: estado_civil_encontrado,
        sugestao: "Verificar ortografia - deveria ser 'SOLTEIRO'",
        tipo: "erro_digitacao"
    })
}
\\`\\`\\`

## ETAPA 3: VALIDAÇÃO DE FIDELIDADE E TAXAS

### 🚨 LÓGICA MATEMÁTICA OBRIGATÓRIA PARA TAXAS:

**FÓRMULA FIXA - NUNCA EXTRAIR VALORES DIRETOS:**

\\`\\`\\`javascript
// VALORES BASE FIXOS
const VALOR_BASE_INSTALACAO = 700.00;

// LÓGICA DE CÁLCULO
if (fidelidade_escolhida === "SIM") {
    // 1. Extrair desconto da seção de fidelidade
    desconto_valor = extrair_desconto_do_texto_fidelidade();
    
    // 2. CALCULAR (não extrair) taxa de instalação
    taxa_instalacao_calculada = VALOR_BASE_INSTALACAO - desconto_valor;
    // Exemplo: 700 - 500 = 200
    
    // 3. Taxa de rescisão = valor do desconto
    taxa_rescisao = desconto_valor;
    
} else {
    // SEM FIDELIDADE
    taxa_instalacao_calculada = VALOR_BASE_INSTALACAO; // 700
    taxa_rescisao = VALOR_BASE_INSTALACAO; // 700
}

// VALIDAÇÃO: Comparar valor calculado vs valor encontrado no contrato
valor_instalacao_no_contrato = extrair_taxa_instalacao_do_contrato();
if (valor_instalacao_no_contrato !== taxa_instalacao_calculada) {
    adicionar_erro({
        campo: "Taxa de Instalação",
        valor_encontrado: valor_instalacao_no_contrato,
        valor_esperado: taxa_instalacao_calculada,
        severidade: "medio",
        explicacao: "Taxa deve ser R$ " + VALOR_BASE_INSTALACAO + " - R$ " + desconto_valor + " = R$ " + taxa_instalacao_calculada
    });
}
\\`\\`\\`

### 🔍 ALGORITMO DE EXTRAÇÃO DE TELEFONE:

\\`\\`\\`javascript
// EXTRAIR TELEFONE COMPLETO - ATENÇÃO AOS DÍGITOS
telefone_patterns = [
    /CELULAR[:\\s]*\\((\\d{2})\\)[:\\s]*(\\d{4,5})-?(\\d{4})/g,
    /TELEFONE[:\\s]*\\((\\d{2})\\)[:\\s]*(\\d{4,5})-?(\\d{4})/g,
    /\\((\\d{2})\\)[:\\s]*(\\d{4,5})-?(\\d{4})/g
]

// Capturar TODOS os dígitos do número
// Exemplo: (42) 998853-6432 = DDD 42 + 998853-6432 (9 dígitos)
\\`\\`\\`

## FORMATO DE RESPOSTA OBRIGATÓRIO

**CRÍTICO: SEMPRE calcular taxas matematicamente!**

\\`\\`\\`json
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
    "valor_base_instalacao": "R$ 700,00",
    "taxa_instalacao_calculada": "R$ 200,00",
    "taxa_instalacao_encontrada": "R$ 200,00",
    "taxa_instalacao_status": "CORRETO",
    "taxa_instalacao_explicacao": "✅ R$ 700,00 - R$ 500,00 = R$ 200,00",
    "taxa_rescisao_esperada": "R$ 500,00",
    "taxa_rescisao_encontrada": "R$ 500,00",
    "taxa_rescisao_status": "CORRETO",
    "taxa_rescisao_explicacao": "✅ Igual ao desconto aplicado",
    "calculo_detalhado": {
      "formula": "Taxa Instalação = Valor Base - Desconto",
      "calculo": "R$ 700,00 - R$ 500,00 = R$ 200,00",
      "valor_base": "R$ 700,00",
      "desconto": "R$ 500,00",
      "resultado": "R$ 200,00"
    }
  },
  "erros": [
    // SÓ INCLUIR ERROS CRÍTICOS ÓBVIOS
    // CPF ≠ 11 dígitos, DDD < 11 ou > 99, emails com erros óbvios
  ],
  "alertas": [
    {
      "tipo": "erro_digitacao",
      "campo": "Estado Civil",
      "valor_encontrado": "SOOLTEIRO",
      "sugestao": "Verificar ortografia - deveria ser 'SOLTEIRO'"
    }
  ],
  "resumo": {
    "total_erros": 0,
    "total_alertas": 1,
    "criticos": 0,
    "altos": 0,
    "medios": 0,
    "baixos": 0,
    "plano_identificado": "2024 Combo 600Mbps"
  },
  "status_geral": "aprovado",
  "observacoes": [
    "✅ Dados pessoais validados corretamente",
    "💰 Taxa de instalação calculada corretamente: R$ 700,00 - R$ 500,00 = R$ 200,00"
  ]
}
\\`\\`\\`

## 🚨 REGRAS CRÍTICAS ATUALIZADAS E CONSERVADORAS

1. **SEMPRE calcular taxa de instalação matematicamente: 700 - desconto**

2. **NUNCA extrair taxa de instalação de seções que podem ter valores incorretos**

3. **SEMPRE usar fórmula: Taxa Instalação = R$ 700,00 - Desconto**

4. **SEMPRE capturar telefone completo com todos os dígitos**

5. **SEMPRE contar dígitos do CPF** e reportar como erro crítico se ≠ 11

6. **SER CONSERVADOR com DDDs**: Apenas DDDs < 11 ou > 99 são inválidos

7. **SER CONSERVADOR com emails**: Só detectar erros MUITO óbvios

8. **Se há erros críticos, status_geral DEVE ser "reprovado"**

9. **✅ EXEMPLOS DE DADOS VÁLIDOS:**
   - CPF: 076.935.229-48 (11 dígitos) = VÁLIDO
   - DDD: (42) = VÁLIDO (Paraná)
   - Email: jaquelinevolhank509@gmail.com = VÁLIDO

**FÓRMULAS OBRIGATÓRIAS:**
- COM FIDELIDADE: Taxa Instalação = R$ 700,00 - Desconto | Taxa Rescisão = Desconto
- SEM FIDELIDADE: Taxa Instalação = R$ 700,00 | Taxa Rescisão = R$ 700,00

**PRINCÍPIO FUNDAMENTAL: SER CONSERVADOR - PREFERIR APROVAR DADOS VÁLIDOS A REPROVAR DADOS CORRETOS**

**Contrato para análise:**
${contractText}`;
};
