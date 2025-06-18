
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContract: (contractName: string) => void;
}

const AddContractModal = ({ isOpen, onClose, onAddContract }: AddContractModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Por favor, selecione apenas arquivos PDF.";
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return "O arquivo deve ter no máximo 10MB.";
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Simular upload
    setTimeout(() => {
      onAddContract(selectedFile.name);
      toast.success("Contrato base adicionado com sucesso!");
      setIsUploading(false);
      setSelectedFile(null);
      setError(null);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Contrato Base</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Área de Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              error 
                ? "border-red-300 bg-red-50" 
                : selectedFile 
                  ? "border-green-300 bg-green-50" 
                  : "border-gray-300 hover:border-slate-400"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('contract-file-input')?.click()}
          >
            {selectedFile ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 text-sm mb-1">Arquivo selecionado:</p>
                <p className="text-sm font-medium text-slate-600">
                  {selectedFile.name}
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm mb-1">
                  Arraste um PDF aqui ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500">
                  Apenas PDFs até 10MB
                </p>
              </>
            )}
            
            <input
              id="contract-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
              disabled={!selectedFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractModal;
