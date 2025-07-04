
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Zap } from "lucide-react";
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

  // Monitorar quando arquivo está pronto para análise automática
  useEffect(() => {
    if (uploadState.file && uploadState.fullText && !uploadState.isAnalyzing && !uploadState.analysisResult && !uploadState.error) {
      console.log("Arquivo pronto para análise automática:", {
        hasFile: !!uploadState.file,
        hasText: !!uploadState.fullText,
        textLength: uploadState.fullText?.length || 0
      });
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        handleAnalyze();
      }, 100);
    }
  }, [uploadState.file, uploadState.fullText, uploadState.isAnalyzing, uploadState.analysisResult, uploadState.error]);

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.fullText) {
      console.log("Análise não executada - arquivo ou texto não disponível:", {
        hasFile: !!uploadState.file,
        hasText: !!uploadState.fullText,
        textLength: uploadState.fullText?.length || 0
      });
      return;
    }

    console.log("Iniciando análise do contrato...", uploadState.file.name);
    setUploadState(prev => ({ ...prev, isAnalyzing: true, analysisResult: null }));

    try {
      console.log("Iniciando análise do contrato...");
      const result = await openaiService.analyzeContract(
        uploadState.fullText, 
        uploadState.file.name
      );

      console.log("Resultado da análise:", result);

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
        
        toast.success("Análise concluída com sucesso!");
      } else {
        setUploadState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: result.error || "Erro na análise"
        }));
        toast.error(result.error || "Erro na análise");
      }
    } catch (error: any) {
      console.error("Erro na análise:", error);
      setUploadState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: "Erro inesperado na análise"
      }));
      toast.error("Erro inesperado na análise");
    }
  };

  const handleNewAnalysisWithRefresh = () => {
    resetUpload(); // Usar resetUpload completo ao invés de handleNewAnalysis
    // Invalidar queries novamente para garantir dados atualizados
    queryClient.invalidateQueries({ queryKey: ['analysis-history'] });
    queryClient.invalidateQueries({ queryKey: ['analysis-reports'] });
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
                Análise inteligente com IA - Modelo GPT-4o-mini
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
          </div>
        )}

        {/* Indicador de Análise em Progresso */}
        {uploadState.isAnalyzing && (
          <div className="stagger-item">
            <FeedbackMessage
              type="info"
              title="Análise em Progresso"
              message="A inteligência artificial está analisando o contrato automaticamente..."
              className="border-blue-200 bg-blue-50 animate-pulse"
            />
          </div>
        )}

        {/* Botão de Análise - Oculto pois análise é automática */}

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
