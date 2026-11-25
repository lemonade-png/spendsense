import { Link, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import {
    Field,
    Page,
    selectClass,
    TransactionTable,
} from '@/components/finance-ui';
import type { Category, Transaction } from '@/components/finance-ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Transactions({
    transactions,
    categories,
    filters,
}: {
    transactions: {
        data: Transaction[];
        prev_page_url: string | null;
        next_page_url: string | null;
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: { search?: string; type?: string; category?: string };
}) {
    const form = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
        category: filters.category ?? '',
    });

    return (
        <Page
            title="Transactions"
            description="Search and manage your recorded income and expenses."
            action={
                <Button asChild>
                    <Link href="/transactions/create">
                        <Plus /> Add transaction
                    </Link>
                </Button>
            }
        >
            <form
                className="grid items-start gap-3 sm:grid-cols-[minmax(10rem,1fr)_minmax(8rem,.5fr)_minmax(8rem,.7fr)_auto] sm:items-end"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.get('/transactions', { preserveState: true });
                }}
            >
                <Field
                    id="search"
                    label="Search by title"
                    error={form.errors.search}
                >
                    <Input
                        id="search"
                        maxLength={150}
                        value={form.data.search}
                        onChange={(e) => form.setData('search', e.target.value)}
                    />
                </Field>
                <Field id="type-filter" label="Type" error={form.errors.type}>
                    <select
                        id="type-filter"
                        className={selectClass}
                        value={form.data.type}
                        onChange={(e) =>
                            form.setData({
                                ...form.data,
                                type: e.target.value,
                                category: '',
                            })
                        }
                    >
                        <option value="">All types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </Field>
                <Field
                    id="category-filter"
                    label="Category"
                    error={form.errors.category}
                >
                    <select
                        id="category-filter"
                        className={selectClass}
                        value={form.data.category}
                        onChange={(e) =>
                            form.setData('category', e.target.value)
                        }
                    >
                        <option value="">All categories</option>
                        {categories
                            .filter(
                                ({ type }) =>
                                    !form.data.type || type === form.data.type,
                            )
                            .map(({ id, name }) => (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            ))}
                    </select>
                </Field>
                <Button variant="outline" disabled={form.processing}>
                    Apply filters
                </Button>
            </form>
            <Card className="gap-0 py-0">
                <TransactionTable rows={transactions.data} editable />
                {transactions.last_page > 1 && (
                    <nav
                        className="flex flex-wrap items-center justify-between gap-2 border-t p-4"
                        aria-label="Transaction pages"
                    >
                        <span className="text-sm text-muted-foreground">
                            Page {transactions.current_page} of{' '}
                            {transactions.last_page}
                        </span>
                        <div className="flex gap-2">
                            {transactions.prev_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={transactions.prev_page_url}>
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            {transactions.next_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={transactions.next_page_url}>
                                        Next
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </nav>
                )}
            </Card>
        </Page>
    );
}

Transactions.layout = {
    breadcrumbs: [{ title: 'Transactions', href: '/transactions' }],
};
