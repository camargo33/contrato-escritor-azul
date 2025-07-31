import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, Info, Star } from "lucide-react";

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
  // Fallbacks para dados ausentes
  const opcaoFidelidade = fidelityData?.opcao_fidelidade || "Não identificado";
  const descontoExtraido = fidelityData?.valor_desconto_extraido || "";
  const textoOrigem = fidelityData?.texto_origem || "Não identificado";
  const marcacaoEncontrada = fidelityData?.marcacao_encontrada || "";
  const regraAplicada = fidelityData?.regra_aplicada || "";
  const secaoIgnorada = fidelityData?.secao_ignorada || "";

  const isFidelityYes = opcaoFidelidade === "SIM";
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Heart className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-slate-700">Análise da Fidelidade</h3>
      </div>
      
      <Card className={`border-2 ${isFidelityYes ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${isFidelityYes ? 'text-purple-600' : 'text-gray-600'}`} />
              Opção de Fidelidade Escolhida
            </span>
            <Badge 
              variant={isFidelityYes ? "default" : "secondary"} 
              className={`text-sm font-medium ${isFidelityYes ? 'bg-purple-600' : 'bg-gray-600'}`}
            >
              {opcaoFidelidade}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações da Escolha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Escolha Detectada */}
            <div className={`p-4 rounded-lg border ${isFidelityYes ? 'border-purple-200 bg-white' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Check className={`h-4 w-4 ${isFidelityYes ? 'text-purple-600' : 'text-gray-600'}`} />
                <span className="font-medium text-sm">Marcação Identificada</span>
              </div>
              <div className={`text-lg font-bold ${isFidelityYes ? 'text-purple-700' : 'text-gray-700'}`}>
                {marcacaoEncontrada || `${opcaoFidelidade} escolhido`}
              </div>
            </div>

            {/* Desconto (se aplicável) */}
            {isFidelityYes && descontoExtraido && (
              <div className="p-4 rounded-lg border border-purple-200 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Desconto Identificado</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {descontoExtraido}
                </div>
              </div>
            )}
          </div>

          {/* Texto de Origem (se disponível) */}
          {textoOrigem && textoOrigem !== "Não identificado" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-800">Texto Original Encontrado</span>
              </div>
              <div className="text-sm text-blue-700 italic">
                "{textoOrigem}"
              </div>
            </div>
          )}

          {/* Regra Aplicada */}
          {isFidelityYes ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800 mb-2">✅ Regra de Fidelidade Aplicada</div>
              <div className="text-sm text-green-700 space-y-1">
                <div>• Cliente optou pela fidelidade e receberá desconto na instalação</div>
                <div>• Em caso de cancelamento antecipado, deverá devolver o valor do desconto</div>
                {descontoExtraido && (
                  <div>• Desconto concedido: <strong>{descontoExtraido}</strong></div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-800 mb-2">ℹ️ Sem Fidelidade</div>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• Cliente optou por não aderir à fidelidade</div>
                <div>• Pagará o valor integral da taxa de instalação</div>
                <div>• Não há multa por cancelamento antecipado</div>
              </div>
            </div>
          )}

          {/* Seção Ignorada (se aplicável) */}
          {secaoIgnorada && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-sm text-orange-800">Informação Importante</span>
              </div>
              <div className="text-sm text-orange-700">
                {secaoIgnorada}
              </div>
            </div>
          )}

          {/* Status Visual */}
          <div className={`p-4 rounded-lg border-2 ${
            isFidelityYes ? 'border-purple-300 bg-purple-100' : 'border-gray-300 bg-gray-100'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isFidelityYes ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
              <span className={`font-medium ${isFidelityYes ? 'text-purple-800' : 'text-gray-800'}`}>
                {isFidelityYes ? 'Fidelidade Ativada' : 'Sem Fidelidade'}
              </span>
            </div>
            
            <div className={`text-sm mt-2 ${isFidelityYes ? 'text-purple-700' : 'text-gray-700'}`}>
              {isFidelityYes 
                ? 'O sistema aplicará as regras de desconto e multa rescisória automaticamente.'
                : 'O sistema aplicará os valores padrão sem desconto de fidelidade.'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FidelityAnalysisCard;