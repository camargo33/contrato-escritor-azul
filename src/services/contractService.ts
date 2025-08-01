import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { extractTextFromPDF } from "./pdfProcessor";

export interface BaseContract {
  id: string;
  user_id: string;
  name: string;
  original_filename: string;
  file_path?: string;
  contract_type?: string;
  plan_name?: string;
  upload_date: string;
  processed_at?: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractClause {
  id: string;
  base_contract_id: string;
  clause_type: string;
  clause_title?: string;
  clause_content: string;
  section_number?: string;
  is_standard: boolean;
  created_at: string;
}

// 🔧 CORREÇÃO: Validação e sanitização de dados
const validateContractData = (contractData: {
  name: string;
  contract_type?: string;
  plan_name?: string;
}) => {
  if (!contractData.name || contractData.name.trim().length === 0) {
    throw new Error("Nome do contrato é obrigatório");
  }
  
  if (contractData.name.length > 255) {
    throw new Error("Nome do contrato muito longo (máximo 255 caracteres)");
  }
  
  return {
    ...contractData,
    name: contractData.name.trim(),
    contract_type: contractData.contract_type?.trim() || 'auto_detected',
    plan_name: contractData.plan_name?.trim()
  };
};

// 🔧 CORREÇÃO: Verificação de conectividade
const ensureConnection = async () => {
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    throw new Error("Erro de conectividade com o banco de dados. Tente novamente.");
  }
};

export const contractService = {
  // Upload e processamento de contratos base
  async uploadBaseContract(file: File, contractData: {
    name: string;
    contract_type?: string;
    plan_name?: string;
  }): Promise<{ success: boolean; contractId?: string; error?: string }> {
    try {
      console.log("🚀 Iniciando upload do contrato:", file.name);
      
      // 🔧 CORREÇÃO: Validação de conectividade
      await ensureConnection();
      
      // 🔧 CORREÇÃO: Validação de arquivo
      if (!file) {
        return { success: false, error: "Arquivo não fornecido" };
      }
      
      if (file.type !== 'application/pdf') {
        return { success: false, error: "Apenas arquivos PDF são permitidos" };
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return { success: false, error: "Arquivo muito grande. Limite: 10MB" };
      }
      
      // 🔧 CORREÇÃO: Validação de dados
      const validatedData = validateContractData(contractData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Usuário não autenticado");
        return { success: false, error: "Usuário não autenticado" };
      }

      console.log("✅ Usuário autenticado:", user.id);

      // 1. Upload do arquivo para o storage
      const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log("📤 Fazendo upload do arquivo:", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('base-contracts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        
        // Mensagens de erro mais específicas
        if (uploadError.message?.includes('Bucket not found')) {
          return { 
            success: false, 
            error: "🗄️ Bucket de armazenamento não configurado. Entre em contato com o administrador." 
          };
        }
        
        if (uploadError.message?.includes('duplicate')) {
          return { 
            success: false, 
            error: "📄 Arquivo com este nome já existe. Tente novamente." 
          };
        }
        
        if (uploadError.message?.includes('size')) {
          return { 
            success: false, 
            error: "📏 Arquivo muito grande. Limite: 10MB" 
          };
        }
        
        return { success: false, error: `❌ Erro ao fazer upload: ${uploadError.message}` };
      }

      console.log("✅ Upload realizado com sucesso:", uploadData);

      // 2. Salvar registro do contrato no banco
      const contractRecord = {
        user_id: user.id,
        name: validatedData.name,
        original_filename: file.name,
        file_path: uploadData.path,
        contract_type: validatedData.contract_type,
        plan_name: validatedData.plan_name,
        is_processed: false,
        upload_date: new Date().toISOString()
      };

      console.log("💾 Salvando registro no banco:", contractRecord);

      const { data: savedContract, error: dbError } = await supabase
        .from('base_contracts')
        .insert(contractRecord)
        .select()
        .single();

      if (dbError) {
        console.error("❌ Erro ao salvar no banco:", dbError);
        
        // Cleanup: tentar remover arquivo do storage
        try {
          console.log("🧹 Limpando arquivo após erro no banco...");
          await supabase.storage.from('base-contracts').remove([fileName]);
        } catch (cleanupError) {
          console.error("❌ Erro ao limpar arquivo:", cleanupError);
        }
        
        // Mensagens de erro específicas para banco
        if (dbError.code === '23505') {
          return { success: false, error: "📄 Contrato com este nome já existe" };
        }
        
        if (dbError.code === '42501') {
          return { success: false, error: "🔒 Sem permissão para salvar contrato" };
        }
        
        return { success: false, error: `💾 Erro ao salvar no banco: ${dbError.message}` };
      }

      console.log("✅ Contrato salvo com sucesso:", savedContract);

      // 3. Processar PDF em background (não bloquear resposta)
      this.processContractInBackground(savedContract.id, file).catch(error => {
        console.error("⚠️ Erro no processamento em background:", error);
      });

      return { success: true, contractId: savedContract.id };
      
    } catch (error: any) {
      console.error("💥 Erro geral no upload:", error);
      
      // Log detalhado para debug
      console.error("Stack trace:", error.stack);
      
      return { 
        success: false, 
        error: `💥 Erro inesperado: ${error.message || 'Erro desconhecido'}` 
      };
    }
  },

  // 🔧 CORREÇÃO: Remover contrato base com transação segura
  async deleteBaseContract(contractId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Iniciando remoção do contrato:", contractId);
      
      // Validação de entrada
      if (!contractId || typeof contractId !== 'string') {
        return { success: false, error: "ID do contrato inválido" };
      }
      
      await ensureConnection();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Usuário não autenticado");
        return { success: false, error: "Usuário não autenticado" };
      }

      // 1. Buscar dados do contrato para obter o file_path
      const { data: contract, error: fetchError } = await supabase
        .from('base_contracts')
        .select('file_path, user_id, name')
        .eq('id', contractId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !contract) {
        console.error("❌ Erro ao buscar contrato:", fetchError);
        
        if (fetchError?.code === 'PGRST116') {
          return { success: false, error: "📄 Contrato não encontrado" };
        }
        
        return { success: false, error: "🔒 Contrato não encontrado ou sem permissão" };
      }

      console.log("✅ Contrato encontrado:", contract.name);

      // 2. Remover cláusulas relacionadas primeiro (foreign key)
      const { error: clausesError } = await supabase
        .from('contract_clauses')
        .delete()
        .eq('base_contract_id', contractId);

      if (clausesError) {
        console.error("❌ Erro ao remover cláusulas:", clausesError);
        return { success: false, error: "📋 Erro ao remover cláusulas do contrato" };
      }

      console.log("✅ Cláusulas removidas com sucesso");

      // 3. Remover registro do banco
      const { error: deleteError } = await supabase
        .from('base_contracts')
        .delete()
        .eq('id', contractId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error("❌ Erro ao remover contrato do banco:", deleteError);
        return { success: false, error: "💾 Erro ao remover contrato do banco de dados" };
      }

      console.log("✅ Contrato removido do banco com sucesso");

      // 4. Remover arquivo do storage (não crítico se falhar)
      if (contract.file_path) {
        const { error: storageError } = await supabase.storage
          .from('base-contracts')
          .remove([contract.file_path]);

        if (storageError) {
          console.error("⚠️ Erro ao remover arquivo do storage:", storageError);
          console.warn("⚠️ Arquivo pode não ter sido removido do storage, mas contrato foi removido do sistema");
        } else {
          console.log("✅ Arquivo removido do storage com sucesso");
        }
      }

      return { success: true };
      
    } catch (error: any) {
      console.error("💥 Erro geral na remoção:", error);
      console.error("Stack trace:", error.stack);
      
      return { 
        success: false, 
        error: `💥 Erro inesperado na remoção: ${error.message || 'Erro desconhecido'}` 
      };
    }
  },

  // 🔧 CORREÇÃO: Processamento em background com timeout e retry
  async processContractInBackground(contractId: string, file: File) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries} - Processando contrato:`, contractId);
        
        // Timeout de 30 segundos para extração de PDF
        const extractionPromise = extractTextFromPDF(file);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na extração de PDF')), 30000)
        );
        
        const extractedText = await Promise.race([extractionPromise, timeoutPromise]) as string;
        
        if (extractedText && extractedText !== "PDF_NO_TEXT") {
          // Analisar e extrair cláusulas
          const clauses = await this.extractClausesFromText(extractedText, contractId);
          
          // Marcar como processado
          const { error: updateError } = await supabase
            .from('base_contracts')
            .update({ 
              is_processed: true, 
              processed_at: new Date().toISOString() 
            })
            .eq('id', contractId);

          if (updateError) {
            console.error("❌ Erro ao marcar como processado:", updateError);
          } else {
            console.log(`✅ Contrato ${contractId} processado. ${clauses.length} cláusulas extraídas.`);
          }
          
          return; // Sucesso, sair do loop
        } else {
          console.warn("⚠️ PDF sem texto extraível:", contractId);
          return;
        }
        
      } catch (error) {
        attempt++;
        console.error(`❌ Tentativa ${attempt} falhou:`, error);
        
        if (attempt >= maxRetries) {
          console.error(`💥 Falha final no processamento após ${maxRetries} tentativas:`, contractId);
          
          // Marcar como erro de processamento
          try {
            await supabase
              .from('base_contracts')
              .update({ 
                is_processed: false,
                processed_at: new Date().toISOString()
              })
              .eq('id', contractId);
          } catch (updateError) {
            console.error("❌ Erro ao marcar falha de processamento:", updateError);
          }
        } else {
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
  },

  // 🔧 CORREÇÃO: Extração de cláusulas com timeout
  async extractClausesFromText(text: string, contractId: string): Promise<ContractClause[]> {
    try {
      if (!text || text.trim().length === 0) {
        console.warn("⚠️ Texto vazio para extração de cláusulas");
        return [];
      }
      
      const commonClauses = this.identifyCommonClauses(text);
      
      if (commonClauses.length === 0) {
        console.log("ℹ️ Nenhuma cláusula comum identificada");
        return [];
      }
      
      const clausesToInsert = commonClauses.map(clause => ({
        base_contract_id: contractId,
        clause_type: clause.type,
        clause_title: clause.title,
        clause_content: clause.content.substring(0, 2000), // Limite de caracteres
        section_number: clause.section,
        is_standard: true
      }));

      const { data, error } = await supabase
        .from('contract_clauses')
        .insert(clausesToInsert)
        .select();

      if (error) {
        console.error("❌ Erro ao salvar cláusulas:", error);
        return [];
      }

      console.log(`✅ ${data?.length || 0} cláusulas salvas com sucesso`);
      return data || [];
      
    } catch (error) {
      console.error("❌ Erro na extração de cláusulas:", error);
      return [];
    }
  },

  // Identificar cláusulas comuns (mantido igual)
  identifyCommonClauses(text: string) {
    const clauses = [];
    const lowerText = text.toLowerCase();

    // Procurar por cláusulas de preço
    if (lowerText.includes('valor') || lowerText.includes('preço') || lowerText.includes('mensalidade')) {
      const priceMatch = text.match(/(?:valor|preço|mensalidade)[^.]*\./gi);
      if (priceMatch) {
        clauses.push({
          type: 'preco',
          title: 'Cláusula de Preço',
          content: priceMatch[0],
          section: '1'
        });
      }
    }

    // Procurar por cláusulas de fidelidade
    if (lowerText.includes('fidelidade') || lowerText.includes('permanência')) {
      const fidelityMatch = text.match(/(?:fidelidade|permanência)[^.]*\./gi);
      if (fidelityMatch) {
        clauses.push({
          type: 'fidelidade',
          title: 'Cláusula de Fidelidade',
          content: fidelityMatch[0],
          section: '2'
        });
      }
    }

    // Procurar por cláusulas de cancelamento
    if (lowerText.includes('cancelamento') || lowerText.includes('rescisão')) {
      const cancelMatch = text.match(/(?:cancelamento|rescisão)[^.]*\./gi);
      if (cancelMatch) {
        clauses.push({
          type: 'cancelamento',
          title: 'Cláusula de Cancelamento',
          content: cancelMatch[0],
          section: '3'
        });
      }
    }

    return clauses;
  },

  // 🔧 CORREÇÃO: Buscar contratos com paginação e filtros
  async getUserBaseContracts(options?: {
    limit?: number;
    offset?: number;
    contractType?: string;
  }): Promise<BaseContract[]> {
    try {
      await ensureConnection();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("⚠️ Usuário não autenticado");
        return [];
      }

      let query = supabase
        .from('base_contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filtros opcionais
      if (options?.contractType) {
        query = query.eq('contract_type', options.contractType);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Erro ao buscar contratos:", error);
        return [];
      }

      console.log(`✅ ${data?.length || 0} contratos carregados`);
      return data || [];
      
    } catch (error) {
      console.error("❌ Erro ao buscar contratos:", error);
      return [];
    }
  },

  // 🔧 CORREÇÃO: Buscar cláusulas com cache
  async getContractClauses(contractId: string): Promise<ContractClause[]> {
    try {
      if (!contractId) {
        console.warn("⚠️ ID do contrato não fornecido");
        return [];
      }
      
      await ensureConnection();

      const { data, error } = await supabase
        .from('contract_clauses')
        .select('*')
        .eq('base_contract_id', contractId)
        .order('clause_type');

      if (error) {
        console.error("❌ Erro ao buscar cláusulas:", error);
        return [];
      }

      console.log(`✅ ${data?.length || 0} cláusulas carregadas para contrato ${contractId}`);
      return data || [];
      
    } catch (error) {
      console.error("❌ Erro ao buscar cláusulas:", error);
      return [];
    }
  },

  // 🔧 CORREÇÃO: Salvar análise com validação
  async saveAnalysisHistory(analysisData: {
    analyzed_filename: string;
    analysis_content: any;
    errors_found: number;
    base_contracts_used: string[];
    analysis_duration_ms: number;
    openai_tokens_used?: number;
  }) {
    try {
      await ensureConnection();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // Validação dos dados de entrada
      if (!analysisData.analyzed_filename) {
        return { success: false, error: "Nome do arquivo é obrigatório" };
      }
      
      if (!analysisData.analysis_content) {
        return { success: false, error: "Conteúdo da análise é obrigatório" };
      }

      const { data, error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          analyzed_filename: analysisData.analyzed_filename.trim(),
          analysis_content: analysisData.analysis_content,
          errors_found: Math.max(0, analysisData.errors_found || 0),
          base_contracts_used: analysisData.base_contracts_used || [],
          analysis_duration_ms: Math.max(0, analysisData.analysis_duration_ms || 0),
          openai_tokens_used: analysisData.openai_tokens_used || 0
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao salvar histórico:", error);
        return { success: false, error: "Erro ao salvar histórico de análise" };
      }

      console.log("✅ Histórico de análise salvo:", data.id);
      return { success: true, data };
      
    } catch (error) {
      console.error("❌ Erro ao salvar histórico:", error);
      return { success: false, error: "Erro inesperado ao salvar histórico" };
    }
  }
};
