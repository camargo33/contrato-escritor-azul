
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  width?: 'full' | 'half' | 'quarter' | 'three-quarters';
}

const LoadingSkeleton = ({ className, lines = 1, width = 'full' }: LoadingSkeletonProps) => {
  const widthClasses = {
    full: 'w-full',
    half: 'w-1/2',
    quarter: 'w-1/4',
    'three-quarters': 'w-3/4'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 loading-shimmer rounded',
            widthClasses[width],
            index === lines - 1 && lines > 1 && 'w-2/3' // última linha menor
          )}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
