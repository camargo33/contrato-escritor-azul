import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Calculator } from "lucide-react";

interface FidelityAnalysisData {
  opcao_fidelidade: string;
  valor_desconto_extraido?: string;
  texto_origem?: string;
  regra_aplicada?: string;
  marcacao_encontrada?: string;
  secao_ignorada?: string;
}

interface FidelityAnalysisCardProps {
  fidelityData: FidelityAnalysisData;
}

const FidelityAnalysisCard = ({ fidelityData }: FidelityAnalysisCardProps) => {
  const isFidelityYes = fidelityData.opcao_fidelidade === "SIM";
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Users className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-slate-700">Análise da Fidelidade</h3>
      </div>
      
      <Card className={`border-2 ${isFidelityYes ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${isFidelityYes ? 'text-purple-600' : 'text-gray-600'}`} />
              Opção de Fidelidade
            </CardTitle>
            <Badge 
              variant={isFidelityYes ? "default" : "secondary"}
              className={`text-sm font-medium ${isFidelityYes ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'}`}
            >
              {fidelityData.opcao_fidelidade}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informação da Marcação */}
          {fidelityData.marcacao_encontrada && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Marcação Encontrada:</span>
              <span className={`font-mono text-sm px-2 py-1 rounded ${isFidelityYes ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                {fidelityData.marcacao_encontrada}
              </span>
            </div>
          )}

          {/* Valor do Desconto (se com fidelidade) */}
          {isFidelityYes && fidelityData.valor_desconto_extraido && (
            <div className="p-4 bg-white border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">Desconto da Fidelidade</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {fidelityData.valor_desconto_extraido}
              </div>
              {fidelityData.texto_origem && (
                <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded border-l-2 border-purple-300">
                  <strong>Origem:</strong> {fidelityData.texto_origem}
                </div>
              )}
            </div>
          )}

          {/* Regra Aplicada */}
          {fidelityData.regra_aplicada && (
            <div className={`p-3 rounded-lg border-l-4 ${isFidelityYes ? 'border-purple-400 bg-purple-50' : 'border-gray-400 bg-gray-50'}`}>
              <div className="font-medium text-gray-800 mb-1">Regra Aplicada:</div>
              <div className="text-sm text-gray-700">{fidelityData.regra_aplicada}</div>
            </div>
          )}

          {/* Seção Ignorada (informativo) */}
          {fidelityData.secao_ignorada && (
            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded border">
              <strong>ℹ️ Informação:</strong> {fidelityData.secao_ignorada}
            </div>
          )}

          {/* Explicação Visual */}
          <div className={`p-4 rounded-lg ${isFidelityYes ? 'bg-purple-100 border border-purple-200' : 'bg-gray-100 border border-gray-200'}`}>
            <div className="font-medium text-gray-800 mb-2">💡 Como funciona:</div>
            {isFidelityYes ? (
              <div className="text-sm text-gray-700 space-y-1">
                <div>• <strong>Taxa de Instalação:</strong> Qualquer valor é aceito (cliente ganhou desconto)</div>
                <div>• <strong>Taxa de Rescisão:</strong> Deve ser igual ao valor do desconto da fidelidade</div>
                <div>• <strong>Compromisso:</strong> Cliente fica fidelizado por 12 meses (PF) ou 24 meses (PJ)</div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-1">
                <div>• <strong>Taxa de Instalação:</strong> Deve ser R$ 700,00 (valor cheio)</div>
                <div>• <strong>Taxa de Rescisão:</strong> Deve ser R$ 0,00 (sem multa)</div>
                <div>• <strong>Liberdade:</strong> Cliente pode cancelar a qualquer momento</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FidelityAnalysisCard;