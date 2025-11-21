import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export function TerminalInput({
    className,
    label,
    error,
    icon,
    ...props
}: TerminalInputProps) {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-xs font-mono text-cyber-primary uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-primary">
                    {icon || <span className="font-mono text-lg">{'>'}</span>}
                </div>
                <input
                    className={cn(
                        'w-full bg-cyber-black border border-cyber-gray text-white pl-10 pr-4 py-3 font-mono',
                        'focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary/50 focus:outline-none',
                        'placeholder-gray-600 transition-all duration-200',
                        error && 'border-cyber-danger focus:border-cyber-danger focus:ring-cyber-danger/50',
                        className
                    )}
                    autoComplete="off"
                    {...props}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyber-primary transition-all duration-300 group-focus-within:w-full" />
            </div>
            {error && (
                <p className="text-xs text-cyber-danger font-mono mt-1 animate-pulse">
                    [ERROR]: {error}
                </p>
            )}
        </div>
    );
}
