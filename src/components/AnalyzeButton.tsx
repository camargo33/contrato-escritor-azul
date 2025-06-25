
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UploadState } from "@/hooks/useContractUpload";

interface AnalyzeButtonProps {
  uploadState: UploadState;
  onClick: () => void;
}

const AnalyzeButton = ({ uploadState, onClick }: AnalyzeButtonProps) => {
  return (
    <Button
      onClick={onClick}
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
  );
};

export default AnalyzeButton;
