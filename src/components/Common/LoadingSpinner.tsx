import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = 'Processing payment...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 dark:border-primary-900 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
        </div>
      </div>
      {label && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 animate-pulse">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
