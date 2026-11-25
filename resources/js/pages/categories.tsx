import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    DeleteButton,
    Field,
    Page,
    selectClass,
} from '@/components/finance-ui';
import type { Category, EntryType } from '@/components/finance-ui';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type CategoryRow = Category & {
    transactions_count: number;
    budgets_count: number;
};

function CategoryForm({
    category,
    onClose,
}: {
    category?: CategoryRow;
    onClose: () => void;
}) {
    const form = useForm({
        name: category?.name ?? '',
        type: category?.type ?? ('expense' as EntryType),
    });

    return (
        <form
            className="grid gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                if (category) {
                    form.put(`/categories/${category.id}`, {
                        onSuccess: onClose,
                    });
                } else {
                    form.post('/categories', { onSuccess: () => form.reset() });
                }
            }}
        >
            <Field id="category-name" label="Name" error={form.errors.name}>
                <Input
                    id="category-name"
                    required
                    maxLength={80}
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                />
            </Field>
            <Field id="category-type" label="Type" error={form.errors.type}>
                <select
                    id="category-type"
                    className={selectClass}
                    value={form.data.type}
                    onChange={(e) =>
                        form.setData('type', e.target.value as EntryType)
                    }
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </Field>
            <div className="flex gap-2">
                <Button disabled={form.processing}>
                    {category ? 'Save changes' : 'Add category'}
                </Button>
                {category && (
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}

export default function Categories({
    categories,
}: {
    categories: CategoryRow[];
}) {
    const [editing, setEditing] = useState<CategoryRow>();
    const { errors } = usePage().props;

    return (
        <Page
            title="Categories"
            description="Group income and expenses to see where your money comes from and where it goes."
        >
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <Card>
                    <CardHeader>
                        <CardTitle>Your categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InputError message={errors.category} />
                        {!categories.length && (
                            <p className="text-sm text-muted-foreground">
                                Add a category to start organizing transactions.
                            </p>
                        )}
                        {(['expense', 'income'] as const).map((type) => {
                            const rows = categories.filter(
                                (category) => category.type === type,
                            );
                            return (
                                rows.length > 0 && (
                                    <section
                                        key={type}
                                        className="mb-5 last:mb-0"
                                    >
                                        <h2 className="border-b pb-2 text-sm font-medium text-muted-foreground capitalize">
                                            {type}
                                        </h2>
                                        <ul className="divide-y">
                                            {rows.map((category) => (
                                                <li
                                                    key={category.id}
                                                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {category.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                category.transactions_count
                                                            }{' '}
                                                            transactions ·{' '}
                                                            {
                                                                category.budgets_count
                                                            }{' '}
                                                            budgets
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setEditing(
                                                                    category,
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        <DeleteButton
                                                            label={
                                                                category.name
                                                            }
                                                            disabled={
                                                                category.transactions_count +
                                                                    category.budgets_count >
                                                                0
                                                            }
                                                            onDelete={() =>
                                                                router.delete(
                                                                    `/categories/${category.id}`,
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )
                            );
                        })}
                    </CardContent>
                </Card>
                <Card className="row-start-1 lg:col-start-2">
                    <CardHeader>
                        <CardTitle>
                            {editing ? 'Edit category' : 'New category'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm
                            key={editing?.id ?? 'new'}
                            category={editing}
                            onClose={() => setEditing(undefined)}
                        />
                    </CardContent>
                </Card>
            </div>
        </Page>
    );
}

Categories.layout = {
    breadcrumbs: [{ title: 'Categories', href: '/categories' }],
};
