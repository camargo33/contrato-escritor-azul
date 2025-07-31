import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, XCircle, DollarSign, AlertTriangle } from "lucide-react";

interface TaxValidationData {
  fidelidade: string;
  valor_desconto_fidelidade?: string;
  
  taxa_instalacao_encontrada: string;
  taxa_instalacao_status: string;
  taxa_instalacao_explicacao: string;
  
  taxa_rescisao_esperada: string;
  taxa_rescisao_encontrada: string;
  taxa_rescisao_status: string;
  taxa_rescisao_explicacao: string;
}

interface TaxValidationCardProps {
  taxData: TaxValidationData;
}

const TaxValidationCard = ({ taxData }: TaxValidationCardProps) => {
  // Fallbacks para dados ausentes
  const fidelidade = taxData?.fidelidade || "Não identificado";
  const descontoFidelidade = taxData?.valor_desconto_fidelidade || "";
  const instalacaoEncontrada = taxData?.taxa_instalacao_encontrada || "Não identificado";
  const instalacaoStatus = taxData?.taxa_instalacao_status || "PENDENTE";
  const instalacaoExplicacao = taxData?.taxa_instalacao_explicacao || "Aguardando análise...";
  const rescisaoEncontrada = taxData?.taxa_rescisao_encontrada || "Não identificado";
  const rescisaoEsperada = taxData?.taxa_rescisao_esperada || "Não calculado";
  const rescisaoStatus = taxData?.taxa_rescisao_status || "PENDENTE";
  const rescisaoExplicacao = taxData?.taxa_rescisao_explicacao || "Aguardando análise...";

  const isFidelityYes = fidelidade === "SIM";
  const installationOk = instalacaoStatus === "CORRETO";
  const cancellationOk = rescisaoStatus === "CORRETO";
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-700">Validação de Taxas</h3>
      </div>
      
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Análise das Taxas de Instalação e Rescisão
            </span>
            <Badge variant={isFidelityYes ? "default" : "secondary"} className="bg-blue-600 text-white">
              Fidelidade: {fidelidade}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Desconto da Fidelidade (se aplicável) */}
          {isFidelityYes && descontoFidelidade && (
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">💰 Desconto da Fidelidade</div>
                <div className="text-3xl font-bold text-blue-600">{descontoFidelidade}</div>
                <div className="text-xs text-blue-600 mt-1">Este valor determina as taxas corretas</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Taxa de Instalação */}
            <Card className={`border-2 ${
              installationOk ? 'border-green-200 bg-green-50' : 
              instalacaoStatus === 'ERRO' ? 'border-red-200 bg-red-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {installationOk ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : instalacaoStatus === 'ERRO' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                  )}
                  Taxa de Instalação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    installationOk ? 'text-green-600' : 
                    instalacaoStatus === 'ERRO' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {instalacaoEncontrada}
                  </div>
                  <Badge 
                    variant={installationOk ? "default" : instalacaoStatus === 'ERRO' ? "destructive" : "secondary"}
                    className={`text-xs mt-1 ${
                      installationOk ? 'bg-green-600' : 
                      instalacaoStatus === 'ERRO' ? 'bg-red-600' : 
                      'bg-gray-600'
                    }`}
                  >
                    {instalacaoStatus}
                  </Badge>
                </div>
                
                <div className={`p-2 rounded text-xs border-l-2 ${
                  installationOk ? 'border-green-400 bg-green-100 text-green-800' : 
                  instalacaoStatus === 'ERRO' ? 'border-red-400 bg-red-100 text-red-800' : 
                  'border-gray-400 bg-gray-100 text-gray-800'
                }`}>
                  {instalacaoExplicacao}
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Rescisão */}
            <Card className={`border-2 ${
              cancellationOk ? 'border-green-200 bg-green-50' : 
              rescisaoStatus === 'ERRO' ? 'border-red-200 bg-red-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {cancellationOk ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : rescisaoStatus === 'ERRO' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                  )}
                  Taxa de Rescisão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    cancellationOk ? 'text-green-600' : 
                    rescisaoStatus === 'ERRO' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {rescisaoEncontrada}
                  </div>
                  <Badge 
                    variant={cancellationOk ? "default" : rescisaoStatus === 'ERRO' ? "destructive" : "secondary"}
                    className={`text-xs mt-1 ${
                      cancellationOk ? 'bg-green-600' : 
                      rescisaoStatus === 'ERRO' ? 'bg-red-600' : 
                      'bg-gray-600'
                    }`}
                  >
                    {rescisaoStatus}
                  </Badge>
                </div>
                
                {!cancellationOk && rescisaoEsperada && rescisaoEsperada !== "Não calculado" && (
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Valor Esperado:</div>
                    <div className="text-lg font-semibold text-blue-600">{rescisaoEsperada}</div>
                  </div>
                )}
                
                <div className={`p-2 rounded text-xs border-l-2 ${
                  cancellationOk ? 'border-green-400 bg-green-100 text-green-800' : 
                  rescisaoStatus === 'ERRO' ? 'border-red-400 bg-red-100 text-red-800' : 
                  'border-gray-400 bg-gray-100 text-gray-800'
                }`}>
                  {rescisaoExplicacao}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cálculo Visual (se há desconto) */}
          {isFidelityYes && descontoFidelidade && (
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">🧮 Cálculo da Fidelidade</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <div className="text-xs text-blue-600 mb-1">Valor Base</div>
                  <div className="font-bold text-blue-800">R$ 700,00</div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border">
                  <div className="text-xs text-purple-600 mb-1">Desconto</div>
                  <div className="font-bold text-purple-800">- {descontoFidelidade}</div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border">
                  <div className="text-xs text-green-600 mb-1">Taxa Instalação</div>
                  <div className="font-bold text-green-800">{instalacaoEncontrada}</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-center text-gray-600 bg-gray-50 p-2 rounded">
                💡 <strong>Lógica:</strong> R$ 700,00 - {descontoFidelidade} = {instalacaoEncontrada} (instalação)
                <br />
                🔄 <strong>Rescisão:</strong> {descontoFidelidade} (o desconto vira multa se cancelar)
              </div>
            </div>
          )}

          {/* Status Geral das Taxas */}
          <div className={`p-4 rounded-lg border-2 ${
            installationOk && cancellationOk ? 'border-green-300 bg-green-50' : 
            (instalacaoStatus === 'ERRO' || rescisaoStatus === 'ERRO') ? 'border-red-300 bg-red-50' :
            'border-orange-300 bg-orange-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {installationOk && cancellationOk ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (instalacaoStatus === 'ERRO' || rescisaoStatus === 'ERRO') ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              <span className={`font-medium ${
                installationOk && cancellationOk ? 'text-green-800' : 
                (instalacaoStatus === 'ERRO' || rescisaoStatus === 'ERRO') ? 'text-red-800' :
                'text-orange-800'
              }`}>
                Status das Taxas: {
                  installationOk && cancellationOk ? '✅ Todas Corretas' : 
                  (instalacaoStatus === 'ERRO' || rescisaoStatus === 'ERRO') ? '❌ Erros Encontrados' :
                  '⚠️ Aguardando Análise'
                }
              </span>
            </div>
            
            <div className={`text-sm ${
              installationOk && cancellationOk ? 'text-green-700' : 
              (instalacaoStatus === 'ERRO' || rescisaoStatus === 'ERRO') ? 'text-red-700' :
              'text-orange-700'
            }`}>
              {installationOk && cancellationOk ? (
                'Todas as taxas estão de acordo com a regra de fidelidade aplicada.'
              ) : (instalacaoStatus === 'ERRO' || rescisaoStatus === 'ERRO') ? (
                'Algumas taxas precisam ser corrigidas conforme indicado acima.'
              ) : (
                'Análise em andamento. Aguarde o processamento dos dados.'
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxValidationCard;