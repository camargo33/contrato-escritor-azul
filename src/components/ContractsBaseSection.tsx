
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import ContractPreviewModal from "./ContractPreviewModal";
import AddContractModal from "./AddContractModal";

const ContractsBaseSection = () => {
  const [baseContracts, setBaseContracts] = useState([
    "Contrato_Prestacao_Servicos_01.pdf",
    "Contrato_Compra_Venda_02.pdf",
    "Contrato_Locacao_Comercial_03.pdf",
    "Contrato_Sociedade_04.pdf",
    "Contrato_Consultoria_05.pdf",
    "Contrato_Fornecimento_06.pdf",
    "Contrato_Terceirizacao_07.pdf",
    "Contrato_Licenciamento_08.pdf",
    "Contrato_Distribuicao_09.pdf",
    "Contrato_Manutencao_10.pdf"
  ]);

  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleContractClick = (contractName: string) => {
    setSelectedContract(contractName);
    setIsPreviewModalOpen(true);
  };

  const handleAddContract = (contractName: string) => {
    setBaseContracts(prev => [...prev, contractName]);
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-xl">
            Contratos Base ({baseContracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {baseContracts.map((contract, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleContractClick(contract)}
              >
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="text-sm text-gray-700 truncate">
                  {contract}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full border-slate-600 text-slate-700 hover:bg-slate-50"
              onClick={() => setIsAddModalOpen(true)}
            >
              Adicionar Novo Contrato Base
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
        onAddContract={handleAddContract}
      />
    </>
  );
};

export default ContractsBaseSection;
