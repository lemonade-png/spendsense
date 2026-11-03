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
