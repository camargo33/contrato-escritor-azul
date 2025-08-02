-- FASE 1: Simplificação do Schema - Remover analysis_history
-- Remover tabela de histórico de análises para simplificar o sistema
-- Data: 2025-08-02
-- Objetivo: Focar apenas na funcionalidade core de análise sem persistência

-- Remover tabela analysis_history
DROP TABLE IF EXISTS analysis_history CASCADE;

-- Comentário sobre a simplificação
COMMENT ON SCHEMA public IS 'Schema simplificado - FASE 1: Removido analysis_history para focar na funcionalidade core de análise de contratos sem histórico persistente';

-- Verificar se ainda existem referências
-- (Não deveria haver, mas é uma verificação de segurança)
DO $$
BEGIN
    -- Log da operação
    RAISE NOTICE 'FASE 1 - Simplificação concluída: Tabela analysis_history removida';
    RAISE NOTICE 'Sistema agora foca apenas em análise temporária sem histórico';
END $$;
