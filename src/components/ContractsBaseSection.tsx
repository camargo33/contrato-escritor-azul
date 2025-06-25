
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Clock, CheckCircle } from "lucide-react";
import ContractPreviewModal from "./ContractPreviewModal";
import AddContractModal from "./AddContractModal";
import { useBaseContracts } from "@/hooks/useBaseContracts";
import { format } from "date-fns";

const ContractsBaseSection = () => {
  const { contracts, isLoading, addMultipleContracts } = useBaseContracts();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleContractClick = (contractName: string) => {
    setSelectedContract(contractName);
    setIsPreviewModalOpen(true);
  };

  const handleAddContracts = async (files: File[]) => {
    return await addMultipleContracts(files);
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-xl">Contratos Base</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <span className="ml-2 text-slate-600">Carregando contratos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-xl">
            Contratos Base ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Nenhum contrato base adicionado ainda.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Adicione seus contratos base para começar as análises comparativas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleContractClick(contract.name)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600" />
                    {contract.is_processed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {contract.name}
                      </span>
                      {contract.contract_type && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {contract.contract_type}
                        </span>
                      )}
                      {contract.plan_name && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {contract.plan_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Adicionado em {format(new Date(contract.upload_date), 'dd/MM/yyyy')}
                      {contract.is_processed ? (
                        <span className="text-green-600 ml-2">• Processado</span>
                      ) : (
                        <span className="text-yellow-600 ml-2">• Processando...</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full border-slate-600 text-slate-700 hover:bg-slate-50"
              onClick={() => setIsAddModalOpen(true)}
            >
              Adicionar Novos Contratos Base
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Preview */}
      <ContractPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        contractName={selectedContract || ""}
      />

      {/* Modal de Adicionar */}
      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddContracts={handleAddContracts}
      />
    </>
  );
};

export default ContractsBaseSection;
