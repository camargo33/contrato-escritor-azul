
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  staggerIndex?: number;
}

const AnimatedCard = ({ 
  children, 
  title, 
  className, 
  hoverEffect = 'lift',
  staggerIndex 
}: AnimatedCardProps) => {
  const getHoverEffect = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover-lift';
      case 'scale':
        return 'hover-scale';
      case 'glow':
        return 'hover-glow';
      default:
        return '';
    }
  };

  const getStaggerClass = () => {
    if (staggerIndex !== undefined) {
      return 'stagger-item';
    }
    return 'animate-fade-in';
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-300 border-border bg-card shadow-sm',
        getHoverEffect(),
        getStaggerClass(),
        className
      )}
      style={staggerIndex !== undefined ? { animationDelay: `${staggerIndex * 0.1}s` } : undefined}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-subtitle text-card-foreground">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'p-6'}>
        {children}
      </CardContent>
    </Card>
  );
};

export default AnimatedCard;
