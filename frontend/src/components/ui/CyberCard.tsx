import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CyberCardProps extends HTMLMotionProps<"div"> {
    hover?: boolean;
    border?: boolean;
    children: React.ReactNode;
}

export function CyberCard({
    className,
    children,
    hover = false,
    border = true,
    ...props
}: CyberCardProps) {
    return (
        <motion.div
            whileHover={hover ? { y: -2, boxShadow: '0 10px 30px -10px rgba(0, 255, 157, 0.1)' } : undefined}
            className={cn(
                'relative bg-cyber-dark/80 backdrop-blur-sm p-6 overflow-hidden',
                border && 'border border-cyber-gray',
                className
            )}
            {...props}
        >
            {border && (
                <>
                    <div className="absolute top-0 left-0 w-20 h-[1px] bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent" />
                    <div className="absolute bottom-0 right-0 w-20 h-[1px] bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent" />
                </>
            )}
            <div className="relative z-10">
                {children}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 via-transparent to-cyber-secondary/5 pointer-events-none" />
        </motion.div>
    );
}
