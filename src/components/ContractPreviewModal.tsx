
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractName: string;
}

const ContractPreviewModal = ({ isOpen, onClose, contractName }: ContractPreviewModalProps) => {
  const sampleText = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Entre as partes:

CONTRATANTE: [Nome da Empresa], pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/XXXX-XX, com sede na [Endereço completo].

CONTRATADO: [Nome do Prestador], pessoa física/jurídica, inscrita no CPF/CNPJ sob o nº XXX.XXX.XXX-XX, residente/estabelecido na [Endereço completo].

As partes acima qualificadas acordam e ajustam o presente contrato, que se regerá pelas seguintes cláusulas e condições:

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de [descrição dos serviços], conforme especificações técnicas em anexo.

CLÁUSULA 2ª - DO PRAZO
O prazo para execução dos serviços será de [número] ([número por extenso]) dias, contados a partir da assinatura deste contrato.

CLÁUSULA 3ª - DO VALOR E FORMA DE PAGAMENTO
Pelo serviço objeto deste contrato, o CONTRATANTE pagará ao CONTRATADO o valor total de R$ [valor] ([valor por extenso]), a ser pago em [forma de pagamento].

Este é um exemplo de texto que seria extraído do PDF do contrato base selecionado.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview do Contrato Base: {contractName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {sampleText}
            </pre>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Este é um exemplo de preview do contrato base. Em uma implementação real, 
            o texto seria extraído do arquivo PDF correspondente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreviewModal;
