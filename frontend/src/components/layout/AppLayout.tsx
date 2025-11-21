import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, LayoutDashboard, Hash, LogOut, Settings, Bot, Cpu } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Hash, label: 'Channels', path: '/channels' },
        { icon: Bot, label: 'AI Assistants', path: '/chatbots' },
        { icon: Settings, label: 'Settings', path: '/settings' }, // Placeholder
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-cyber-black overflow-hidden selection:bg-cyber-primary/30 selection:text-cyber-primary">
            {/* Scanline Overlay */}
            <div className="scanline-overlay" />

            {/* Sidebar */}
            <aside className="w-64 bg-cyber-dark border-r border-cyber-gray flex flex-col relative z-20">
                <div className="p-6 border-b border-cyber-gray">
                    <div className="flex items-center gap-3 text-cyber-primary">
                        <Terminal className="w-6 h-6" />
                        <span className="font-mono font-bold tracking-wider">DEV.TERM</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 font-mono">
                        v2.0.45 [STABLE]
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 font-mono text-sm group relative overflow-hidden',
                                    isActive
                                        ? 'text-cyber-black bg-cyber-primary font-bold'
                                        : 'text-gray-400 hover:text-cyber-primary hover:bg-cyber-primary/10'
                                )}
                            >
                                <Icon className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-cyber-primary"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-cyber-gray">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded bg-cyber-gray flex items-center justify-center text-cyber-primary font-mono font-bold border border-cyber-primary/30">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-cyber-primary truncate">Online</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-cyber-danger hover:bg-cyber-danger/10 rounded transition-colors font-mono text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Header Bar */}
                <header className="h-16 border-b border-cyber-gray bg-cyber-dark/50 backdrop-blur flex items-center justify-between px-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                            <Cpu className="w-4 h-4" />
                            <span>SYS.CPU: 12%</span>
                            <span className="mx-2">|</span>
                            <span>MEM: 45%</span>
                        </div>
                    </div>
                    <div className="text-xs font-mono text-cyber-primary animate-pulse">
                        SYSTEM SECURE
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6 relative z-10">
                    {children}
                </div>

                {/* Background Grid Animation */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </main>
        </div>
    );
}
