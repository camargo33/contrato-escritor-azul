import { AlertTriangle, Info } from "lucide-react";

interface AlertItem {
  tipo: 'campo_vazio' | 'erro_digitacao' | 'formato_invalido';
  campo: string;
  valor_encontrado: string;
  sugestao: string;
}

interface AlertListCardProps {
  alertas: AlertItem[];
}

const AlertListCard = ({ alertas }: AlertListCardProps) => {
  if (!alertas || alertas.length === 0) {
    return null;
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'campo_vazio':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'erro_digitacao':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'formato_invalido':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'campo_vazio':
        return 'border-l-blue-400 bg-blue-50';
      case 'erro_digitacao':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'formato_invalido':
        return 'border-l-orange-400 bg-orange-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
        Alertas Detectados ({alertas.length}):
      </h3>
      
      {alertas.map((alerta, index) => (
        <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alerta.tipo)}`}>
          <div className="flex items-start gap-3">
            {getAlertIcon(alerta.tipo)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-800">{alerta.campo}</span>
                <span className="text-xs px-2 py-1 bg-white rounded text-gray-600 border">
                  {alerta.tipo.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Encontrado:</span>
                  <span className="ml-2 text-gray-800">
                    {alerta.valor_encontrado || '(vazio)'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sugestão:</span>
                  <span className="ml-2 text-gray-800">{alerta.sugestao}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertListCard;