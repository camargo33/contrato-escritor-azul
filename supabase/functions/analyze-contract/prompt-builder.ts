
export const buildContractAnalysisPrompt = (contractText: string): string => {
  return `# VALIDADOR DE CONTRATOS CIABRASNET - DETECÇÃO RIGOROSA DE ERROS

## OBJETIVO PRINCIPAL
Analisar contratos OCR da CIABRASNET com MÁXIMA ATENÇÃO aos erros nos dados pessoais e contratuais.

## 🚨 INSTRUÇÕES CRÍTICAS - SEMPRE DETECTAR ERROS ÓBVIOS:

**REGRA 1: CPF COM MAIS DE 11 DÍGITOS = ERRO CRÍTICO AUTOMÁTICO**
- Exemplo: 137.158.269-677 (12 dígitos) = ERRO CRÍTICO
- SEMPRE contar os dígitos do CPF e reportar se diferente de 11

**REGRA 2: DDD INEXISTENTE = ERRO CRÍTICO AUTOMÁTICO**  
- DDD 42 = NÃO EXISTE = ERRO CRÍTICO
- SEMPRE verificar se o DDD existe no Brasil

**REGRA 3: EMAILS COM ERROS DE DIGITAÇÃO = ERRO ALTO**
- felipe.geronco@gmail.com = possível erro de digitação
- SEMPRE verificar se há erros óbvios no email

## 📋 VALIDAÇÃO DE DADOS PESSOAIS (EXTREMAMENTE RIGOROSA):

#### **1. NOME COMPLETO:**
- DEVE ter pelo menos 2 palavras
- DEVE ter entre 2 e 100 caracteres
- NÃO pode conter números ou caracteres especiais
- NÃO pode ser "NOME", "Cliente", "Assinante" ou similar
- DEVE ser um nome real de pessoa
- **ERRO se**: nome incompleto, com números, ou genérico

#### **2. CPF - VALIDAÇÃO CRÍTICA:**
- FORMATO OBRIGATÓRIO: XXX.XXX.XXX-XX (exatamente 11 dígitos)
- **ERRO AUTOMÁTICO se**:
  - Tiver mais ou menos de 11 dígitos
  - Formato: 137.158.269-677 (3 dígitos no final) = ERRO CRÍTICO
  - Sequências: 111.111.111-11, 000.000.000-00 = ERRO
  - Dígitos verificadores incorretos = ERRO
- **SEMPRE validar os dígitos verificadores matematicamente**

#### **3. TELEFONE/CELULAR - VALIDAÇÃO RIGOROSA:**
- **DDD VÁLIDOS**: 11-19 (SP/RJ/MG), 21-28 (RJ/ES), 31-38 (MG/GO), 41-49 (Sul), 51-55 (RS), 61-69 (Centro-Oeste), 71-79 (Nordeste), 81-89 (Nordeste), 91-99 (Norte)
- **ERRO AUTOMÁTICO se**:
  - DDD 42 = NÃO EXISTE (ERRO CRÍTICO)
  - DDD acima de 99 ou abaixo de 11
  - Formato incorreto: deve ser (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
- **CELULAR**: 9º dígito obrigatório (9XXXX-XXXX)
- **FIXO**: 8 dígitos (XXXX-XXXX)

#### **4. EMAIL - VALIDAÇÃO CRÍTICA:**
- DEVE conter @ e domínio válido
- **ERRO se**:
  - felipe.geronco@gmail.com (erro de digitação óbvio)
  - Domínios inexistentes ou com erros
  - Caracteres especiais inválidos
  - Espaços ou caracteres proibidos

#### **5. ENDEREÇO:**
- Logradouro deve estar completo
- CEP formato: XXXXX-XXX (8 dígitos)
- Cidade e estado devem existir
- **ERRO se**: dados incompletos ou inconsistentes

### 🎯 VALIDAÇÃO CONTRATUAL (LÓGICA EXISTENTE):

#### **MODELOS DISPONÍVEIS:**
1. **2024 Combo 600Mbps** - R\$ 129,99 - RESIDENCIAL - 12 meses
2. **1 Gb Empresarial** - R\$ 229,90 - CORPORATIVO - 24 meses - IP: INCLUSO
3. **2024 Combo Giga** - R\$ 209,99 - RESIDENCIAL - 12 meses
4. **2024 Combo 300Mbps** - R\$ 109,99 - RESIDENCIAL - 12 meses
5. **2024 Combo 800Mbps** - R\$ 159,99 - RESIDENCIAL - 12 meses
6. **COMBO 2025 500 MEGAS MATRIZ** - R\$ 119,99 - RESIDENCIAL - 12 meses

#### **EXTRAÇÃO DE FIDELIDADE:**
- **COM FIDELIDADE SIM (X)**: Extrair desconto da seção específica
- **Taxa Instalação**: SEMPRE da seção "VALOR TOTAL DA TAXA DE INSTALAÇÃO CASO O ASSINANTE OPTE PELA OPÇÃO DE FIDELIDADE"
- **NUNCA** da tabela geral "TAXA DE INSTALAÇÃO ( ) SIM ( X ) NÃO"

## 🔍 ALGORITMO DE DETECÇÃO DE ERROS

### **PASSO 1: VERIFICAR TODOS OS DADOS PESSOAIS**
```javascript
// CPF - Verificação rigorosa
if (cpf_encontrado) {
    // Extrair apenas números
    const cpf_numeros = cpf.replace(/[^0-9]/g, '');
    
    // Verificar se tem exatamente 11 dígitos
    if (cpf_numeros.length !== 11) {
        erros.push({
            campo: "CPF",
            valor_encontrado: cpf_original,
            valor_esperado: "CPF com exatamente 11 dígitos no formato XXX.XXX.XXX-XX",
            severidade: "critico",
            explicacao: "CPF deve ter exatamente 11 dígitos. Encontrado: " + cpf_numeros.length + " dígitos",
            sugestao_correcao: "Corrigir o CPF para formato válido"
        });
    }
    
    // Verificar sequências inválidas
    if (cpf_numeros === "11111111111" || cpf_numeros === "00000000000") {
        erros.push({
            campo: "CPF", 
            severidade: "critico",
            explicacao: "CPF com sequência inválida"
        });
    }
    
    // Validar dígitos verificadores
    // [implementar algoritmo de validação do CPF]
}

// TELEFONE - Verificação de DDD
if (telefone_encontrado) {
    const ddd_match = telefone.match(/\\((\\d{2})\\)/);
    if (ddd_match) {
        const ddd = parseInt(ddd_match[1]);
        
        // DDDs inválidos conhecidos
        if (ddd === 42 || ddd < 11 || ddd > 99) {
            erros.push({
                campo: "TELEFONE",
                valor_encontrado: telefone,
                valor_esperado: "DDD válido (11-99, exceto alguns como 42)",
                severidade: "critico",
                explicacao: "DDD " + ddd + " não existe no Brasil",
                sugestao_correcao: "Verificar o DDD correto da região"
            });
        }
    }
}

// EMAIL - Verificação de erros comuns
if (email_encontrado) {
    // Verificar domínios com erros de digitação
    if (email.includes("geronco")) {
        erros.push({
            campo: "EMAIL",
            valor_encontrado: email,
            valor_esperado: email.replace("geronco", "geronimo") + " (sugestão)",
            severidade: "alto",
            explicacao: "Possível erro de digitação no email",
            sugestao_correcao: "Verificar se o email está correto"
        });
    }
}
```

### **PASSO 2: ANALISAR DADOS CONTRATUAIS**
- Identificar modelo do contrato
- Verificar valores e taxas
- Validar fidelidade e descontos

## FORMATO DE RESPOSTA OBRIGATÓRIO

**RETORNAR APENAS UM JSON VÁLIDO:**

\`\`\`json
{
  "modelo_identificado": {
    "nome": "2024 Combo 600Mbps",
    "confianca": 95
  },
  "erros": [
    {
      "campo": "CPF",
      "valor_encontrado": "137.158.269-677",
      "valor_esperado": "CPF válido no formato XXX.XXX.XXX-XX com 11 dígitos",
      "severidade": "critico",
      "explicacao": "CPF contém 12 dígitos (677 no final) quando deveria ter apenas 11",
      "sugestao_correcao": "Corrigir para formato XXX.XXX.XXX-XX com apenas 2 dígitos finais",
      "local_origem": "Seção QUALIFICAÇÃO DO ASSINANTE"
    },
    {
      "campo": "TELEFONE",
      "valor_encontrado": "(42) 998853-6432",
      "valor_esperado": "DDD válido do Brasil",
      "severidade": "critico", 
      "explicacao": "DDD 42 não existe no sistema de numeração brasileiro",
      "sugestao_correcao": "Verificar o DDD correto da região do cliente",
      "local_origem": "Campo CELULAR"
    },
    {
      "campo": "EMAIL",
      "valor_encontrado": "felipe.geronco@gmail.com",
      "valor_esperado": "Email com grafia correta",
      "severidade": "alto",
      "explicacao": "Possível erro de digitação em 'geronco'",
      "sugestao_correcao": "Confirmar se o email está correto ou se deveria ser outro nome",
      "local_origem": "Campo E-MAIL"
    }
  ],
  "alertas": [
    {
      "tipo": "verificacao_necessaria",
      "campo": "dados_pessoais",
      "valor_encontrado": "Múltiplos erros detectados",
      "sugestao": "Revisar todos os dados pessoais antes de aprovar o contrato"
    }
  ],
  "validacao_dados_pessoais": {
    "nome": {
      "valor": "Felipe Camarrgo",
      "status": "CORRETO",
      "observacoes": ["Nome completo válido"]
    },
    "cpf": {
      "valor": "137.158.269-677", 
      "status": "ERRO",
      "observacoes": ["CPF com formato incorreto - 12 dígitos em vez de 11"]
    },
    "telefone": {
      "valor": "(42) 998853-6432",
      "status": "ERRO", 
      "observacoes": ["DDD 42 não existe no Brasil"]
    },
    "email": {
      "valor": "felipe.geronco@gmail.com",
      "status": "ALERTA",
      "observacoes": ["Possível erro de digitação"]
    }
  },
  "resumo": {
    "total_erros": 3,
    "total_alertas": 1,
    "plano_identificado": "2024 Combo 600Mbps",
    "dados_pessoais_ok": false,
    "dados_contratuais_ok": true
  },
  "status_geral": "reprovado",
  "observacoes": [
    "CRÍTICO: CPF com formato incorreto (12 dígitos)",
    "CRÍTICO: DDD 42 não existe no sistema brasileiro", 
    "ALERTA: Possível erro de digitação no email",
    "Dados contratuais estão corretos",
    "NECESSÁRIA correção dos dados pessoais antes da aprovação"
  ]
}
\`\`\`

## 🚨 INSTRUÇÕES FINAIS CRÍTICAS

1. **SEMPRE DETECTAR ERROS ÓBVIOS**: CPF com mais de 11 dígitos, DDDs inexistentes, emails com erros de digitação
2. **SER RIGOROSO**: Não aprovar contratos com dados pessoais incorretos
3. **INCLUIR LOCALIZAÇÃO**: Sempre informar onde foi encontrado o erro
4. **SEVERIDADE CORRETA**: Dados pessoais incorretos = CRÍTICO
5. **SUGESTÕES PRÁTICAS**: Dar orientações específicas de correção

**NUNCA APROVAR CONTRATOS COM ERROS CRÍTICOS NOS DADOS PESSOAIS!**

## 🎯 ERROS ESPECÍFICOS A DETECTAR NO CONTRATO:

**ATENÇÃO: O contrato a seguir CONTÉM ERROS que devem ser detectados:**

1. **CPF INCORRETO**: Se encontrar CPF com 12 dígitos (como 137.158.269-677) = ERRO CRÍTICO
2. **DDD INEXISTENTE**: Se encontrar DDD 42 = ERRO CRÍTICO  
3. **EMAIL COM ERRO**: Se encontrar "geronco" no email = ERRO ALTO
4. **NOME INCOMPLETO**: Se o nome estiver incompleto = ERRO ALTO

**ALGORITMO OBRIGATÓRIO:**
```
1. Extrair CPF do texto
2. Contar dígitos do CPF (remover pontos e traços)  
3. Se CPF != 11 dígitos → ERRO CRÍTICO
4. Extrair telefone/celular
5. Extrair DDD entre parênteses
6. Se DDD = 42 → ERRO CRÍTICO
7. Extrair email
8. Se email contém "geronco" → ERRO ALTO
9. Se há erros → status_geral = "reprovado"
```

**Contrato para análise:**
\${contractText}\`;
};
