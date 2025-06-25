
import { supabase } from "@/integrations/supabase/client";
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

export const contractService = {
  // Upload e processamento de contratos base
  async uploadBaseContract(file: File, contractData: {
    name: string;
    contract_type?: string;
    plan_name?: string;
  }): Promise<{ success: boolean; contractId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // 1. Upload do arquivo para o storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('base-contracts')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        return { success: false, error: "Erro ao fazer upload do arquivo" };
      }

      // 2. Salvar registro do contrato no banco
      const { data: contractRecord, error: dbError } = await supabase
        .from('base_contracts')
        .insert({
          user_id: user.id,
          name: contractData.name,
          original_filename: file.name,
          file_path: uploadData.path,
          contract_type: contractData.contract_type,
          plan_name: contractData.plan_name,
          is_processed: false
        })
        .select()
        .single();

      if (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        return { success: false, error: "Erro ao salvar contrato no banco de dados" };
      }

      // 3. Processar PDF em background (extrair texto e analisar estrutura)
      this.processContractInBackground(contractRecord.id, file);

      return { success: true, contractId: contractRecord.id };
    } catch (error) {
      console.error("Erro geral no upload:", error);
      return { success: false, error: "Erro inesperado no upload" };
    }
  },

  // Processamento em background do contrato
  async processContractInBackground(contractId: string, file: File) {
    try {
      console.log("Iniciando processamento em background do contrato:", contractId);
      
      // Extrair texto do PDF
      const extractedText = await extractTextFromPDF(file);
      
      if (extractedText && extractedText !== "PDF_NO_TEXT") {
        // Analisar e extrair cláusulas usando IA
        const clauses = await this.extractClausesFromText(extractedText, contractId);
        
        // Marcar como processado
        await supabase
          .from('base_contracts')
          .update({ 
            is_processed: true, 
            processed_at: new Date().toISOString() 
          })
          .eq('id', contractId);

        console.log(`Contrato ${contractId} processado com sucesso. ${clauses.length} cláusulas extraídas.`);
      }
    } catch (error) {
      console.error("Erro no processamento em background:", error);
    }
  },

  // Extrair cláusulas do texto usando IA
  async extractClausesFromText(text: string, contractId: string): Promise<ContractClause[]> {
    try {
      // Aqui usaríamos a OpenAI para extrair cláusulas estruturadas
      // Por enquanto, vou criar uma versão simplificada
      const commonClauses = this.identifyCommonClauses(text);
      
      const clausesToInsert = commonClauses.map(clause => ({
        base_contract_id: contractId,
        clause_type: clause.type,
        clause_title: clause.title,
        clause_content: clause.content,
        section_number: clause.section,
        is_standard: true
      }));

      if (clausesToInsert.length > 0) {
        const { data, error } = await supabase
          .from('contract_clauses')
          .insert(clausesToInsert)
          .select();

        if (error) {
          console.error("Erro ao salvar cláusulas:", error);
          return [];
        }

        return data || [];
      }

      return [];
    } catch (error) {
      console.error("Erro na extração de cláusulas:", error);
      return [];
    }
  },

  // Identificar cláusulas comuns (versão simplificada)
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

  // Buscar contratos base do usuário
  async getUserBaseContracts(): Promise<BaseContract[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('base_contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar contratos:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
      return [];
    }
  },

  // Buscar cláusulas de um contrato
  async getContractClauses(contractId: string): Promise<ContractClause[]> {
    try {
      const { data, error } = await supabase
        .from('contract_clauses')
        .select('*')
        .eq('base_contract_id', contractId)
        .order('clause_type');

      if (error) {
        console.error("Erro ao buscar cláusulas:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar cláusulas:", error);
      return [];
    }
  },

  // Salvar análise no histórico
  async saveAnalysisHistory(analysisData: {
    analyzed_filename: string;
    analysis_content: any;
    errors_found: number;
    base_contracts_used: string[];
    analysis_duration_ms: number;
    openai_tokens_used?: number;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Usuário não autenticado" };

      const { data, error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          ...analysisData
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar histórico:", error);
        return { success: false, error: "Erro ao salvar histórico" };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
      return { success: false, error: "Erro inesperado" };
    }
  }
};
