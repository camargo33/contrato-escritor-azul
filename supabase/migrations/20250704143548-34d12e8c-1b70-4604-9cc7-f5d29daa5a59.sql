-- Remover tabelas não utilizadas no sistema
-- Verificado que estas tabelas não são usadas no código

-- Remover tabelas com foreign keys primeiro
DROP TABLE IF EXISTS public.campos_extraidos;
DROP TABLE IF EXISTS public.erros_detectados;

-- Remover tabelas independentes
DROP TABLE IF EXISTS public.analises;
DROP TABLE IF EXISTS public.contract_templates;
DROP TABLE IF EXISTS public.contratos_modelo;

-- Comentário: Mantendo apenas as tabelas em uso:
-- - analysis_history (usada em Dashboard, Reports, contractService)
-- - base_contracts (usada em contractService)  
-- - contract_clauses (relacionada com base_contracts)