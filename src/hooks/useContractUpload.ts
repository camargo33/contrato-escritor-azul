
import { useState } from 'react';

export interface UploadState {
  file: File | null;
  isLoading: boolean;
  textPreview: string;
  error: string | null;
  isAnalyzing: boolean;
  analysisResult: any;
  fullText: string;
}

export const useContractUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isLoading: false,
    textPreview: "",
    error: null,
    isAnalyzing: false,
    analysisResult: null,
    fullText: ""
  });

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

  const handleNewAnalysis = () => {
    setUploadState(prev => ({
      ...prev,
      analysisResult: null,
      error: null
    }));
  };

  return {
    uploadState,
    setUploadState,
    resetUpload,
    handleNewAnalysis
  };
};
