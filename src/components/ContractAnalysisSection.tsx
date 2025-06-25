
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import { openaiService } from '@/services/openaiService';
import ApiKeyModal from './ApiKeyModal';
import AnalysisReport from './AnalysisReport';

// Configure PDF.js worker with a single reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
console.log("PDF.js worker configurado");

interface UploadState {
  file: File | null;
  isLoading: boolean;
  textPreview: string;
  error: string | null;
  isAnalyzing: boolean;
  analysisResult: any;
  fullText: string;
}

const ContractAnalysisSection = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isLoading: false,
    textPreview: "",
    error: null,
    isAnalyzing: false,
    analysisResult: null,
    fullText: ""
  });

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const validateFile = (file: File): string | null => {
    console.log("Validando arquivo:", file.name, "Tamanho:", file.size, "bytes");
    
    if (file.type !== "application/pdf") {
      return "Por favor, selecione apenas arquivos PDF.";
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return "O arquivo deve ter no máximo 10MB.";
    }
    return null;
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    console.log("Iniciando extração de texto do PDF:", file.name);
    
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        try {
          const typedArray = new Uint8Array(this.result as ArrayBuffer);
          console.log("Arquivo carregado, processando com PDF.js...");
          
          const loadingTask = pdfjsLib.getDocument({ 
            data: typedArray,
            useSystemFonts: true,
            disableFontFace: false
          });
          
          const pdf = await loadingTask.promise;
          console.log("PDF processado. Número de páginas:", pdf.numPages);
          
          let fullText = "";
          
          // Extrair texto de todas as páginas
          for (let i = 1; i <= pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
              fullText += pageText + " ";
              console.log(`Página ${i} processada, caracteres extraídos:`, pageText.length);
            } catch (pageError) {
              console.warn(`Erro ao processar página ${i}:`, pageError);
            }
          }
          
          console.log("Texto completo extraído. Primeiros 100 caracteres:", fullText.substring(0, 100));
          
          if (fullText.trim().length === 0) {
            resolve("PDF_NO_TEXT");
          } else {
            resolve(fullText.trim());
          }
        } catch (error) {
          console.error("Erro durante extração:", error);
          reject(error);
        }
      };
      
      fileReader.onerror = () => {
        console.error("Erro ao ler arquivo");
        reject(new Error("Erro ao ler o arquivo"));
      };
      
      fileReader.readAsArrayBuffer(file);
    });
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
      analysisResult: null,
      fullText: ""
    }));

    try {
      const extractedText = await extractTextFromPDF(file);
      
      if (extractedText === "PDF_NO_TEXT") {
        setUploadState(prev => ({
          ...prev,
          isLoading: false,
          textPreview: "PDF processado, mas não foi possível extrair prévia do texto (pode ser um PDF escaneado)",
          fullText: ""
        }));
        toast.info("PDF carregado, mas não contém texto extraível");
      } else {
        // Mostrar as primeiras 300 palavras
        const words = extractedText.split(/\s+/);
        const preview = words.slice(0, 300).join(" ") + (words.length > 300 ? "..." : "");
        
        setUploadState(prev => ({
          ...prev,
          isLoading: false,
          textPreview: preview,
          fullText: extractedText
        }));
        
        toast.success("PDF processado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao processar PDF:", error);
      
      let errorMessage = "Erro ao processar o arquivo PDF.";
      
      if (error.message?.includes("Invalid PDF")) {
        errorMessage = "PDF corrompido ou inválido. Tente outro arquivo.";
      } else if (error.message?.includes("Password")) {
        errorMessage = "PDF protegido por senha. Remova a proteção e tente novamente.";
      } else if (error.message?.includes("worker") || error.message?.includes("Setting up fake worker")) {
        errorMessage = "Erro no processador PDF. Tente recarregar a página.";
      }
      
      setUploadState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
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

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.fullText) return;

    // Verificar se tem API key
    if (!openaiService.hasApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

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

  const handleApiKeySet = (key: string) => {
    openaiService.setApiKey(key);
    handleAnalyze();
  };

  const handleNewAnalysis = () => {
    setUploadState(prev => ({
      ...prev,
      analysisResult: null,
      error: null
    }));
  };

  const resetUpload = () => {
    setUploadState({
      file: null,
      isLoading: false,
      textPreview: "",
      error: null,
      isAnalyzing: false,
      analysisResult: null,
      fullText: ""
    });
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-xl flex items-center justify-between">
            Análise de Contrato
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeyModal(true)}
              className="text-white hover:bg-slate-600"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
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
                <p className="text-blue-600 mb-2">Extraindo texto do PDF...</p>
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

          {/* Status da API Key */}
          {!openaiService.hasApiKey() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configure sua API key da OpenAI para realizar análises inteligentes.
                <Button 
                  variant="link" 
                  className="ml-2 p-0 h-auto"
                  onClick={() => setShowApiKeyModal(true)}
                >
                  Configurar agora
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Botão de Análise */}
          <Button
            onClick={handleAnalyze}
            disabled={!uploadState.file || uploadState.isLoading || uploadState.isAnalyzing || !uploadState.fullText}
            className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300"
          >
            {uploadState.isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              "Analisar Contrato"
            )}
          </Button>

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

      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onApiKeySet={handleApiKeySet}
      />
    </>
  );
};

export default ContractAnalysisSection;
