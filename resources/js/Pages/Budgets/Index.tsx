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
