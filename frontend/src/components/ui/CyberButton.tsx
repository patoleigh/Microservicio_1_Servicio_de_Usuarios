import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CyberButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    glitch?: boolean;
    children: React.ReactNode;
}

export function CyberButton({
    className,
    variant = 'primary',
    size = 'md',
    glitch = true,
    children,
    ...props
}: CyberButtonProps) {
    const variants = {
        primary: 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/50 hover:bg-cyber-primary/20 hover:border-cyber-primary hover:shadow-[0_0_10px_rgba(0,255,157,0.5)]',
        secondary: 'bg-cyber-secondary/10 text-cyber-secondary border-cyber-secondary/50 hover:bg-cyber-secondary/20 hover:border-cyber-secondary hover:shadow-[0_0_10px_rgba(0,210,255,0.5)]',
        danger: 'bg-cyber-danger/10 text-cyber-danger border-cyber-danger/50 hover:bg-cyber-danger/20 hover:border-cyber-danger hover:shadow-[0_0_10px_rgba(255,51,51,0.5)]',
        ghost: 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-6 py-2 text-sm',
        lg: 'px-8 py-3 text-base',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'relative group border transition-all duration-200 font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {glitch && (
                <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch pointer-events-none mix-blend-overlay" />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
            {variant !== 'ghost' && (
                <>
                    <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
                </>
            )}
        </motion.button>
    );
}
