
interface ErrorSummaryGridProps {
  resumo: {
    total_erros: number;
    criticos: number;
    altos: number;
    medios: number;
    baixos: number;
    plano_identificado?: string;
  };
}

const ErrorSummaryGrid = ({ resumo }: ErrorSummaryGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-gray-100 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-700">{resumo.total_erros}</div>
        <div className="text-sm text-gray-600">Total</div>
      </div>
      <div className="bg-red-100 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-red-700">{resumo.criticos}</div>
        <div className="text-sm text-red-600">Críticos</div>
      </div>
      <div className="bg-orange-100 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-orange-700">{resumo.altos}</div>
        <div className="text-sm text-orange-600">Altos</div>
      </div>
      <div className="bg-yellow-100 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-yellow-700">{resumo.medios}</div>
        <div className="text-sm text-yellow-600">Médios</div>
      </div>
      <div className="bg-blue-100 p-3 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-700">{resumo.baixos}</div>
        <div className="text-sm text-blue-600">Baixos</div>
      </div>
    </div>
  );
};

export default ErrorSummaryGrid;
