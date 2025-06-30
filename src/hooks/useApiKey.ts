
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      setIsLoading(true);
      // Simular verificação da API key (na prática, isso seria uma chamada para verificar se a key está configurada)
      // Por enquanto, assumimos que está configurada já que o usuário acabou de configurar
      setHasApiKey(true);
    } catch (error) {
      console.error('Erro ao verificar status da API key:', error);
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setApiKeyConfigured = (configured: boolean) => {
    setHasApiKey(configured);
  };

  return {
    hasApiKey,
    isLoading,
    checkApiKeyStatus,
    setApiKeyConfigured
  };
};
