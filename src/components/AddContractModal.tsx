
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContracts: (files: File[]) => Promise<{ successCount: number; errorCount: number }>;
}

const AddContractModal = ({ isOpen, onClose, onAddContracts }: AddContractModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    console.log("Validando arquivo:", file.name, "Tipo:", file.type, "Tamanho:", file.size);
    
    if (file.type !== "application/pdf") {
      return `${file.name}: Por favor, selecione apenas arquivos PDF.`;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return `${file.name}: O arquivo deve ter no máximo 10MB.`;
    }
    if (file.size === 0) {
      return `${file.name}: Arquivo vazio não é permitido.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log("Arquivos selecionados:", files.length);
    
    if (files.length > 0) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        console.log("Processando arquivo:", file.name);
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
        toast.error(`${errors.length} arquivo(s) com erro`);
      } else {
        setError(null);
      }

      setSelectedFiles(prev => {
        // Evitar duplicatas
        const newFiles = validFiles.filter(newFile => 
          !prev.some(existingFile => 
            existingFile.name === newFile.name && existingFile.size === newFile.size
          )
        );
        return [...prev, ...newFiles];
      });
    }
    
    // Limpar o input para permitir reselecionar o mesmo arquivo
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    console.log("Arquivos arrastados:", files.length);
    
    if (files.length > 0) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
        toast.error(`${errors.length} arquivo(s) com erro`);
      } else {
        setError(null);
      }

      setSelectedFiles(prev => {
        // Evitar duplicatas
        const newFiles = validFiles.filter(newFile => 
          !prev.some(existingFile => 
            existingFile.name === newFile.name && existingFile.size === newFile.size
          )
        );
        return [...prev, ...newFiles];
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo");
      return;
    }

    console.log("Iniciando upload de", selectedFiles.length, "arquivos");
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await onAddContracts(selectedFiles);
      console.log("Resultado do upload:", result);
      
      if (result.successCount > 0) {
        setSelectedFiles([]);
        setError(null);
        onClose();
      }
      
      // Se todos falharam, mostrar erro específico
      if (result.successCount === 0 && result.errorCount > 0) {
        setError("Nenhum arquivo foi enviado com sucesso. Verifique se o bucket de armazenamento está configurado corretamente.");
      }
    } catch (error: any) {
      console.error("Erro no upload:", error);
      const errorMessage = error.message?.includes('Bucket not found') 
        ? "Bucket de armazenamento não configurado. Entre em contato com o administrador."
        : `Erro inesperado no upload: ${error.message || 'Erro desconhecido'}`;
      setError(errorMessage);
      toast.error("Erro inesperado no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Contratos Base</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Área de Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isUploading
                ? "border-blue-300 bg-blue-50 cursor-not-allowed"
                : error 
                  ? "border-red-300 bg-red-50" 
                  : selectedFiles.length > 0
                    ? "border-green-300 bg-green-50" 
                    : "border-gray-300 hover:border-slate-400"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && document.getElementById('contract-file-input')?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-blue-600 text-sm mb-1">
                  Enviando arquivos...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm mb-1">
                  Arraste PDFs aqui ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500">
                  Selecione múltiplos PDFs (até 10MB cada)
                </p>
              </>
            )}
            
            <input
              id="contract-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              multiple
              disabled={isUploading}
            />
          </div>

          {/* Lista de Arquivos Selecionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Arquivos selecionados ({selectedFiles.length}):
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({Math.round(file.size / 1024)}KB)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                `Adicionar ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractModal;
