import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";

// Configure PDF.js worker usando uma URL que funciona com Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

console.log("📄 PDF.js configurado - versão:", pdfjsLib.version);
console.log("🔧 Worker URL:", pdfjsLib.GlobalWorkerOptions.workerSrc);

export const validateFile = (file: File): string | null => {
  console.log("🔍 Validando arquivo:", {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    type: file.type
  });
  
  if (file.type !== "application/pdf") {
    return "❌ Por favor, selecione apenas arquivos PDF.";
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB
    return "❌ O arquivo deve ter no máximo 10MB.";
  }
  if (file.size < 1024) { // 1KB
    return "❌ Arquivo muito pequeno. Verifique se é um PDF válido.";
  }
  
  console.log("✅ Arquivo validado com sucesso");
  return null;
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log(`📄 Iniciando extração: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result as ArrayBuffer);
        console.log(`📊 Arquivo em memória: ${typedArray.length} bytes`);
        
        // Configuração robusta para PDF.js
        const loadingTask = pdfjsLib.getDocument({ 
          data: typedArray,
          useSystemFonts: true,
          disableFontFace: false,
          verbosity: 0, // Reduzir logs do PDF.js
          // Configurações para PDFs problemáticos
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
        });
        
        console.log("🔄 Processando PDF...");
        
        const pdf = await loadingTask.promise;
        console.log(`📖 PDF carregado - Páginas: ${pdf.numPages}`);
        
        if (pdf.numPages === 0) {
          resolve("PDF_NO_PAGES");
          return;
        }
        
        let fullText = "";
        let totalCharacters = 0;
        
        // Extrair texto de todas as páginas
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            console.log(`📄 Página ${i}/${pdf.numPages}...`);
            
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Extrair texto com melhor formatação
            const pageText = textContent.items
              .map((item: any) => {
                if (item.str) {
                  return item.str;
                }
                return '';
              })
              .filter(text => text.trim().length > 0)
              .join(' ')
              .replace(/\s+/g, ' ') // Normalizar espaços
              .trim();
            
            if (pageText.length > 0) {
              fullText += pageText + '\n';
              totalCharacters += pageText.length;
              console.log(`✅ Página ${i}: ${pageText.length} caracteres`);
            } else {
              console.log(`⚠️ Página ${i}: Sem texto`);
            }
            
          } catch (pageError) {
            console.warn(`❌ Erro página ${i}:`, pageError);
            // Continuar com as outras páginas
          }
        }
        
        // Limpar texto final
        fullText = fullText
          .replace(/\n+/g, '\n') // Normalizar quebras
          .replace(/\s+/g, ' ') // Normalizar espaços
          .trim();
        
        console.log(`📊 Extração concluída: ${fullText.length} caracteres`);
        console.log(`📝 Preview: "${fullText.substring(0, 100)}..."`);
        
        if (fullText.length === 0) {
          console.log("⚠️ Nenhum texto extraído");
          resolve("PDF_NO_TEXT");
        } else if (fullText.length < 50) {
          console.log("⚠️ Texto muito curto");
          resolve("PDF_SHORT_TEXT");
        } else {
          console.log("✅ Texto extraído com sucesso!");
          resolve(fullText);
        }
        
      } catch (error: any) {
        console.error("❌ Erro PDF.js:", error);
        
        // Identificar tipos específicos de erro
        if (error.name === 'InvalidPDFException') {
          reject(new Error("PDF inválido ou corrompido"));
        } else if (error.name === 'PasswordException') {
          reject(new Error("PDF protegido por senha"));
        } else if (error.name === 'MissingPDFException') {
          reject(new Error("Arquivo PDF não encontrado"));
        } else if (error.message?.includes('worker')) {
          reject(new Error("Erro de configuração do worker PDF.js"));
        } else {
          reject(new Error(`Erro ao processar PDF: ${error.message}`));
        }
      }
    };
    
    fileReader.onerror = () => {
      console.error("❌ Erro ao ler arquivo");
      reject(new Error("Erro ao ler o arquivo"));
    };
    
    console.log("📁 Iniciando leitura...");
    fileReader.readAsArrayBuffer(file);
  });
};

export const processFile = async (
  file: File,
  setUploadState: React.Dispatch<React.SetStateAction<any>>
) => {
  console.log("🚀 Processando:", file.name);
  
  // Reset estado
  setUploadState((prev: any) => ({
    ...prev,
    isLoading: false,
    error: null,
    textPreview: "",
    analysisResult: null,
    fullText: "",
    file: null
  }));

  // Validação
  const validationError = validateFile(file);
  if (validationError) {
    console.error("❌ Validação falhou:", validationError);
    setUploadState((prev: any) => ({ ...prev, error: validationError }));
    toast.error(validationError);
    return;
  }

  // Iniciar processamento
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
    console.log("⏳ Extraindo texto...");
    const extractedText = await extractTextFromPDF(file);
    
    if (extractedText === "PDF_NO_TEXT") {
      console.log("⚠️ PDF sem texto");
      setUploadState((prev: any) => ({
        ...prev,
        isLoading: false,
        textPreview: "⚠️ PDF sem texto extraível. Pode ser escaneado.",
        fullText: "",
        error: "PDF não contém texto extraível"
      }));
      toast.warning("PDF sem texto extraível");
      return;
      
    } else if (extractedText === "PDF_NO_PAGES") {
      console.log("❌ PDF sem páginas");
      setUploadState((prev: any) => ({
        ...prev,
        isLoading: false,
        error: "PDF vazio ou sem páginas"
      }));
      toast.error("PDF vazio");
      return;
      
    } else if (extractedText === "PDF_SHORT_TEXT") {
      console.log("⚠️ Texto muito curto");
      setUploadState((prev: any) => ({
        ...prev,
        isLoading: false,
        error: "Texto muito curto para análise"
      }));
      toast.warning("Texto muito curto");
      return;
    }

    // Sucesso - preparar preview
    const words = extractedText.split(/\s+/);
    const preview = words.slice(0, 300).join(" ") + (words.length > 300 ? "..." : "");
    
    console.log(`✅ Processamento OK: ${words.length} palavras`);
    
    setUploadState((prev: any) => ({
      ...prev,
      isLoading: false,
      textPreview: preview,
      fullText: extractedText,
      error: null
    }));
    
    toast.success(`✅ PDF processado! ${extractedText.length} caracteres extraídos.`);
    
  } catch (error: any) {
    console.error("❌ Erro ao processar:", error);
    
    let errorMessage = "Erro ao processar PDF.";
    
    if (error.message?.includes("inválido") || error.message?.includes("corrompido")) {
      errorMessage = "❌ PDF corrompido. Tente outro arquivo.";
    } else if (error.message?.includes("senha")) {
      errorMessage = "🔒 PDF protegido por senha.";
    } else if (error.message?.includes("worker")) {
      errorMessage = "⚙️ Erro de configuração. Recarregue a página.";
    } else if (error.message?.includes("timeout")) {
      errorMessage = "⏱️ Timeout. Tente arquivo menor.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setUploadState((prev: any) => ({
      ...prev,
      isLoading: false,
      error: errorMessage
    }));
    toast.error(errorMessage);
  }
};