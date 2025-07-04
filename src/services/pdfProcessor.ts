
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";

// Configure PDF.js worker usando uma URL que funciona com Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

console.log("PDF.js worker configurado para versão:", pdfjsLib.version);

export const validateFile = (file: File): string | null => {
  console.log("Validando arquivo:", file.name, "Tamanho:", file.size, "bytes");
  
  if (file.type !== "application/pdf") {
    return "Por favor, selecione apenas arquivos PDF.";
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB
    return "O arquivo deve ter no máximo 10MB.";
  }
  return null;
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
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
          disableFontFace: false,
          verbosity: 0
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
        
        console.log("Texto completo extraído. Total de caracteres:", fullText.length);
        
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

export const processFile = async (
  file: File,
  setUploadState: React.Dispatch<React.SetStateAction<any>>,
  onAnalyzeCallback?: () => void
) => {
  const validationError = validateFile(file);
  if (validationError) {
    setUploadState((prev: any) => ({ ...prev, error: validationError }));
    toast.error(validationError);
    return;
  }

  setUploadState((prev: any) => ({
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
      setUploadState((prev: any) => ({
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
      
      setUploadState((prev: any) => ({
        ...prev,
        isLoading: false,
        textPreview: preview,
        fullText: extractedText
      }));
      
      toast.success("PDF processado com sucesso!");
      
      // Chamar análise automática se callback foi fornecido
      if (onAnalyzeCallback) {
        setTimeout(() => {
          onAnalyzeCallback();
        }, 500); // Pequeno delay para melhor UX
      }
    }
  } catch (error: any) {
    console.error("Erro ao processar PDF:", error);
    
    let errorMessage = "Erro ao processar o arquivo PDF.";
    
    if (error.message?.includes("Invalid PDF")) {
      errorMessage = "PDF corrompido ou inválido. Tente outro arquivo.";
    } else if (error.message?.includes("Password")) {
      errorMessage = "PDF protegido por senha. Remova a proteção e tente novamente.";
    } else if (error.message?.includes("worker") || error.message?.includes("CORS")) {
      errorMessage = "Erro de configuração do processador PDF. Tente recarregar a página.";
    }
    
    setUploadState((prev: any) => ({
      ...prev,
      isLoading: false,
      error: errorMessage
    }));
    toast.error(errorMessage);
  }
};
