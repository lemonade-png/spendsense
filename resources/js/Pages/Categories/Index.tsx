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
