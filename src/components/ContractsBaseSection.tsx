
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Calendar, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddContractModal from './AddContractModal';
import ContractPreviewModal from './ContractPreviewModal';
import DeleteContractDialog from './DeleteContractDialog';
import AnimatedCard from './AnimatedCard';
import InteractiveButton from './InteractiveButton';
import { useBaseContracts } from '@/hooks/useBaseContracts';
import { BaseContract } from '@/services/contractService';

const ContractsBaseSection = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewContract, setPreviewContract] = useState<any>(null);
  const [contractToDelete, setContractToDelete] = useState<BaseContract | null>(null);
  const [isDeletingContract, setIsDeletingContract] = useState(false);
  const { contracts, isLoading, error, refetch, addMultipleContracts, deleteContract } = useBaseContracts();

  const handleContractAdded = () => {
    refetch();
    toast.success("Contrato base adicionado com sucesso!");
  };

  const handlePreview = (contract: any) => {
    setPreviewContract(contract);
  };

  const handleDeleteClick = (contract: BaseContract, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir abertura do preview
    setContractToDelete(contract);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    setIsDeletingContract(true);
    const success = await deleteContract(contractToDelete.id);
    setIsDeletingContract(false);
    
    if (success) {
      setContractToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeletingContract) {
      setContractToDelete(null);
    }
  };

  if (error) {
    return (
      <AnimatedCard className="border-destructive bg-destructive/5">
        <div className="text-center p-4">
          <p className="text-destructive">Erro ao carregar contratos base</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard 
        className="h-fit shadow-sm border-border bg-card hover:shadow-lift transition-all duration-300"
        hoverEffect="lift"
      >
        <div className="bg-primary text-primary-foreground rounded-t-lg p-6 -m-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Contratos Base</h2>
                <p className="text-sm opacity-90">
                  ({contracts?.length || 0}) contratos disponíveis
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                    <div className="h-10 w-10 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : contracts && contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((contract, index) => (
                <div 
                  key={contract.id}
                  className="stagger-item group relative p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 cursor-pointer hover:shadow-sm"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handlePreview(contract)}
                >
                  {/* Botão de Delete */}
                  <button
                    onClick={(e) => handleDeleteClick(contract, e)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                    title="Remover contrato"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-3 pr-10">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
                          {contract.name || contract.original_filename || 'Contrato sem nome'}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-success/10 text-success border-success/20 hover:bg-success hover:text-success-foreground transition-colors duration-200"
                        >
                          auto_detected
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Adicionado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-success" />
                          <span className="text-success">Processado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/30 rounded-lg mb-4 inline-block">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                Nenhum contrato base encontrado
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <InteractiveButton
              onClick={() => setIsAddModalOpen(true)}
              className="w-full bg-background border border-border text-foreground hover:bg-accent hover:border-primary/50 transition-all duration-200"
              variant="outline"
              glowEffect={false}
              bounceOnClick={true}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novos Contratos Base
            </InteractiveButton>
          </div>
        </div>
      </AnimatedCard>

      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddContracts={addMultipleContracts}
      />

      <ContractPreviewModal
        isOpen={!!previewContract}
        onClose={() => setPreviewContract(null)}
        contractName={previewContract?.name || previewContract?.original_filename || 'Contrato'}
      />

      <DeleteContractDialog
        isOpen={!!contractToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        contract={contractToDelete}
        isDeleting={isDeletingContract}
      />
    </>
  );
};

export default ContractsBaseSection;
