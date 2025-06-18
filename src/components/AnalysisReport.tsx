
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

interface AnalysisReportProps {
  content: string;
  timestamp: string;
  filename: string;
  onNewAnalysis: () => void;
}

const AnalysisReport = ({ content, timestamp, filename, onNewAnalysis }: AnalysisReportProps) => {
  const parseAnalysisContent = (content: string) => {
    const lines = content.split('\n');
    const errors: string[] = [];
    let errorCount = 0;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && (
        trimmedLine.match(/^\d+\./) || 
        trimmedLine.includes('erro') || 
        trimmedLine.includes('incorreto') ||
        trimmedLine.includes('faltando') ||
        trimmedLine.includes('inconsistent')
      )) {
        errors.push(trimmedLine);
        errorCount++;
      }
    });

    return { errors, errorCount, fullContent: content };
  };

  const { errors, errorCount, fullContent } = parseAnalysisContent(content);

  return (
    <Card className="mt-6 bg-white border-2">
      <CardHeader className="bg-slate-700 text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Relatório de Revisão Contratual - CIABRASNET
        </CardTitle>
        <div className="text-sm text-slate-200 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Análise realizada em: {timestamp}
          </div>
          <div>Arquivo: {filename}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            errorCount === 0 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {errorCount === 0 ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {errorCount === 0 
              ? 'Nenhum erro encontrado - Contrato aprovado!' 
              : `${errorCount} erro${errorCount > 1 ? 's' : ''} encontrado${errorCount > 1 ? 's' : ''}`
            }
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Resultado da Análise:
          </h3>
          
          {errors.length > 0 ? (
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-sm">
                {fullContent}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <div className={`text-lg font-bold ${
              errorCount === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Resumo: {errorCount === 0 
                ? 'Contrato aprovado sem erros' 
                : `${errorCount} erro${errorCount > 1 ? 's' : ''} encontrado${errorCount > 1 ? 's' : ''}`
              }
            </div>
            
            <Button 
              onClick={onNewAnalysis}
              className="bg-slate-700 hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Gerar Nova Análise
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisReport;
