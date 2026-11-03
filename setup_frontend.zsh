#!/usr/bin/env zsh
set -e

mkdir -p resources/js/types resources/js/lib resources/js/Components resources/js/Layouts
mkdir -p resources/js/Pages/Transactions resources/js/Pages/Budgets resources/js/Pages/Categories resources/js/Pages/Reports resources/js/Pages/Calendar resources/js/Pages/Settings

cat << 'TS_INDEX' > resources/js/types/index.d.ts
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    currency?: 'USD' | 'PKR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD';
    timezone?: string;
    theme?: 'light' | 'dark' | 'system';
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
TS_INDEX

cat << 'TS_TYPES' > resources/js/types/spendsense.ts
import { User as BaseUser } from './index';
export type User = BaseUser;

export interface Category {
    id: number;
    user_id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    transactions_count?: number;
    total_amount?: string | null;
}

export interface Transaction {
    id: number;
    user_id: number;
    category_id: number;
    type: 'income' | 'expense';
    amount: string;
    title: string;
    notes: string | null;
    transaction_date: string;
    payment_method: string;
    category?: Category;
}

export interface BudgetItem {
    id: number;
    category_id: number | null;
    category_name: string;
    category_color: string;
    category_icon: string;
    month: string;
    limit: string;
    spent: string;
    remaining: string;
    usage_percentage: number;
}
TS_TYPES

cat << 'TS_FMT' > resources/js/lib/format.ts
export function formatCurrency(amount: string | number, currency: string = 'PKR'): string {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numeric)) return `${currency} 0.00`;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric);
}
TS_FMT

cat << 'TS_ICON' > resources/js/Components/CategoryIcon.tsx
import React from 'react';
import { Wallet, Briefcase, Laptop, TrendingUp, ShoppingCart, Home, Car, Utensils, HeartPulse, GraduationCap, Plane, Gift, Tag } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Wallet, Briefcase, Laptop, TrendingUp, ShoppingCart, Home, Car, Utensils, HeartPulse, GraduationCap, Plane, Gift, Tag,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export default function CategoryIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
    const IconComponent = ICON_MAP[name] || Wallet;
    return <IconComponent className={className} />;
}
TS_ICON

cat << 'TS_LAYOUT' > resources/js/Layouts/AppLayout.tsx
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
TS_LAYOUT

cat << 'PAGE_DASH' > resources/js/Pages/Dashboard.tsx
import React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { formatCurrency } from '@/lib/format';
import { Transaction } from '@/types/spendsense';
import { PageProps } from '@/types';
import CategoryIcon from '@/Components/CategoryIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Scale, PiggyBank } from 'lucide-react';

interface DashboardProps {
    selectedMonth: string;
    summary: { totalIncome: string; totalExpenses: string; netCashFlow: string; recordedBalance: string; budgetLimit: string; budgetRemaining: string; budgetUsage: string };
    recentTransactions: Transaction[];
    categoryBreakdown: { name: string; color: string; total: number }[];
    monthlyTrend: { month: string; income: number; expenses: number; net: number }[];
}

export default function Dashboard({ selectedMonth, summary, recentTransactions, categoryBreakdown, monthlyTrend }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';
    const recordedBalanceNum = parseFloat(summary.recordedBalance);
    const budgetRemainingNum = parseFloat(summary.budgetRemaining);
    const budgetUsageNum = parseFloat(summary.budgetUsage);

    return (
        <AppLayout title="Financial Dashboard">
            <Head title="Dashboard" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-slate-500">Overview of your recorded income, expenses, and monthly budget status</p>
                <input type="month" value={selectedMonth} onChange={(e) => router.get('/dashboard', { month: e.target.value }, { preserveState: true })} className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase text-slate-500">Total Income</span><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalIncome, currency)}</p>
                    <p className="mt-1 text-xs text-slate-500">Selected month ({selectedMonth})</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase text-slate-500">Total Expenses</span><TrendingDown className="w-5 h-5 text-rose-600" /></div>
                    <p className="mt-2 text-2xl font-bold text-rose-600">{formatCurrency(summary.totalExpenses, currency)}</p>
                    <p className="mt-1 text-xs text-slate-500">Selected month ({selectedMonth})</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase text-slate-500">Recorded Balance</span><Scale className="w-5 h-5 text-blue-600" /></div>
                    <p className={`mt-2 text-2xl font-bold ${recordedBalanceNum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(summary.recordedBalance, currency)}</p>
                    <p className="mt-1 text-xs text-slate-500">Calculated from recorded transactions</p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase text-slate-500">Budget Remaining</span><PiggyBank className="w-5 h-5 text-amber-500" /></div>
                    <p className={`mt-2 text-2xl font-bold ${budgetRemainingNum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(summary.budgetRemaining, currency)}</p>
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${budgetUsageNum > 100 ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${Math.min(budgetUsageNum, 100)}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{summary.budgetUsage}% of {formatCurrency(summary.budgetLimit, currency)} used</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-base font-semibold mb-4">6-Month Income vs Expenses Trend</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend}>
                                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-base font-semibold mb-4">Expense Breakdown</h2>
                    {categoryBreakdown.length === 0 ? <p className="text-sm text-slate-500 py-16 text-center">No expenses recorded for this month.</p> : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryBreakdown} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                                        {categoryBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold">Recent Transactions</h2>
                    <Link href="/transactions" className="text-sm font-medium text-emerald-600 hover:underline">View All</Link>
                </div>
                {recentTransactions.length === 0 ? <p className="text-sm text-slate-500 py-6 text-center">No transactions recorded yet.</p> : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: tx.category?.color || '#64748b' }}><CategoryIcon name={tx.category?.icon || 'Wallet'} /></div>
                                    <div><p className="text-sm font-medium">{tx.title}</p><p className="text-xs text-slate-500">{tx.category?.name} • {tx.transaction_date} • {tx.payment_method}</p></div>
                                </div>
                                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
PAGE_DASH

cat << 'PAGE_TX' > resources/js/Pages/Transactions/Index.tsx
import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, Transaction } from '@/types/spendsense';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/format';
import CategoryIcon from '@/Components/CategoryIcon';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Props {
    transactions: { data: Transaction[] };
    categories: Category[];
    filters: { search?: string; type?: string; category_id?: string; date_from?: string; date_to?: string };
    totals: { income: string; expenses: string; net: string };
}

export default function TransactionsIndex({ transactions, categories, filters, totals }: Props) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [showModal, setShowModal] = useState(false);
    const defaultExpenseCat = categories.find((c) => c.type === 'expense')?.id ?? categories[0]?.id ?? 1;

    const form = useForm({
        title: '',
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category_id: defaultExpenseCat,
        transaction_date: new Date().toISOString().slice(0, 10),
        payment_method: 'Cash',
        notes: '',
    });

    const openCreateModal = () => {
        setEditingTx(null);
        form.reset();
        form.setData('category_id', defaultExpenseCat);
        setShowModal(true);
    };

    const openEditModal = (tx: Transaction) => {
        setEditingTx(tx);
        form.setData({
            title: tx.title,
            type: tx.type,
            amount: tx.amount,
            category_id: tx.category_id,
            transaction_date: tx.transaction_date,
            payment_method: tx.payment_method,
            notes: tx.notes ?? '',
        });
        setShowModal(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTx) form.put(`/transactions/${editingTx.id}`, { onSuccess: () => setShowModal(false) });
        else form.post('/transactions', { onSuccess: () => { form.reset(); setShowModal(false); } });
    };

    const applyFilter = (key: string, value: string) => {
        router.get('/transactions', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Transactions">
            <Head title="Transactions" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Filtered Income</span><p className="text-lg font-bold text-emerald-600">{formatCurrency(totals.income, currency)}</p></div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Filtered Expenses</span><p className="text-lg font-bold text-rose-600">{formatCurrency(totals.expenses, currency)}</p></div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Net Filtered Flow</span><p className={`text-lg font-bold ${parseFloat(totals.net) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(totals.net, currency)}</p></div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input type="text" placeholder="Search..." defaultValue={filters.search ?? ''} onChange={(e) => applyFilter('search', e.target.value)} className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" />
                    </div>
                    <select value={filters.type ?? ''} onChange={(e) => applyFilter('type', e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
                    </select>
                    <select value={filters.category_id ?? ''} onChange={(e) => applyFilter('category_id', e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <option value="">All Categories</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>)}
                    </select>
                    <input type="date" value={filters.date_from ?? ''} onChange={(e) => applyFilter('date_from', e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" />
                    <input type="date" value={filters.date_to ?? ''} onChange={(e) => applyFilter('date_to', e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" />
                </div>
                <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="w-4 h-4" /> Add Transaction</button>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
                            <th className="py-3.5 px-4">Date</th><th className="py-3.5 px-4">Title</th><th className="py-3.5 px-4">Category</th><th className="py-3.5 px-4">Method</th><th className="py-3.5 px-4 text-right">Amount</th><th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                        {transactions.data.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-3 px-4 whitespace-nowrap">{tx.transaction_date}</td>
                                <td className="py-3 px-4"><p className="font-medium">{tx.title}</p>{tx.notes && <p className="text-xs text-slate-500">{tx.notes}</p>}</td>
                                <td className="py-3 px-4"><span className="inline-flex items-center gap-1.5"><CategoryIcon name={tx.category?.icon || 'Wallet'} className="w-4 h-4" />{tx.category?.name}</span></td>
                                <td className="py-3 px-4">{tx.payment_method}</td>
                                <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button onClick={() => openEditModal(tx)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="w-4 h-4 text-slate-500" /></button>
                                    <button onClick={() => confirm(`Delete "${tx.title}"?`) && router.delete(`/transactions/${tx.id}`)} className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={submitForm} className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold">{editingTx ? 'Edit Transaction' : 'New Transaction'}</h3>
                        <div>
                            <label className="block text-xs font-medium mb-1">Type</label>
                            <select value={form.data.type} onChange={(e) => { const t = e.target.value as 'income' | 'expense'; const c = categories.find((x) => x.type === t)?.id ?? form.data.category_id; form.setData({ ...form.data, type: t, category_id: c }); }} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="expense">Expense</option><option value="income">Income</option>
                            </select>
                        </div>
                        <div><label className="block text-xs font-medium mb-1">Title</label><input type="text" required value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs font-medium mb-1">Amount</label><input type="number" step="0.01" min="0.01" required value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                            <div><label className="block text-xs font-medium mb-1">Date</label><input type="date" required value={form.data.transaction_date} onChange={(e) => form.setData('transaction_date', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Category</label>
                                <select value={form.data.category_id} onChange={(e) => form.setData('category_id', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                    {categories.filter((c) => c.type === form.data.type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Method</label>
                                <select value={form.data.payment_method} onChange={(e) => form.setData('payment_method', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                    <option value="Cash">Cash</option><option value="Bank Transfer">Bank Transfer</option><option value="Debit Card">Debit Card</option><option value="Credit Card">Credit Card</option><option value="Mobile Wallet">Mobile Wallet</option>
                                </select>
                            </div>
                        </div>
                        <div><label className="block text-xs font-medium mb-1">Notes</label><textarea rows={2} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700">Cancel</button>
                            <button type="submit" disabled={form.processing} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700">{editingTx ? 'Update' : 'Save'}</button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
PAGE_TX

cat << 'PAGE_BUD' > resources/js/Pages/Budgets/Index.tsx
import React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { BudgetItem, Category } from '@/types/spendsense';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/format';
import CategoryIcon from '@/Components/CategoryIcon';
import { Trash2 } from 'lucide-react';

export default function BudgetsIndex({ month, budgets, expenseCategories }: { month: string; budgets: BudgetItem[]; expenseCategories: Category[] }) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';
    const form = useForm({ month, category_id: '' as string | number, amount: '' });

    return (
        <AppLayout title="Monthly Budgets">
            <Head title="Budgets" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={(e) => { e.preventDefault(); form.post('/budgets', { onSuccess: () => form.reset('amount') }); }} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
                    <h2 className="text-base font-semibold">Set Monthly Budget</h2>
                    <div>
                        <label className="block text-xs font-medium mb-1">Month</label>
                        <input type="month" value={month} onChange={(e) => { form.setData('month', e.target.value); router.get('/budgets', { month: e.target.value }, { preserveState: true }); }} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">Scope / Category</label>
                        <select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            <option value="">Overall Monthly Budget (All Expenses)</option>
                            {expenseCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">Budget Limit ({currency})</label>
                        <input type="number" step="0.01" min="1" required value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" />
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Save Budget Target</button>
                </form>
                <div className="lg:col-span-2 space-y-4">
                    {budgets.length === 0 ? <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">No budgets configured for {month}.</div> : budgets.map((b) => {
                        const isOver = parseFloat(b.remaining) < 0;
                        return (
                            <div key={b.id} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: b.category_color }}><CategoryIcon name={b.category_icon} /></div>
                                        <div><h3 className="font-semibold text-sm">{b.category_name}</h3><p className="text-xs text-slate-500">Spent {formatCurrency(b.spent, currency)} of {formatCurrency(b.limit, currency)}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>{isOver ? 'Over by ' : 'Remaining: '}{formatCurrency(Math.abs(parseFloat(b.remaining)), currency)}</span>
                                        <button onClick={() => router.delete(`/budgets/${b.id}`)} className="p-1.5 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                                    </div>
                                </div>
                                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${b.usage_percentage > 100 ? 'bg-rose-600' : b.usage_percentage > 80 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${Math.min(b.usage_percentage, 100)}%` }} />
                                </div>
                                <p className="text-xs text-right text-slate-500">{b.usage_percentage.toFixed(2)}% utilized</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
PAGE_BUD

cat << 'PAGE_CAT' > resources/js/Pages/Categories/Index.tsx
import React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category } from '@/types/spendsense';
import { PageProps } from '@/types';
import CategoryIcon, { AVAILABLE_ICONS } from '@/Components/CategoryIcon';
import { formatCurrency } from '@/lib/format';
import { Trash2 } from 'lucide-react';

export default function CategoriesIndex({ categories }: { categories: Category[] }) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';
    const form = useForm({ name: '', type: 'expense' as 'income' | 'expense', icon: 'Wallet', color: '#ef4444' });

    return (
        <AppLayout title="Categories">
            <Head title="Categories" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={(e) => { e.preventDefault(); form.post('/categories', { onSuccess: () => form.reset('name') }); }} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
                    <h2 className="text-base font-semibold">Add Category</h2>
                    <div><label className="block text-xs font-medium mb-1">Name</label><input type="text" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Type</label>
                            <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value as 'income' | 'expense')} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="expense">Expense</option><option value="income">Income</option>
                            </select>
                        </div>
                        <div><label className="block text-xs font-medium mb-1">Color</label><input type="color" value={form.data.color} onChange={(e) => form.setData('color', e.target.value)} className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700" /></div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">Icon</label>
                        <select value={form.data.icon} onChange={(e) => form.setData('icon', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                            {AVAILABLE_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Create Category</button>
                </form>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: cat.color }}><CategoryIcon name={cat.icon} /></div>
                                <div><p className="font-semibold text-sm">{cat.name}</p><p className="text-xs text-slate-500">{cat.type.toUpperCase()} • {cat.transactions_count ?? 0} txns • {formatCurrency(cat.total_amount ?? 0, currency)}</p></div>
                            </div>
                            <button onClick={() => router.delete(`/categories/${cat.id}`)} className="p-1.5 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
PAGE_CAT

cat << 'PAGE_REP' > resources/js/Pages/Reports/Index.tsx
import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { formatCurrency } from '@/lib/format';
import { PageProps } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

interface ReportsProps {
    year: number;
    summary: { yearIncome: string; yearExpenses: string; yearNetSavings: string; savingsRate: string };
    monthlyComparison: { month: string; income: number; expenses: number; savings: number }[];
    expenseByCategory: { name: string; color: string; total: number; percentage: number }[];
}

export default function ReportsIndex({ year, summary, monthlyComparison, expenseByCategory }: ReportsProps) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';

    return (
        <AppLayout title="Financial Reports & Analytics">
            <Head title="Reports" />
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Annual cash flow, savings rate, and category distribution</p>
                <select value={year} onChange={(e) => router.get('/reports', { year: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                    {[year - 2, year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Annual Income ({year})</span><p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.yearIncome, currency)}</p></div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Annual Expenses ({year})</span><p className="text-xl font-bold text-rose-600">{formatCurrency(summary.yearExpenses, currency)}</p></div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Net Cash Flow</span><p className={`text-xl font-bold ${parseFloat(summary.yearNetSavings) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(summary.yearNetSavings, currency)}</p></div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><span className="text-xs text-slate-500">Savings Rate</span><p className="text-xl font-bold">{summary.savingsRate}%</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-base font-semibold mb-4">Monthly Income vs Expenses ({year})</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyComparison}><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend /><Bar dataKey="income" name="Income" fill="#10b981" /><Bar dataKey="expenses" name="Expenses" fill="#ef4444" /></BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-base font-semibold mb-4">Monthly Net Savings Trend ({year})</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyComparison}><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend /><Line type="monotone" dataKey="savings" name="Net Cash Flow" stroke="#10b981" strokeWidth={2.5} /></LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold mb-4">Category Expense Breakdown</h3>
                <div className="space-y-3">
                    {expenseByCategory.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-sm"><span className="font-medium">{item.name}</span><span>{formatCurrency(item.total, currency)} ({item.percentage}%)</span></div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full" style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }} /></div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
PAGE_REP

cat << 'PAGE_CAL' > resources/js/Pages/Calendar/Index.tsx
import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Transaction } from '@/types/spendsense';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/format';

export default function CalendarIndex({ month, transactions }: { month: string; transactions: Transaction[] }) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [yearNum, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay();

    const txByDate = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
        acc[tx.transaction_date] = acc[tx.transaction_date] || [];
        acc[tx.transaction_date].push(tx);
        return acc;
    }, {});

    const days = Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);

    return (
        <AppLayout title="Transaction Calendar">
            <Head title="Calendar" />
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Click any date to inspect that day's transactions</p>
                <input type="month" value={month} onChange={(e) => router.get('/calendar', { month: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => <div key={`empty-${idx}`} className="h-24 rounded-lg bg-slate-100/50 dark:bg-slate-900/30" />)}
                {days.map((dateStr) => {
                    const dayTxs = txByDate[dateStr] || [];
                    const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
                    const dayExpense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
                    return (
                        <button key={dateStr} type="button" onClick={() => setSelectedDate(dateStr)} className={`h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition ${selectedDate === dateStr ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                            <span className="text-xs font-bold">{dateStr.slice(-2)}</span>
                            <div className="space-y-0.5 text-[11px]">
                                {dayIncome > 0 && <p className="text-emerald-600 font-medium truncate">+{formatCurrency(dayIncome, currency)}</p>}
                                {dayExpense > 0 && <p className="text-rose-600 font-medium truncate">-{formatCurrency(dayExpense, currency)}</p>}
                            </div>
                        </button>
                    );
                })}
            </div>
            {selectedDate && (
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold mb-3">Transactions on {selectedDate}</h3>
                    {(txByDate[selectedDate] || []).length === 0 ? <p className="text-sm text-slate-500">No transactions recorded on this date.</p> : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {txByDate[selectedDate].map((tx) => (
                                <div key={tx.id} className="py-2.5 flex justify-between text-sm">
                                    <span><strong>{tx.title}</strong> ({tx.category?.name})</span>
                                    <span className={tx.type === 'income' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
PAGE_CAL

cat << 'PAGE_SET' > resources/js/Pages/Settings/Index.tsx
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User } from '@/types/spendsense';

export default function SettingsIndex({ user }: { user: User }) {
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        currency: user.currency || 'PKR',
        timezone: user.timezone || 'Asia/Karachi',
        theme: user.theme || 'system',
    });

    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    return (
        <AppLayout title="Account & Application Settings">
            <Head title="Settings" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={(e) => { e.preventDefault(); profileForm.put('/settings/profile'); }} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-base font-semibold">Profile & Regional Preferences</h2>
                    <div><label className="block text-xs font-medium mb-1">Full Name</label><input type="text" value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">Email Address</label><input type="email" value={profileForm.data.email} onChange={(e) => profileForm.setData('email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Currency</label>
                            <select value={profileForm.data.currency} onChange={(e) => profileForm.setData('currency', e.target.value as NonNullable<User['currency']>)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="PKR">PKR (₨)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="AED">AED</option><option value="CAD">CAD ($)</option><option value="AUD">AUD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Timezone</label>
                            <select value={profileForm.data.timezone} onChange={(e) => profileForm.setData('timezone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="Asia/Karachi">Asia/Karachi</option><option value="UTC">UTC</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option><option value="Asia/Dubai">Asia/Dubai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Theme</label>
                            <select value={profileForm.data.theme} onChange={(e) => profileForm.setData('theme', e.target.value as NonNullable<User['theme']>)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={profileForm.processing} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Save Preferences</button>
                </form>

                <form onSubmit={(e) => { e.preventDefault(); passwordForm.put('/settings/password', { onSuccess: () => passwordForm.reset() }); }} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-base font-semibold">Update Password</h2>
                    <div><label className="block text-xs font-medium mb-1">Current Password</label><input type="password" value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">New Password</label><input type="password" value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">Confirm New Password</label><input type="password" value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <button type="submit" disabled={passwordForm.processing} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium">Change Password</button>
                </form>
            </div>
        </AppLayout>
    );
}
PAGE_SET

npm run build
echo "==> Frontend Pages & Vite Build Completed Successfully!"
