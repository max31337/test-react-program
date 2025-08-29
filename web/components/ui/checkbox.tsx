"use client";
import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from './cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer select-none group">
        <span className="relative inline-flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            checked={!!checked}
            className={cn(
              'peer h-4 w-4 appearance-none rounded-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-sm transition-all',
              'checked:bg-blue-600 checked:border-blue-600 dark:checked:border-blue-500 dark:checked:bg-blue-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
