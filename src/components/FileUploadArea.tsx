
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadState } from "@/hooks/useContractUpload";
import { processFile } from "@/services/pdfProcessor";

interface FileUploadAreaProps {
  uploadState: UploadState;
  setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
  onReset: () => void;
}

const FileUploadArea = ({ uploadState, setUploadState, onReset }: FileUploadAreaProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0], setUploadState);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0], setUploadState);
    }
  };

  return (
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
              onReset();
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
  );
};

export default FileUploadArea;
