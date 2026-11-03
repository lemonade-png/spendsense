import React from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { formatCurrency } from '@/lib/format';
import { Transaction } from '@/types/spendsense';
import { PageProps } from '@/types';
import CategoryIcon from '@/Components/CategoryIcon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Scale, PiggyBank, Sparkles, Activity, PlusCircle } from 'lucide-react';

interface DashboardProps {
    selectedMonth: string;
    summary: {
        totalIncome: string;
        totalExpenses: string;
        netCashFlow: string;
        recordedBalance: string;
        budgetLimit: string;
        budgetRemaining: string;
        budgetUsage: string;
    };
    recentTransactions: Transaction[];
    categoryBreakdown: { name: string; color: string; total: number }[];
    monthlyTrend: { month: string; income: number; expenses: number; net: number }[];
}

export default function Dashboard({ selectedMonth, summary, recentTransactions, categoryBreakdown, monthlyTrend }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const currency = auth.user.currency || 'PKR';

    const incomeNum = parseFloat(summary.totalIncome);
    const expenseNum = parseFloat(summary.totalExpenses);
    const recordedBalanceNum = parseFloat(summary.recordedBalance);
    const budgetRemainingNum = parseFloat(summary.budgetRemaining);
    const budgetUsageNum = parseFloat(summary.budgetUsage);

    const savingsRate = incomeNum > 0 ? (((incomeNum - expenseNum) / incomeNum) * 100).toFixed(1) : '0.0';
    const avgDailySpend = (expenseNum / 30).toFixed(2);
    const healthStatus =
        incomeNum === 0 && expenseNum === 0
            ? { label: 'No Data Yet', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' }
            : parseFloat(savingsRate) >= 20
            ? { label: 'Excellent Savings', color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300' }
            : parseFloat(savingsRate) >= 0
            ? { label: 'Balanced Flow', color: 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300' }
            : { label: 'Deficit / Overspending', color: 'text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300' };

    return (
        <AppLayout title="Financial Dashboard">
            <Head title="Dashboard" />

            {/* Top Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/10 via-slate-900/5 to-transparent p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-base font-bold">Welcome back, {auth.user.name}</h2>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${healthStatus.color}`}>
                            {healthStatus.label}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Real-time calculations powered by XAMPP MariaDB decimal ledger
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => router.post('/demo/seed')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition"
                        title="Populate 6 months of realistic PKR transactions and budgets for project demo"
                    >
                        <Sparkles className="w-4 h-4" /> Load 6-Month Demo Data
                    </button>

                    <Link
                        href="/transactions"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                        <PlusCircle className="w-4 h-4" /> New Transaction
                    </Link>

                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => router.get('/dashboard', { month: e.target.value }, { preserveState: true })}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                    />
                </div>
            </div>

            {/* 5 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Income</span>
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
                    </div>
                    <p className="mt-3 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalIncome, currency)}</p>
                    <p className="mt-1 text-xs text-slate-500">Period: {selectedMonth}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Expenses</span>
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600"><TrendingDown className="w-4 h-4" /></div>
                    </div>
                    <p className="mt-3 text-xl font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(summary.totalExpenses, currency)}</p>
                    <p className="mt-1 text-xs text-slate-500">Avg {formatCurrency(avgDailySpend, currency)} / day</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recorded Balance</span>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600"><Scale className="w-4 h-4" /></div>
                    </div>
                    <p className={`mt-3 text-xl font-extrabold ${recordedBalanceNum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatCurrency(summary.recordedBalance, currency)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">All-time recorded ledger</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget Remaining</span>
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500"><PiggyBank className="w-4 h-4" /></div>
                    </div>
                    <p className={`mt-3 text-xl font-extrabold ${budgetRemainingNum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatCurrency(summary.budgetRemaining, currency)}
                    </p>
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${budgetUsageNum > 100 ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${Math.min(budgetUsageNum, 100)}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{summary.budgetUsage}% of {formatCurrency(summary.budgetLimit, currency)}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Savings Rate</span>
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-500"><Activity className="w-4 h-4" /></div>
                    </div>
                    <p className={`mt-3 text-xl font-extrabold ${parseFloat(savingsRate) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {savingsRate}%
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Net: {formatCurrency(summary.netCashFlow, currency)}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold">6-Month Income vs Expenses</h2>
                            <p className="text-xs text-slate-500">Monthly cash flow comparison across the last 6 months</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend} barGap={6}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                                <YAxis fontSize={12} stroke="#94a3b8" />
                                <Tooltip
                                    formatter={(value: any) => formatCurrency(Number(value ?? 0), currency)}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc' }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-base font-bold mb-1">Expense Distribution</h2>
                    <p className="text-xs text-slate-500 mb-4">Breakdown by category for {selectedMonth}</p>
                    {categoryBreakdown.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <p className="text-sm text-slate-500">No expenses recorded for {selectedMonth}.</p>
                            <button
                                type="button"
                                onClick={() => router.post('/demo/seed')}
                                className="text-xs font-semibold text-emerald-600 hover:underline"
                            >
                                Click here to load sample data
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryBreakdown}
                                            dataKey="total"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={52}
                                            outerRadius={82}
                                            paddingAngle={3}
                                        >
                                            {categoryBreakdown.map((entry, idx) => (
                                                <Cell key={idx} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(Number(value ?? 0), currency)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-1.5 mt-2 max-h-28 overflow-y-auto pr-1">
                                {categoryBreakdown.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                            {c.name}
                                        </span>
                                        <span className="font-semibold">{formatCurrency(c.total, currency)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold">Recent Transactions</h2>
                        <p className="text-xs text-slate-500">Latest 7 entries saved in XAMPP MariaDB</p>
                    </div>
                    <Link href="/transactions" className="text-xs font-semibold text-emerald-600 hover:underline">
                        Manage All Transactions →
                    </Link>
                </div>
                {recentTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No transactions recorded yet.</p>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl text-white shadow-xs" style={{ backgroundColor: tx.category?.color || '#64748b' }}>
                                        <CategoryIcon name={tx.category?.icon || 'Wallet'} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{tx.title}</p>
                                        <p className="text-xs text-slate-500">{tx.category?.name} • {tx.transaction_date} • {tx.payment_method}</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
