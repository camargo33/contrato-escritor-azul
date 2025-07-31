import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Zap, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { openaiService } from '@/services/openaiService';
import { useQueryClient } from "@tanstack/react-query";
import AnalysisReport from './AnalysisReport';
import FileUploadArea from './FileUploadArea';
import TextPreviewCard from './TextPreviewCard';
import AnalyzeButton from './AnalyzeButton';
import AnimatedCard from './AnimatedCard';
import FeedbackMessage from './FeedbackMessage';
import ApiKeyStatus from './ApiKeyStatus';
import DebugOpenRouter from './DebugOpenRouter';
import { useContractUpload } from '@/hooks/useContractUpload';

const ContractAnalysisSection = () => {
  const { uploadState, setUploadState, resetUpload, handleNewAnalysis } = useContractUpload();
  const queryClient = useQueryClient();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true); // Mostrar debug por padrão

  // Adicionar log de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev.slice(-4), logMessage]); // Manter apenas os últimos 5 logs
  };

  // Monitorar mudanças no estado
  useEffect(() => {
    addDebugLog(`Estado: file=${!!uploadState.file}, fullText=${uploadState.fullText.length}chars, analyzing=${uploadState.isAnalyzing}, hasResult=${!!uploadState.analysisResult}, hasError=${!!uploadState.error}`);
  }, [uploadState]);

  // Análise automática COM DELAY para garantir estabilidade
  useEffect(() => {
    if (uploadState.file && 
        uploadState.fullText && 
        uploadState.fullText.trim().length > 50 && // Garantir que tem texto suficiente
        !uploadState.isAnalyzing && 
        !uploadState.analysisResult && 
        !uploadState.error) {
      
      addDebugLog("✅ Condições OK para análise automática. Iniciando em 2s...");
      
      const timer = setTimeout(() => {
        addDebugLog("🚀 Executando análise automática");
        handleAnalyze();
      }, 2000); // Delay de 2 segundos

      return () => clearTimeout(timer);
    }
  }, [uploadState.file, uploadState.fullText, uploadState.isAnalyzing, uploadState.analysisResult, uploadState.error]);

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.fullText || uploadState.fullText.trim().length < 50) {
      const errorMsg = "Arquivo ou texto insuficiente para análise";
      addDebugLog(`❌ Análise cancelada: ${errorMsg}`);
      toast.error(errorMsg);
      return;
    }

    addDebugLog(`🔄 Iniciando análise: ${uploadState.file.name} (${uploadState.fullText.length} chars)`);
    
    setUploadState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      analysisResult: null,
      error: null 
    }));

    try {
      addDebugLog("📡 Chamando openaiService.analyzeContract...");
      
      const result = await openaiService.analyzeContract(
        uploadState.fullText, 
        uploadState.file.name
      );

      addDebugLog(`📊 Resultado: success=${result.success}`);

      if (result.success) {
        setUploadState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: result
        }));
        
        // Invalidar queries para atualizar dashboard e relatórios
        queryClient.invalidateQueries({ queryKey: ['analysis-history'] });
        queryClient.invalidateQueries({ queryKey: ['analysis-reports'] });
        queryClient.invalidateQueries({ queryKey: ['base-contracts-stats'] });
        
        toast.success("✅ Análise concluída com sucesso!");
        addDebugLog("✅ Análise concluída com sucesso!");
      } else {
        const errorMsg = result.error || "Erro na análise";
        setUploadState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: errorMsg
        }));
        toast.error(errorMsg);
        addDebugLog(`❌ Erro na análise: ${errorMsg}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Erro inesperado na análise";
      console.error("❌ Erro na análise:", error);
      addDebugLog(`❌ Erro inesperado: ${errorMsg}`);
      
      setUploadState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMsg
      }));
      toast.error(errorMsg);
    }
  };

  const handleNewAnalysisWithRefresh = () => {
    addDebugLog("🔄 Nova análise (reset completo)");
    resetUpload();
    setDebugInfo([]); // Limpar logs de debug
    // Invalidar queries novamente para garantir dados atualizados
    queryClient.invalidateQueries({ queryKey: ['analysis-history'] });
    queryClient.invalidateQueries({ queryKey: ['analysis-reports'] });
  };

  return (
    <>
      {/* Debug OpenRouter - REMOVÍVEL EM PRODUÇÃO */}
      {showDebug && (
        <div className="mb-4">
          <DebugOpenRouter />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDebug(false)}
            className="mt-2"
          >
            Ocultar Debug (usar apenas em desenvolvimento)
          </Button>
        </div>
      )}

      {/* Debug Logs - REMOVÍVEL EM PRODUÇÃO */}
      {debugInfo.length > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-sm">🔧 Logs de Debug (remover em produção)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.map((log, index) => (
                <div key={index} className="font-mono text-blue-700">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AnimatedCard 
        className="h-fit shadow-sm border-border bg-card hover:shadow-lift transition-all duration-300"
        hoverEffect="lift"
      >
        <div className="bg-primary text-primary-foreground rounded-t-lg p-6 -m-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Análise de Contrato</h2>
                <p className="text-sm opacity-90">
                  Análise inteligente com IA - Modelo GPT-4o-mini via OpenRouter
                </p>
              </div>
            </div>
            <ApiKeyStatus />
          </div>
        </div>

        <div className="space-y-6">
          {/* Área de Upload */}
          <div className="stagger-item">
            <FileUploadArea
              uploadState={uploadState}
              setUploadState={setUploadState}
              onReset={resetUpload}
            />
          </div>

          {/* Erro */}
          {uploadState.error && (
            <div className="stagger-item">
              <FeedbackMessage
                type="error"
                title="Erro na Análise"
                message={uploadState.error}
                className="border-destructive/20 bg-destructive/5"
              />
            </div>
          )}

          {/* Preview do Texto */}
          {uploadState.textPreview && !uploadState.isAnalyzing && !uploadState.analysisResult && (
            <div className="stagger-item">
              <TextPreviewCard textPreview={uploadState.textPreview} />
              
              {/* Botão Manual de Análise (caso automática falhe) */}
              {uploadState.fullText && uploadState.fullText.length > 50 && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={handleAnalyze}
                    className="gap-2"
                    disabled={uploadState.isAnalyzing}
                  >
                    <Play className="h-4 w-4" />
                    Analisar Manualmente
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use apenas se a análise automática não funcionar
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Indicador de Análise em Progresso */}
          {uploadState.isAnalyzing && (
            <div className="stagger-item">
              <FeedbackMessage
                type="info"
                title="Análise em Progresso"
                message="A inteligência artificial está analisando o contrato via OpenRouter..."
                className="border-blue-200 bg-blue-50 animate-pulse"
              />
            </div>
          )}

          {/* Resultado da Análise */}
          {uploadState.analysisResult && uploadState.analysisResult.success && (
            <div className="stagger-item">
              <AnalysisReport
                content={uploadState.analysisResult.content}
                timestamp={uploadState.analysisResult.timestamp}
                filename={uploadState.analysisResult.filename}
                onNewAnalysis={handleNewAnalysisWithRefresh}
              />
            </div>
          )}
        </div>
      </AnimatedCard>
    </>
  );
};

export default ContractAnalysisSection;