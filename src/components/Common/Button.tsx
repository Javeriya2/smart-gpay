import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 rounded-lg gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 min-h-[52px]',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98]',
    tertiary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-200 active:scale-[0.98]',
    outline: 'border-2 border-primary text-primary hover:bg-primary-50 dark:hover:bg-primary-950/40 active:scale-[0.98]',
    danger: 'bg-error hover:bg-error-600 text-white shadow-md active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300',
  };

  return (
   <button
  type="button"
  className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
