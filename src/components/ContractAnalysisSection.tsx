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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Analysis Card */}
      <div className="lg:col-span-2">
        <AnimatedCard 
          className="h-fit shadow-elegant border-border bg-white hover:shadow-lift transition-all duration-300 overflow-hidden"
          hoverEffect="lift"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Análise de Contrato</h2>
                  <p className="text-slate-300 font-medium">
                    IA avançada • GPT-4o-mini • OpenRouter
                  </p>
                </div>
              </div>
              <ApiKeyStatus />
            </div>
          </div>

          <div className="p-8 space-y-6">
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
      </div>

      {/* Sidebar with Info */}
      <div className="space-y-6">
        {/* Features Card */}
        <Card className="shadow-elegant bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Zap className="h-5 w-5" />
              Recursos Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">Análise de Dados Pessoais</p>
                  <p className="text-sm text-slate-600">Validação de CPF, telefone, email e endereço</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">Verificação Fiscal</p>
                  <p className="text-sm text-slate-600">Análise de tributação e impostos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800">Relatório Detalhado</p>
                  <p className="text-sm text-slate-600">Análise completa com correções sugeridas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-elegant bg-gradient-to-br from-slate-50 to-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Modelo IA</span>
              <span className="text-sm font-medium">GPT-4o-mini</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Precisão</span>
              <span className="text-sm font-medium text-blue-600">99.5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractAnalysisSection;