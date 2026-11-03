import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, FolderKanban, BarChart3, CalendarDays, Settings, LogOut, Menu, X, Sun, Moon, Wallet } from 'lucide-react';
import { PageProps } from '@/types';

export default function AppLayout({ children, title }: PropsWithChildren<{ title: string }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        if (user?.theme === 'dark') return true;
        if (user?.theme === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
        { name: 'Budgets', href: '/budgets', icon: PiggyBank },
        { name: 'Categories', href: '/categories', icon: FolderKanban },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Calendar', href: '/calendar', icon: CalendarDays },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-600 text-white"><Wallet className="w-5 h-5" /></div>
                        <span className="text-lg font-bold tracking-tight">SpendSense</span>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1"><X className="w-5 h-5" /></button>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = currentPath.startsWith(item.href);
                        return (
                            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Icon className="w-4 h-4" />{item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <div className="truncate">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                    <button type="button" onClick={() => router.post('/logout')} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2"><Menu className="w-5 h-5" /></button>
                        <h1 className="text-xl font-bold">{title}</h1>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Currency: {user.currency || 'PKR'}
                    </span>
                </header>
                <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
                    {flash?.success && <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">{flash.success}</div>}
                    {flash?.error && <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium">{flash.error}</div>}
                    {children}
                </main>
            </div>
        </div>
    );
}
