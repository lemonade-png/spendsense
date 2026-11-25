import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, Page, selectClass } from '@/components/finance-ui';
import type { Category, EntryType, Transaction } from '@/components/finance-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TransactionForm({
    transaction,
    categories,
    today,
}: {
    transaction?: Transaction;
    categories: Category[];
    today: string;
}) {
    const form = useForm({
        title: transaction?.title ?? '',
        amount: transaction?.amount ?? '',
        type: transaction?.type ?? ('expense' as EntryType),
        category_id: transaction ? String(transaction.category_id) : '',
        transaction_date: transaction?.transaction_date ?? today,
        notes: transaction?.notes ?? '',
    });
    const choices = categories.filter(
        (category) => category.type === form.data.type,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (transaction) {
            form.put(`/transactions/${transaction.id}`);
        } else {
            form.post('/transactions');
        }
    }

    return (
        <Page
            title={transaction ? 'Edit transaction' : 'Add transaction'}
            description="Record money you received or spent in PKR."
        >
            <Card className="max-w-2xl">
                <CardContent>
                    <form onSubmit={submit} className="grid gap-5">
                        <Field
                            id="title"
                            label="Title"
                            error={form.errors.title}
                        >
                            <Input
                                id="title"
                                required
                                maxLength={150}
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                            />
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                id="type"
                                label="Type"
                                error={form.errors.type}
                            >
                                <select
                                    id="type"
                                    className={selectClass}
                                    value={form.data.type}
                                    onChange={(e) =>
                                        form.setData({
                                            ...form.data,
                                            type: e.target.value as EntryType,
                                            category_id: '',
                                        })
                                    }
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </Field>
                            <Field
                                id="category"
                                label="Category"
                                error={form.errors.category_id}
                            >
                                <select
                                    id="category"
                                    required
                                    className={selectClass}
                                    value={form.data.category_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'category_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Select a category</option>
                                    {choices.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {!choices.length && (
                                    <Link
                                        href="/categories"
                                        className="text-sm underline"
                                    >
                                        Create a category
                                    </Link>
                                )}
                            </Field>
                            <Field
                                id="amount"
                                label="Amount (PKR)"
                                error={form.errors.amount}
                            >
                                <Input
                                    id="amount"
                                    required
                                    type="number"
                                    min="0.01"
                                    max="9999999999.99"
                                    step="0.01"
                                    value={form.data.amount}
                                    onChange={(e) =>
                                        form.setData('amount', e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                id="date"
                                label="Date"
                                error={form.errors.transaction_date}
                            >
                                <Input
                                    id="date"
                                    required
                                    type="date"
                                    value={form.data.transaction_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'transaction_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field
                            id="notes"
                            label="Notes (optional)"
                            error={form.errors.notes}
                        >
                            <textarea
                                id="notes"
                                rows={3}
                                maxLength={2000}
                                className="w-full rounded-md border border-input bg-background p-3 text-sm"
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                            />
                        </Field>
                        <div className="flex gap-2">
                            <Button disabled={form.processing}>
                                {transaction
                                    ? 'Save changes'
                                    : 'Add transaction'}
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/transactions">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Page>
    );
}

TransactionForm.layout = {
    breadcrumbs: [{ title: 'Transactions', href: '/transactions' }],
};
