
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { openaiService } from '@/services/openaiService';
import AnalysisReport from './AnalysisReport';
import FileUploadArea from './FileUploadArea';
import TextPreviewCard from './TextPreviewCard';
import AnalyzeButton from './AnalyzeButton';
import { useContractUpload } from '@/hooks/useContractUpload';

const ContractAnalysisSection = () => {
  const { uploadState, setUploadState, resetUpload, handleNewAnalysis } = useContractUpload();

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.fullText) return;

    setUploadState(prev => ({ ...prev, isAnalyzing: true, analysisResult: null }));

    try {
      const result = await openaiService.analyzeContract(
        uploadState.fullText, 
        uploadState.file.name
      );

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
    <Card className="h-fit">
      <CardHeader className="bg-slate-700 text-white">
        <CardTitle className="text-xl flex items-center justify-between">
          Análise de Contrato
          <div className="flex items-center gap-2">
            <div className="text-xs bg-green-600 px-2 py-1 rounded">
              API Conectada
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Área de Upload */}
        <FileUploadArea
          uploadState={uploadState}
          setUploadState={setUploadState}
          onReset={resetUpload}
        />

        {/* Erro */}
        {uploadState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadState.error}</AlertDescription>
          </Alert>
        )}

        {/* Preview do Texto */}
        <TextPreviewCard textPreview={uploadState.textPreview} />

        {/* Botão de Análise */}
        <AnalyzeButton
          uploadState={uploadState}
          onClick={handleAnalyze}
        />

        {/* Resultado da Análise */}
        {uploadState.analysisResult && uploadState.analysisResult.success && (
          <AnalysisReport
            content={uploadState.analysisResult.content}
            timestamp={uploadState.analysisResult.timestamp}
            filename={uploadState.analysisResult.filename}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ContractAnalysisSection;
