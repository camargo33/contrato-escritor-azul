
import { UploadState } from "@/hooks/useContractUpload";
import LoadingSpinner from "./LoadingSpinner";
import InteractiveButton from "./InteractiveButton";

interface AnalyzeButtonProps {
  uploadState: UploadState;
  onClick: () => void;
}

const AnalyzeButton = ({ uploadState, onClick }: AnalyzeButtonProps) => {
  return (
    <InteractiveButton
      onClick={onClick}
      disabled={!uploadState.file || uploadState.isLoading || uploadState.isAnalyzing || !uploadState.fullText}
      className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-gray-300"
      loading={uploadState.isAnalyzing}
      loadingText="Analisando com IA..."
      glowEffect={true}
      bounceOnClick={true}
      variant="default"
    >
      {!uploadState.isAnalyzing && "Analisar Contrato"}
    </InteractiveButton>
  );
};

export default AnalyzeButton;
