import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { openaiService } from '@/services/openaiService';
import AnalysisReport from './AnalysisReport';
import FileUploadArea from './FileUploadArea';
import TextPreviewCard from './TextPreviewCard';
import AnalyzeButton from './AnalyzeButton';
import AnimatedCard from './AnimatedCard';
import FeedbackMessage from './FeedbackMessage';
import { useContractUpload } from '@/hooks/useContractUpload';

const ContractAnalysisSection = () => {
  const { uploadState, setUploadState, resetUpload, handleNewAnalysis } = useContractUpload();

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.fullText) return;

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

  return (
    <AnimatedCard 
      className="h-fit"
      hoverEffect="lift"
    >
      <div className="bg-secondary text-secondary-foreground rounded-t-lg p-6 -m-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Análise de Contrato</h2>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-whatsapp px-2 py-1 rounded text-white">
              API Configurada ✓
            </div>
          </div>
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
            />
          </div>
        )}

        {/* Preview do Texto */}
        {uploadState.textPreview && (
          <div className="stagger-item">
            <TextPreviewCard textPreview={uploadState.textPreview} />
          </div>
        )}

        {/* Botão de Análise */}
        <div className="stagger-item">
          <AnalyzeButton
            uploadState={uploadState}
            onClick={handleAnalyze}
          />
        </div>

        {/* Resultado da Análise */}
        {uploadState.analysisResult && uploadState.analysisResult.success && (
          <div className="stagger-item">
            <AnalysisReport
              content={uploadState.analysisResult.content}
              timestamp={uploadState.analysisResult.timestamp}
              filename={uploadState.analysisResult.filename}
              onNewAnalysis={handleNewAnalysis}
            />
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default ContractAnalysisSection;
