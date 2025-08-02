// 🚀 PROMPT BUILDER DEFINITIVO - DETECTA ERROS REAIS, NÃO INVENTA
// CORREÇÃO CRÍTICA: Deve detectar erros óbvios que existem no texto

import { CONTRACT_MODELS, identifyContractModel, calculateExpectedTotal } from './contract-models.ts';
import { validateContract } from './contract-validations.ts';

export const buildContractAnalysisPrompt = (contractText: string): string => {
  // 🎯 IDENTIFICAR MODELO AUTOMATICAMENTE
  const identifiedModel = identifyContractModel(contractText);
  
  // 📊 CONSTRUIR LISTA DE MODELOS DISPONÍVEIS
  const modelsList = CONTRACT_MODELS.map(model => {
    const expectedTotal = calculateExpectedTotal(model, false); // Sem IP fixo inicialmente
    const expectedTotalWithIP = calculateExpectedTotal(model, true); // Com IP fixo
    
    return "**" + model.name + "** (" + model.speed.toUpperCase() + ")" +
   "\n   - Empresa: " + model.company_full_name + " (" + model.city + " - DDD " + model.ddd + ")" +
   "\n   - Valor: " + model.value + " (" + model.type + " - " + model.validity_period + ")" +
   "\n   - Serviços: " + model.services.cnet_livros + " (CNET Livros) + " + model.services.suporte + " (Suporte)" + (model.services.cnet_educa ? " + " + model.services.cnet_educa + " (CNET Educa)" : "") + " + " + model.services.cnet_play + " (CNET Play)" +
   "\n   - IP: " + model.fixed_ip +
   "\n   - Valor Total Esperado: R$ " + expectedTotal.toFixed(2) + " (IP Variável) | R$ " + expectedTotalWithIP.toFixed(2) + " (IP Fixo)" +
   "\n   - Equipamentos: " + model.equipment +
   "\n   - Instalação: " + model.installation_fee +
   "\n   - Cancelamento: " + model.cancellation_fee;
  }).join('\n\n');

  // 🎯 MODELO IDENTIFICADO (SE HOUVER)
  const modelIdentificationSection = identifiedModel ? 
"## 🎯 MODELO IDENTIFICADO AUTOMATICAMENTE\n" +
"**" + identifiedModel.name + "** (" + identifiedModel.speed.toUpperCase() + ") - " + identifiedModel.company + "\n" +
"- Valor Base: " + identifiedModel.value + "\n" +
"- Tipo: " + identifiedModel.type + " (" + identifiedModel.validity_period + ")\n" +
"- Empresa: " + identifiedModel.company_full_name + "\n" +
"- Cidade: " + identifiedModel.city + " - DDD " + identifiedModel.ddd + "\n" +
"- Valor Total Esperado sem IP Fixo: R$ " + calculateExpectedTotal(identifiedModel, false).toFixed(2) + "\n" +
"- Valor Total Esperado com IP Fixo: R$ " + calculateExpectedTotal(identifiedModel, true).toFixed(2) + "\n\n" +
"**Use este modelo como referência principal para validações!**\n" 
: 
"## ⚠️ MODELO NÃO IDENTIFICADO AUTOMATICAMENTE\n" +
"Analise o texto para identificar velocidade, empresa e tipo de contrato.\n";

  return "# VALIDADOR EQUILIBRADO DE CONTRATOS CIABRASNET/WNKBR\n" +
"## DETECTA ERROS REAIS - NÃO INVENTA ERROS INEXISTENTES\n\n" +
"## 🎯 OBJETIVO: DETECTAR APENAS ERROS QUE REALMENTE EXISTEM NO TEXTO\n\n" +
"**INSTRUÇÕES CRÍTICAS:**\n" +
"1. **DETECTE** erros que estão claramente visíveis no texto\n" +
"2. **NÃO INVENTE** erros que não existem\n" +
"3. **SEJA RIGOROSO** com erros óbvios e evidentes\n" +
"4. **SEJA CONSERVADOR** apenas quando há dúvida\n\n" +
modelIdentificationSection + "\n\n" +
"## 📊 MODELOS DISPONÍVEIS POR VELOCIDADE E EMPRESA\n\n" +
modelsList + "\n\n" +
"## 🔍 VALIDAÇÕES OBRIGATÓRIAS - DETECTAR ERROS REAIS\n\n" +
"### 📱 VALIDAÇÃO RIGOROSA DE TELEFONE CELULAR\n\n" +
"**REGRA OBRIGATÓRIA: Celular brasileiro DEVE ter exatamente 9 dígitos e começar com 9**\n\n" +
"```javascript\n" +
"function validar_telefone_rigoroso(telefone_texto) {\n" +
"    // Encontrar padrão de telefone no texto\n" +
"    const regex_telefone = /\\\\(?(\\\\d{2})\\\\)?[\\\\s-]?(\\\\d{4,5})[\\\\s-]?(\\\\d{4})/g;\n" +
"    \n" +
"    let match;\n" +
"    while ((match = regex_telefone.exec(telefone_texto)) !== null) {\n" +
"        const ddd = match[1];\n" +
"        const parte1 = match[2];\n" +
"        const parte2 = match[3];\n" +
"        const numero_completo = parte1 + parte2;\n" +
"        \n" +
"        console.log(\"Analisando: (\" + ddd + \") \" + parte1 + \"-\" + parte2 + \" = \" + numero_completo.length + \" dígitos\");\n" +
"        \n" +
"        // VERIFICAÇÃO RIGOROSA:\n" +
"        \n" +
"        // 1. Deve ter exatamente 9 dígitos\n" +
"        if (numero_completo.length !== 9) {\n" +
"            return {\n" +
"                erro: \"Telefone celular inválido: (\" + ddd + \") \" + parte1 + \"-\" + parte2,\n" +
"                motivo: \"Celular deve ter 9 dígitos, encontrado \" + numero_completo.length + \" dígitos\",\n" +
"                encontrado: \"(\" + ddd + \") \" + parte1 + \"-\" + parte2,\n" +
"                esperado: \"(XX) 9XXXX-XXXX (9 dígitos)\"\n" +
"            };\n" +
"        }\n" +
"        \n" +
"        // 2. Deve começar com 9\n" +
"        if (!numero_completo.startsWith('9')) {\n" +
"            return {\n" +
"                erro: \"Telefone celular inválido: (\" + ddd + \") \" + parte1 + \"-\" + parte2,\n" +
"                motivo: \"Celular deve começar com 9, encontrado iniciando com \" + numero_completo[0],\n" +
"                encontrado: \"(\" + ddd + \") \" + parte1 + \"-\" + parte2,\n" +
"                esperado: \"(XX) 9XXXX-XXXX (inicia com 9)\"\n" +
"            };\n" +
"        }\n" +
"        \n" +
"        // 3. DDD deve ser válido (11-99)\n" +
"        const ddd_num = parseInt(ddd);\n" +
"        if (ddd_num < 11 || ddd_num > 99) {\n" +
"            return {\n" +
"                erro: \"DDD inválido: \" + ddd,\n" +
"                motivo: \"DDD deve estar entre 11 e 99\",\n" +
"                encontrado: ddd,\n" +
"                esperado: \"11-99\"\n" +
"            };\n" +
"        }\n" +
"    }\n" +
"    \n" +
"    return { valido: true };\n" +
"}\n\n" +
"// EXEMPLOS DE VALIDAÇÃO:\n" +
"// ✅ (42) 98833-3039 = 9 dígitos, inicia com 9 = VÁLIDO\n" +
"// ❌ (42) 998853-6432 = 10 dígitos = ERRO REAL\n" +
"// ❌ (42) 8833-3039 = 8 dígitos = ERRO REAL\n" +
"```\n\n" +
"### 📝 VALIDAÇÃO RIGOROSA DE ORTOGRAFIA\n\n" +
"**DETECTAR ERROS ORTOGRÁFICOS ÓBVIOS QUE EXISTEM NO TEXTO**\n\n" +
"```javascript\n" +
"function validar_ortografia(texto) {\n" +
"    const erros_ortograficos = [];\n" +
"    \n" +
"    // Palavras com erros óbvios - detectar apenas se existirem no texto\n" +
"    const palavras_incorretas = {\n" +
"        'SOOLTEIRO': 'SOLTEIRO',\n" +
"        'SOLETEIRO': 'SOLTEIRO', \n" +
"        'SOLTERO': 'SOLTEIRO',\n" +
"        'CASDO': 'CASADO',\n" +
"        'CAZADO': 'CASADO',\n" +
"        'VIUVA': 'VIÚVA',\n" +
"        'VIUVO': 'VIÚVO'\n" +
"    };\n" +
"    \n" +
"    // Verificar se alguma palavra incorreta está presente\n" +
"    for (const [incorreta, correta] of Object.entries(palavras_incorretas)) {\n" +
"        if (texto.includes(incorreta)) {\n" +
"            erros_ortograficos.push({\n" +
"                erro: \"Erro ortográfico encontrado: \\\"\" + incorreta + \"\\\"\",\n" +
"                correcao: \"Deveria ser: \\\"\" + correta + \"\\\"\",\n" +
"                localizacao: \"Palavra \\\"\" + incorreta + \"\\\" encontrada no texto\",\n" +
"                campo: \"Estado Civil\"\n" +
"            });\n" +
"        }\n" +
"    }\n" +
"    \n" +
"    return erros_ortograficos;\n" +
"}\n" +
"```\n\n" +
"### 🗓️ VALIDAÇÃO DE DATAS - APENAS FORMATO\n\n" +
"**NÃO validar anos futuros - apenas formato DD/MM/AAAA**\n\n" +
"```javascript\n" +
"function validar_formato_datas(texto) {\n" +
"    const regex_data = /\\\\b(\\\\d{1,2})\\\\/(\\\\d{1,2})\\\\/(\\\\d{4})\\\\b/g;\n" +
"    const erros_data = [];\n" +
"    \n" +
"    let match;\n" +
"    while ((match = regex_data.exec(texto)) !== null) {\n" +
"        const dia = parseInt(match[1]);\n" +
"        const mes = parseInt(match[2]);\n" +
"        \n" +
"        // Validar apenas formato básico\n" +
"        if (dia < 1 || dia > 31) {\n" +
"            erros_data.push({\n" +
"                erro: \"Data com dia inválido: \" + match[0],\n" +
"                encontrado: match[0],\n" +
"                esperado: \"DD/MM/AAAA (dia 01-31)\"\n" +
"            });\n" +
"        }\n" +
"        \n" +
"        if (mes < 1 || mes > 12) {\n" +
"            erros_data.push({\n" +
"                erro: \"Data com mês inválido: \" + match[0],\n" +
"                encontrado: match[0],\n" +
"                esperado: \"DD/MM/AAAA (mês 01-12)\"\n" +
"            });\n" +
"        }\n" +
"    }\n" +
"    \n" +
"    return erros_data;\n" +
"}\n" +
"```\n\n" +
"**Contrato para análise:**\n" + contractText;
};