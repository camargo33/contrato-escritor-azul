
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: 'aprovado' | 'aprovado_com_restricoes' | 'reprovado';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'aprovado_com_restricoes':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'reprovado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="mb-6">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border ${getStatusColor(status)}`}>
        {status === 'aprovado' ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
        Status: {status.replace('_', ' ').toUpperCase()}
      </div>
    </div>
  );
};

export default StatusBadge;
