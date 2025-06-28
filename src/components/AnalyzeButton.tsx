
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UploadState } from "@/hooks/useContractUpload";
import LoadingSpinner from "./LoadingSpinner";

interface AnalyzeButtonProps {
  uploadState: UploadState;
  onClick: () => void;
}

const AnalyzeButton = ({ uploadState, onClick }: AnalyzeButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={!uploadState.file || uploadState.isLoading || uploadState.isAnalyzing || !uploadState.fullText}
      className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 transition-all duration-200 hover-scale active:scale-95 focus-ring"
    >
      {uploadState.isAnalyzing ? (
        <LoadingSpinner size="sm" text="Analisando com IA..." />
      ) : (
        "Analisar Contrato"
      )}
    </Button>
  );
};

export default AnalyzeButton;
