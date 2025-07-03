
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface ModeloIdentificado {
  nome: string;
  confianca: number;
  criterios_identificacao?: string[];
  caracteristicas_esperadas?: {
    valor?: string;
    tipo?: string;
    vigencia?: string;
    taxa_instalacao?: string;
    rescisao?: string;
  };
  observacao?: string;
}

interface ModelIdentificationCardProps {
  modelo: ModeloIdentificado;
}

const ModelIdentificationCard = ({ modelo }: ModelIdentificationCardProps) => {
  const getModeloConfidenceColor = (confianca: number) => {
    if (confianca >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (confianca >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-700">Modelo de Contrato Identificado</h3>
      </div>
      
      <div className={`p-4 rounded-lg border ${getModeloConfidenceColor(modelo.confianca)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-medium">
              {modelo.nome}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Confiança: {modelo.confianca}%
            </Badge>
          </div>
        </div>

        {modelo.criterios_identificacao && (
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700">Critérios de Identificação:</span>
            <ul className="mt-1 text-sm text-gray-600">
              {modelo.criterios_identificacao.map((criterio, index) => (
                <li key={index} className="ml-2">• {criterio}</li>
              ))}
            </ul>
          </div>
        )}

        {modelo.caracteristicas_esperadas && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {Object.entries(modelo.caracteristicas_esperadas).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="font-medium text-gray-700">{key.replace('_', ' ').toUpperCase()}:</span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        )}

        {modelo.observacao && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>Observação:</strong> {modelo.observacao}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelIdentificationCard;
