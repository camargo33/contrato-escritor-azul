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
import { useContractUpload } from '@/hooks/useContractUpload';

const ContractAnalysisSection = () => {
  const { uploadState, setUploadState, resetUpload, handleNewAnalysis } = useContractUpload();
  const queryClient = useQueryClient();

  // Análise automática COM DELAY para garantir estabilidade
  useEffect(() => {
    if (uploadState.file && 
        uploadState.fullText && 
        uploadState.fullText.trim().length > 50 && // Garantir que tem texto suficiente
        !uploadState.isAnalyzing && 
        !uploadState.analysisResult && 
        !uploadState.error) {
      
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 2000); // Delay de 2 segundos

      return () => clearTimeout(timer);
    }
  }, [uploadState.file, uploadState.fullText, uploadState.isAnalyzing, uploadState.analysisResult, uploadState.error]);

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.fullText || uploadState.fullText.trim().length < 50) {
      const errorMsg = "Arquivo ou texto insuficiente para análise";
      toast.error(errorMsg);
      return;
    }
    
    setUploadState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      analysisResult: null,
      error: null 
    }));

    try {
      console.log("🚀 Iniciando análise do contrato...");
      
      const result = await openaiService.analyzeContract(
        uploadState.fullText, 
        uploadState.file.name
      );

      console.log("📊 Resultado da análise:", result);

      if (result.success) {
        setUploadState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: result
        }));
        
        // 🔄 INVALIDAÇÃO ROBUSTA DAS QUERIES PARA ATUALIZAR DASHBOARD
        console.log("🔄 Invalidando queries para atualizar dashboard...");
        
        // Aguardar um pouco para garantir que o salvamento foi concluído
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Invalidar todas as queries relacionadas
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['analysis-history'] }),
          queryClient.invalidateQueries({ queryKey: ['analysis-reports'] }),
          queryClient.invalidateQueries({ queryKey: ['base-contracts-stats'] }),
          queryClient.invalidateQueries({ queryKey: ['base-contracts'] })
        ]);
        
        // Forçar refetch das queries principais
        queryClient.refetchQueries({ queryKey: ['analysis-history'] });
        
        console.log("✅ Dashboard atualizado com sucesso!");
        toast.success("✅ Análise concluída! Dashboard atualizado.");
        
      } else {
        const errorMsg = result.error || "Erro na análise";
        console.error("❌ Erro na análise:", errorMsg);
        
        setUploadState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: errorMsg
        }));
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Erro inesperado na análise";
      console.error("❌ Erro crítico na análise:", error);
      
      setUploadState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMsg
      }));
      toast.error(errorMsg);
    }
  };

  const handleNewAnalysisWithRefresh = async () => {
    console.log("🔄 Iniciando nova análise e atualizando dashboard...");
    
    resetUpload();
    
    // Garantir que o dashboard seja atualizado
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['analysis-history'] }),
      queryClient.invalidateQueries({ queryKey: ['analysis-reports'] }),
      queryClient.invalidateQueries({ queryKey: ['base-contracts-stats'] })
    ]);
    
    // Forçar refetch
    queryClient.refetchQueries({ queryKey: ['analysis-history'] });
    
    console.log("✅ Dashboard atualizado para nova análise!");
  };

  return (
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
  );
};

export default ContractAnalysisSection;