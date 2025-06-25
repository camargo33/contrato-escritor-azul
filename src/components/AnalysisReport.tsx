
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
    // Conta quantos erros foram encontrados baseado em padrões mais específicos
    const errorPatterns = [
      /\d+\.\s*(.+)$/gm, // Itens numerados
      /[-•]\s*(.+)$/gm,  // Itens com bullets
      /erro/gi,
      /incorreto/gi,
      /faltando/gi,
      /inconsistente/gi,
      /problema/gi
    ];
    
    let errorCount = 0;
    errorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        errorCount += matches.length;
      }
    });

    // Se não encontrou erros pelos padrões, verifica se contém palavras indicativas
    if (errorCount === 0 && (content.toLowerCase().includes('erro') || content.toLowerCase().includes('incorreto'))) {
      errorCount = 1; // Pelo menos um erro foi detectado
    }

    return { errorCount, fullContent: content };
  };

  const { errorCount, fullContent } = parseAnalysisContent(content);

  const formatContent = (text: string) => {
    // Quebra o texto em linhas e formata melhor
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      // Verifica se é um título ou seção
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <h4 key={index} className="text-lg font-semibold text-slate-700 mt-4 mb-2">
            {trimmedLine.replace(/\*\*/g, '')}
          </h4>
        );
      }
      
      // Verifica se é um item numerado
      if (/^\d+\./.test(trimmedLine)) {
        return (
          <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 mb-2 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700 font-medium">{trimmedLine}</p>
            </div>
          </div>
        );
      }
      
      // Verifica se é um item com bullet
      if (/^[-•]/.test(trimmedLine)) {
        return (
          <div key={index} className="ml-4 mb-1">
            <p className="text-gray-700">{trimmedLine}</p>
          </div>
        );
      }
      
      // Linha normal
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
          {trimmedLine}
        </p>
      );
    }).filter(Boolean);
  };

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
              : `Análise concluída - Verificar pontos destacados`
            }
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Resultado da Análise:
          </h3>
          
          <div className="space-y-3">
            {formatContent(fullContent)}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <div className={`text-lg font-bold ${
              errorCount === 0 ? 'text-green-600' : 'text-slate-600'
            }`}>
              Status: {errorCount === 0 
                ? 'Contrato aprovado sem erros' 
                : 'Análise concluída'
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
