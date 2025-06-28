
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface InteractiveButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  interactive?: boolean;
}

const InteractiveButton = ({ 
  children, 
  className, 
  loading = false,
  loadingText = 'Carregando...',
  interactive = true,
  disabled,
  ...props 
}: InteractiveButtonProps) => {
  return (
    <Button
      className={cn(
        'transition-all duration-200 focus-ring',
        interactive && 'hover-scale active:scale-95',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" text={loadingText} />
      ) : (
        children
      )}
    </Button>
  );
};

export default InteractiveButton;
