import { AlertTriangle, Info } from "lucide-react";

interface AlertItem {
  tipo: 'campo_vazio' | 'erro_digitacao' | 'formato_invalido' | 'valor_suspeito';
  campo: string;
  valor_encontrado: string;
  sugestao: string;
}

interface AlertListCardProps {
  alertas: AlertItem[];
}

const AlertListCard = ({ alertas }: AlertListCardProps) => {
  // Função para verificar se é realmente um alerta válido
  const isValidAlert = (alerta: AlertItem): boolean => {
    const valorEncontrado = alerta.valor_encontrado?.trim() || '';
    const campo = alerta.campo?.toLowerCase() || '';
    
    // Se o campo está preenchido corretamente, não é um alerta real
    if (campo.includes('nome') && valorEncontrado && valorEncontrado !== '(vazio)') {
      return false;
    }
    
    // Telefone no formato correto não é alerta
    if (campo.includes('telefone') || campo.includes('celular')) {
      const telefoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
      if (telefoneRegex.test(valorEncontrado.replace(/\s/g, ''))) {
        return false;
      }
    }
    
    // CPF no formato correto não é alerta
    if (campo.includes('cpf')) {
      const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
      if (cpfRegex.test(valorEncontrado.replace(/\s/g, ''))) {
        return false;
      }
    }
    
    // E-mail válido não é alerta
    if (campo.includes('email') || campo.includes('e-mail')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(valorEncontrado)) {
        return false;
      }
    }
    
    // Outros campos: se não estão vazios e não são suspeitos, não são alertas
    if (valorEncontrado && valorEncontrado !== '(vazio)' && alerta.tipo === 'campo_vazio') {
      return false;
    }
    
    return true;
  };

  // Filtrar apenas alertas reais
  const alertasReais = alertas?.filter(isValidAlert) || [];

  if (alertasReais.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Nenhum alerta foi detectado
            </h3>
            <p className="text-green-600 text-sm">
              Todos os campos estão dentro do padrão esperado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'campo_vazio':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'erro_digitacao':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'formato_invalido':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'valor_suspeito':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
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
      case 'valor_suspeito':
        return 'border-l-red-400 bg-red-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
        Alertas Detectados ({alertasReais.length}):
      </h3>
      
      {alertasReais.map((alerta, index) => (
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