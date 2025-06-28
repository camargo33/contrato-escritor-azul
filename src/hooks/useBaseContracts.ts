
import { useState, useEffect } from 'react';
import { contractService, BaseContract } from '@/services/contractService';
import { toast } from 'sonner';

export const useBaseContracts = () => {
  const [contracts, setContracts] = useState<BaseContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async () => {
    try {
      console.log("Carregando contratos...");
      setIsLoading(true);
      setError(null);
      const userContracts = await contractService.getUserBaseContracts();
      console.log("Contratos carregados:", userContracts);
      setContracts(userContracts);
    } catch (err: any) {
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
    console.log("Adicionando contrato individual:", file.name, contractData);
    const result = await contractService.uploadBaseContract(file, contractData);
    
    if (result.success) {
      toast.success("Contrato adicionado com sucesso!");
      // Recarregar a lista
      await loadContracts();
      return true;
    } else {
      console.error("Erro ao adicionar contrato:", result.error);
      toast.error(result.error || "Erro ao adicionar contrato");
      return false;
    }
  };

  const addMultipleContracts = async (files: File[]) => {
    console.log("Adicionando múltiplos contratos:", files.length);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const file of files) {
      console.log("Processando arquivo:", file.name);
      
      const contractName = file.name.replace('.pdf', '');
      const result = await contractService.uploadBaseContract(file, {
        name: contractName,
        contract_type: 'auto_detected', // Será detectado automaticamente
      });

      if (result.success) {
        successCount++;
        console.log(`Sucesso: ${file.name}`);
      } else {
        errorCount++;
        const errorMsg = `${file.name}: ${result.error}`;
        errors.push(errorMsg);
        console.error(`Erro ao adicionar ${file.name}:`, result.error);
      }
    }

    // Mostrar resultados
    if (successCount > 0) {
      toast.success(`${successCount} contrato(s) adicionado(s) com sucesso!`);
      await loadContracts();
    }

    if (errorCount > 0) {
      console.error("Erros no upload:", errors);
      toast.error(`${errorCount} contrato(s) falharam ao ser adicionados`);
      // Mostrar detalhes dos erros no console para debug
      errors.forEach(error => console.error("Erro detalhado:", error));
    }

    return { successCount, errorCount };
  };

  const deleteContract = async (contractId: string) => {
    console.log("Removendo contrato:", contractId);
    const result = await contractService.deleteBaseContract(contractId);
    
    if (result.success) {
      toast.success("Contrato removido com sucesso!");
      // Remover da lista local imediatamente para melhor UX
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
      // Recarregar a lista para garantir consistência
      await loadContracts();
      return true;
    } else {
      console.error("Erro ao remover contrato:", result.error);
      toast.error(result.error || "Erro ao remover contrato");
      return false;
    }
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
    addMultipleContracts,
    deleteContract
  };
};
