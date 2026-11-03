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
