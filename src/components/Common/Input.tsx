import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  charCount?: number;
  maxChar?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, charCount, maxChar, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {label}
            </label>
          )}
          {maxChar !== undefined && charCount !== undefined && (
            <span className={`text-[11px] font-mono ${charCount > maxChar ? 'text-error font-bold' : 'text-slate-400'}`}>
              {charCount}/{maxChar}
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border text-sm rounded-lg transition-colors py-2.5 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-error focus:ring-2 focus:ring-error-500'
                : 'border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary-500/20'
            } ${className}`}
            {...props}
          />

          {rightIcon && <div className="absolute right-3 flex items-center">{rightIcon}</div>}
        </div>

        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
