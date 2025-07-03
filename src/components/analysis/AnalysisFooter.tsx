
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface AnalysisFooterProps {
  statusGeral?: string;
  errorCount: number;
  onNewAnalysis: () => void;
}

const AnalysisFooter = ({ statusGeral, errorCount, onNewAnalysis }: AnalysisFooterProps) => {
  return (
    <div className="mt-8 pt-6 border-t">
      <div className="flex justify-between items-center">
        <div className={`text-lg font-bold ${
          (statusGeral === 'aprovado' || errorCount === 0) ? 'text-green-600' : 'text-slate-600'
        }`}>
          Status: {statusGeral ? 
            statusGeral.replace('_', ' ') : 
            (errorCount === 0 ? 'Aprovado' : 'Análise concluída')
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
  );
};

export default AnalysisFooter;
