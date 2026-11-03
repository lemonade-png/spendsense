import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, Transaction } from '@/types/spendsense';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/format';
import CategoryIcon from '@/Components/CategoryIcon';
import { Plus, Pencil, Trash2, Search, Download } from 'lucide-react';

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
                <a href="/transactions/export/csv" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"><Download className="w-4 h-4" /> Export CSV</a>
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
