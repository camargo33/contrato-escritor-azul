
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface UploadState {
  file: File | null;
  isLoading: boolean;
  textPreview: string;
  error: string | null;
  isAnalyzing: boolean;
  analysisResult: string;
}

const ContractAnalysisSection = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isLoading: false,
    textPreview: "",
    error: null,
    isAnalyzing: false,
    analysisResult: ""
  });

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Por favor, selecione apenas arquivos PDF.";
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return "O arquivo deve ter no máximo 10MB.";
    }
    return null;
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    const numPages = Math.min(pdf.numPages, 3); // Primeiras 3 páginas para preview
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + " ";
    }
    
    return fullText;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({ ...prev, error: validationError }));
      toast.error(validationError);
      return;
    }

    setUploadState(prev => ({
      ...prev,
      file,
      isLoading: true,
      error: null,
      textPreview: "",
      analysisResult: ""
    }));

    try {
      const text = await extractTextFromPDF(file);
      const preview = text.slice(0, 1000) + (text.length > 1000 ? "..." : "");
      
      setUploadState(prev => ({
        ...prev,
        isLoading: false,
        textPreview: preview
      }));
      
      toast.success("PDF processado com sucesso!");
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      setUploadState(prev => ({
        ...prev,
        isLoading: false,
        error: "Erro ao processar o arquivo PDF. Tente novamente."
      }));
      toast.error("Erro ao processar o PDF");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, isAnalyzing: true }));

    // Simular análise ortográfica
    setTimeout(() => {
      const result = "Análise concluída! Contrato analisado com sucesso. Foram encontrados 3 erros ortográficos menores que foram destacados no documento.";
      setUploadState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisResult: result
      }));
      toast.success("Análise concluída!");
    }, 2000);
  };

  const resetUpload = () => {
    setUploadState({
      file: null,
      isLoading: false,
      textPreview: "",
      error: null,
      isAnalyzing: false,
      analysisResult: ""
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-slate-700 text-white">
        <CardTitle className="text-xl">Análise de Contrato</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            uploadState.isLoading 
              ? "border-blue-300 bg-blue-50" 
              : uploadState.error 
                ? "border-red-300 bg-red-50" 
                : uploadState.file 
                  ? "border-green-300 bg-green-50" 
                  : "border-gray-300 hover:border-slate-400"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploadState.isLoading && document.getElementById('file-input')?.click()}
        >
          {uploadState.isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-blue-600 mb-2">Processando PDF...</p>
            </>
          ) : uploadState.file ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 mb-2">Arquivo carregado com sucesso!</p>
              <p className="text-sm text-slate-600 font-medium mb-2">
                {uploadState.file.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
              >
                Remover arquivo
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Arraste seu contrato aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500">
                Apenas arquivos PDF até 10MB
              </p>
            </>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadState.isLoading}
          />
        </div>

        {/* Erro */}
        {uploadState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadState.error}</AlertDescription>
          </Alert>
        )}

        {/* Preview do Texto */}
        {uploadState.textPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prévia do Texto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {uploadState.textPreview}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Botão de Análise */}
        <Button
          onClick={handleAnalyze}
          disabled={!uploadState.file || uploadState.isLoading || uploadState.isAnalyzing}
          className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300"
        >
          {uploadState.isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            "Analisar Contrato"
          )}
        </Button>

        {/* Resultado da Análise */}
        {uploadState.analysisResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{uploadState.analysisResult}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractAnalysisSection;
