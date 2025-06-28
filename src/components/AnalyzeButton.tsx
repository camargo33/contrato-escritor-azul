
import { UploadState } from "@/hooks/useContractUpload";
import LoadingSpinner from "./LoadingSpinner";
import InteractiveButton from "./InteractiveButton";
import { Zap } from "lucide-react";

interface AnalyzeButtonProps {
  uploadState: UploadState;
  onClick: () => void;
}

const AnalyzeButton = ({ uploadState, onClick }: AnalyzeButtonProps) => {
  return (
    <InteractiveButton
      onClick={onClick}
      disabled={!uploadState.file || uploadState.isLoading || uploadState.isAnalyzing || !uploadState.fullText}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground shadow-sm hover:shadow-colored transition-all duration-200"
      loading={uploadState.isAnalyzing}
      loadingText="Analisando com IA..."
      glowEffect={true}
      bounceOnClick={true}
      variant="default"
    >
      {!uploadState.isAnalyzing && (
        <>
          <Zap className="h-4 w-4 mr-2" />
          Analisar Contrato
        </>
      )}
    </InteractiveButton>
  );
};

export default AnalyzeButton;
