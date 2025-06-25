
-- Criar tabela para contratos base
CREATE TABLE public.base_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT, -- caminho no storage
  contract_type TEXT, -- tipo do contrato (ex: banda_larga, tv, telefone)
  plan_name TEXT, -- nome do plano (ex: 300Mbps, 500Mbps, Giga)
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para cláusulas extraídas dos contratos
CREATE TABLE public.contract_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_contract_id UUID REFERENCES public.base_contracts(id) ON DELETE CASCADE NOT NULL,
  clause_type TEXT NOT NULL, -- tipo da cláusula (ex: preco, fidelidade, cancelamento)
  clause_title TEXT,
  clause_content TEXT NOT NULL,
  section_number TEXT,
  is_standard BOOLEAN DEFAULT true, -- se é uma cláusula padrão
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para templates/padrões de contratos
CREATE TABLE public.contract_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  plan_name TEXT,
  standard_clauses JSONB, -- cláusulas padrão em formato JSON
  pricing_info JSONB, -- informações de preços
  equipment_info JSONB, -- informações de equipamentos
  terms_info JSONB, -- termos e condições padrão
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de análises
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  analyzed_filename TEXT NOT NULL,
  analysis_content JSONB NOT NULL, -- resultado da análise em JSON estruturado
  errors_found INTEGER DEFAULT 0,
  base_contracts_used UUID[] DEFAULT '{}', -- IDs dos contratos base usados na comparação
  analysis_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_duration_ms INTEGER, -- tempo de análise em milissegundos
  openai_tokens_used INTEGER, -- tokens consumidos da OpenAI
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar bucket de storage para PDFs dos contratos base
INSERT INTO storage.buckets (id, name, public) VALUES ('base-contracts', 'base-contracts', false);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.base_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para base_contracts
CREATE POLICY "Users can view their own base contracts" 
  ON public.base_contracts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own base contracts" 
  ON public.base_contracts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own base contracts" 
  ON public.base_contracts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own base contracts" 
  ON public.base_contracts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para contract_clauses
CREATE POLICY "Users can view clauses from their base contracts" 
  ON public.contract_clauses 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.base_contracts 
    WHERE id = contract_clauses.base_contract_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create clauses for their base contracts" 
  ON public.contract_clauses 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.base_contracts 
    WHERE id = contract_clauses.base_contract_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update clauses from their base contracts" 
  ON public.contract_clauses 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.base_contracts 
    WHERE id = contract_clauses.base_contract_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete clauses from their base contracts" 
  ON public.contract_clauses 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.base_contracts 
    WHERE id = contract_clauses.base_contract_id 
    AND user_id = auth.uid()
  ));

-- Políticas RLS para contract_templates
CREATE POLICY "Users can view their own contract templates" 
  ON public.contract_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contract templates" 
  ON public.contract_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contract templates" 
  ON public.contract_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract templates" 
  ON public.contract_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para analysis_history
CREATE POLICY "Users can view their own analysis history" 
  ON public.analysis_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis history" 
  ON public.analysis_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas de storage para base-contracts bucket
CREATE POLICY "Users can upload their own contract files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'base-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own contract files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'base-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contract files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'base-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Criar índices para melhor performance
CREATE INDEX idx_base_contracts_user_id ON public.base_contracts(user_id);
CREATE INDEX idx_base_contracts_type ON public.base_contracts(contract_type);
CREATE INDEX idx_contract_clauses_base_contract_id ON public.contract_clauses(base_contract_id);
CREATE INDEX idx_contract_clauses_type ON public.contract_clauses(clause_type);
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_timestamp ON public.analysis_history(analysis_timestamp DESC);
