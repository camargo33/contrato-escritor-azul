
import { CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";

interface AnalysisHeaderProps {
  timestamp: string;
  filename: string;
}

const AnalysisHeader = ({ timestamp, filename }: AnalysisHeaderProps) => {
  return (
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
  );
};

export default AnalysisHeader;
