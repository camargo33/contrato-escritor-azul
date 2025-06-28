
import { useState, useEffect } from 'react';
import { contractService, BaseContract } from '@/services/contractService';
import { toast } from 'sonner';

export const useBaseContracts = () => {
  const [contracts, setContracts] = useState<BaseContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userContracts = await contractService.getUserBaseContracts();
      setContracts(userContracts);
    } catch (err) {
      console.error("Erro ao carregar contratos:", err);
      setError("Erro ao carregar contratos base");
      toast.error("Erro ao carregar contratos base");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = loadContracts;

  const addContract = async (file: File, contractData: {
    name: string;
    contract_type?: string;
    plan_name?: string;
  }) => {
    const result = await contractService.uploadBaseContract(file, contractData);
    
    if (result.success) {
      toast.success("Contrato adicionado com sucesso!");
      // Recarregar a lista
      await loadContracts();
      return true;
    } else {
      toast.error(result.error || "Erro ao adicionar contrato");
      return false;
    }
  };

  const addMultipleContracts = async (files: File[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const contractName = file.name.replace('.pdf', '');
      const result = await contractService.uploadBaseContract(file, {
        name: contractName,
        contract_type: 'auto_detected', // Será detectado automaticamente
      });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        console.error(`Erro ao adicionar ${file.name}:`, result.error);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} contrato(s) adicionado(s) com sucesso!`);
      await loadContracts();
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} contrato(s) falharam ao ser adicionados`);
    }

    return { successCount, errorCount };
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return {
    contracts,
    isLoading,
    error,
    refetch,
    loadContracts,
    addContract,
    addMultipleContracts
  };
};
