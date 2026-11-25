import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type EntryType = 'income' | 'expense';
export type Category = { id: number; name: string; type: EntryType };
export type Transaction = {
    id: number;
    title: string;
    category_id: number;
    category?: Pick<Category, 'id' | 'name'>;
    type: EntryType;
    amount: string;
    transaction_date: string;
    notes: string | null;
};

const currency = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    currencyDisplay: 'code',
});

export function money(value: string | number) {
    return currency.format(value as number | `${number}`);
}

export const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

export function Page({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-7 lg:p-9">
            <Head title={title} />
            <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                {action}
            </header>
            {children}
        </main>
    );
}

export function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export function MonthFilter({ period, url }: { period: string; url: string }) {
    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="period">Month</Label>
            <Input
                id="period"
                className="w-auto"
                type="month"
                value={period}
                onChange={(event) => {
                    if (event.target.value) {
                        router.get(
                            url,
                            { period: event.target.value },
                            { preserveScroll: true },
                        );
                    }
                }}
            />
        </div>
    );
}

export function DeleteButton({
    label,
    onDelete,
    disabled,
}: {
    label: string;
    onDelete: () => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
                if (window.confirm(`Delete ${label}?`)) onDelete();
            }}
        >
            Delete
        </Button>
    );
}

export function TransactionTable({
    rows,
    editable = false,
}: {
    rows: Transaction[];
    editable?: boolean;
}) {
    if (!rows.length) {
        return (
            <p className="px-5 py-8 text-sm text-muted-foreground">
                No transactions to display.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-sm">
                <thead className="border-b bg-muted/40 text-muted-foreground">
                    <tr>
                        <th scope="col" className="px-5 py-3 font-medium">
                            Transaction
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Category
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Date
                        </th>
                        <th
                            scope="col"
                            className="px-4 py-3 text-right font-medium"
                        >
                            Amount
                        </th>
                        {editable && (
                            <th
                                scope="col"
                                className="px-5 py-3 text-right font-medium"
                            >
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30">
                            <td className="px-5 py-3 font-medium">
                                {row.title}
                                {row.notes && (
                                    <p className="mt-1 max-w-xs font-normal break-words whitespace-pre-wrap text-muted-foreground">
                                        {row.notes}
                                    </p>
                                )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {row.category?.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                {row.transaction_date}
                            </td>
                            <td
                                className={`px-4 py-3 text-right font-medium whitespace-nowrap tabular-nums ${row.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                            >
                                {row.type === 'income' ? '+' : '−'}
                                {money(row.amount)}
                            </td>
                            {editable && (
                                <td className="px-5 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Link
                                                href={`/transactions/${row.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </Button>
                                        <DeleteButton
                                            label={row.title}
                                            onDelete={() =>
                                                router.delete(
                                                    `/transactions/${row.id}`,
                                                    { preserveScroll: true },
                                                )
                                            }
                                        />
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
