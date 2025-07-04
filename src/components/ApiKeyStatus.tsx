
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Settings, CheckCircle, AlertCircle } from "lucide-react";
import ApiKeyModal from "./ApiKeyModal";
import { useApiKey } from "@/hooks/useApiKey";

interface ApiKeyStatusProps {
  className?: string;
}

const ApiKeyStatus = ({ className }: ApiKeyStatusProps) => {
  const [showModal, setShowModal] = useState(false);
  const { hasApiKey, isLoading } = useApiKey();

  if (isLoading) {
    return (
      <div className={className}>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Key className="h-3 w-3" />
          Verificando...
        </Badge>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {hasApiKey ? (
          <Badge variant="default" className="bg-success text-white flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            API Configurada
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            API Não Configurada
          </Badge>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className="h-8"
        >
          <Settings className="h-3 w-3 mr-1" />
          Configurar
        </Button>
      </div>

      <ApiKeyModal
        open={showModal}
        onOpenChange={setShowModal}
        onApiKeySet={() => {
          // Em uma implementação real, isso atualizaria o status
          console.log('API key configurada');
        }}
      />
    </div>
  );
};

export default ApiKeyStatus;
