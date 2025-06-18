
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

const ContractAnalysisSection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      // Simulação de análise
      setAnalysisResult("Análise concluída! Contrato analisado com sucesso. Nenhum erro ortográfico encontrado.");
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="bg-slate-700 text-white">
        <CardTitle className="text-xl">Análise de Contrato</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Área de Upload */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Arraste seu contrato aqui ou clique para selecionar
          </p>
          {selectedFile && (
            <p className="text-sm text-slate-600 font-medium">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Botão de Análise */}
        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile}
          className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300"
        >
          Analisar Contrato
        </Button>

        {/* Resultado da Análise */}
        {analysisResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysisResult}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractAnalysisSection;
