
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { BaseContract } from '@/services/contractService';

interface DeleteContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contract: BaseContract | null;
  isDeleting?: boolean;
}

const DeleteContractDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  contract, 
  isDeleting = false 
}: DeleteContractDialogProps) => {
  if (!contract) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md animate-scale-in">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-destructive">
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              Você tem certeza que deseja remover este contrato base?
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">
                {contract.name || contract.original_filename}
              </p>
              <p className="text-sm text-muted-foreground">
                Adicionado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <p className="text-sm text-destructive font-medium">
              ⚠️ Esta ação não pode ser desfeita
            </p>
            <p className="text-sm text-muted-foreground">
              O contrato e todas as suas cláusulas serão permanentemente removidos do sistema.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isDeleting}
            className="hover:bg-muted transition-colors duration-200"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Removendo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Confirmar Exclusão
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteContractDialog;
