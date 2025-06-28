
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

const FeedbackMessage = ({ type, title, message, className = '' }: FeedbackMessageProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    return type === 'error' ? 'destructive' : 'default';
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 [&>svg]:text-green-600';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 [&>svg]:text-red-600';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-600';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-600';
    }
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={`feedback-animate transition-all duration-250 ${getColorClasses()} ${className}`}
    >
      {getIcon()}
      {title && <AlertTitle className="font-medium">{title}</AlertTitle>}
      <AlertDescription className="text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default FeedbackMessage;
