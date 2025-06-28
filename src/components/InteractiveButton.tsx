
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface InteractiveButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  interactive?: boolean;
  glowEffect?: boolean;
  bounceOnClick?: boolean;
}

const InteractiveButton = ({ 
  children, 
  className, 
  loading = false,
  loadingText = 'Carregando...',
  interactive = true,
  glowEffect = false,
  bounceOnClick = false,
  disabled,
  onClick,
  ...props 
}: InteractiveButtonProps) => {
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (bounceOnClick && !disabled && !loading) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 600);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      className={cn(
        'transition-all duration-200 focus-ring',
        interactive && 'hover-scale press-effect',
        glowEffect && 'hover-glow',
        isClicked && 'bounce-subtle',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
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
