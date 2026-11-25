import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    DeleteButton,
    Field,
    money,
    MonthFilter,
    Page,
    selectClass,
} from '@/components/finance-ui';
import type { Category } from '@/components/finance-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Budget = {
    id: number;
    category_id: number;
    category: { name: string };
    amount: string;
    spent: string;
    remaining: string;
    percentage: number;
    month: number;
    year: number;
};

function BudgetForm({
    budget,
    categories,
    period,
    onClose,
}: {
    budget?: Budget;
    categories: Category[];
    period: string;
    onClose: () => void;
}) {
    const form = useForm({
        category_id: budget ? String(budget.category_id) : '',
        amount: budget?.amount ?? '',
        month: budget?.month ?? Number(period.slice(5, 7)),
        year: budget?.year ?? Number(period.slice(0, 4)),
    });

    return (
        <form
            className="grid gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                if (budget) {
                    form.put(`/budgets/${budget.id}`, { onSuccess: onClose });
                } else {
                    form.post('/budgets', {
                        onSuccess: () => form.reset('category_id', 'amount'),
                    });
                }
            }}
        >
            <Field
                id="budget-category"
                label="Expense category"
                error={form.errors.category_id}
            >
                <select
                    id="budget-category"
                    className={selectClass}
                    required
                    value={form.data.category_id}
                    onChange={(e) =>
                        form.setData('category_id', e.target.value)
                    }
                >
                    <option value="">Select a category</option>
                    {categories.map(({ id, name }) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </select>
                {!categories.length && (
                    <Link className="text-sm underline" href="/categories">
                        Create an expense category
                    </Link>
                )}
            </Field>
            <Field
                id="budget-amount"
                label="Limit (PKR)"
                error={form.errors.amount}
            >
                <Input
                    id="budget-amount"
                    required
                    type="number"
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    value={form.data.amount}
                    onChange={(e) => form.setData('amount', e.target.value)}
                />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field
                    id="budget-month"
                    label="Month"
                    error={form.errors.month}
                >
                    <select
                        id="budget-month"
                        className={selectClass}
                        value={form.data.month}
                        onChange={(e) =>
                            form.setData('month', Number(e.target.value))
                        }
                    >
                        {Array.from({ length: 12 }, (_, month) => (
                            <option key={month} value={month + 1}>
                                {new Date(2000, month).toLocaleString('en-PK', {
                                    month: 'long',
                                })}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field id="budget-year" label="Year" error={form.errors.year}>
                    <Input
                        id="budget-year"
                        required
                        type="number"
                        min="1900"
                        max="9999"
                        value={form.data.year || ''}
                        onChange={(e) =>
                            form.setData('year', Number(e.target.value))
                        }
                    />
                </Field>
            </div>
            <div className="flex gap-2">
                <Button disabled={form.processing || !categories.length}>
                    {budget ? 'Save changes' : 'Add budget'}
                </Button>
                {budget && (
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}

export default function Budgets({
    budgets,
    categories,
    period,
}: {
    budgets: Budget[];
    categories: Category[];
    period: string;
}) {
    const [editingId, setEditingId] = useState<number>();
    const editing = budgets.find(({ id }) => id === editingId);

    return (
        <Page
            title="Budgets"
            description="Set monthly spending limits and track how much you’ve used."
            action={<MonthFilter period={period} url="/budgets" />}
        >
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid gap-4">
                    {!budgets.length && (
                        <Card>
                            <CardContent className="text-sm text-muted-foreground">
                                No budgets for this month.
                            </CardContent>
                        </Card>
                    )}
                    {budgets.map((budget) => (
                        <Card key={budget.id} className="gap-4">
                            <CardHeader>
                                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                                    {budget.category.name}
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {budget.percentage}% used
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <progress
                                    aria-label={`${budget.category.name} budget used`}
                                    max={100}
                                    value={Math.min(100, budget.percentage)}
                                    className={`h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted ${budget.percentage > 100 ? 'accent-rose-500 [&::-webkit-progress-value]:bg-rose-500' : 'accent-emerald-500 [&::-webkit-progress-value]:bg-emerald-500'}`}
                                />
                                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Limit
                                        </dt>
                                        <dd>{money(budget.amount)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Spent
                                        </dt>
                                        <dd>{money(budget.spent)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            {Number(budget.remaining) < 0
                                                ? 'Over budget'
                                                : 'Remaining'}
                                        </dt>
                                        <dd>
                                            {Number(budget.remaining) < 0
                                                ? money(
                                                      budget.remaining.slice(1),
                                                  )
                                                : money(budget.remaining)}
                                        </dd>
                                    </div>
                                </dl>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingId(budget.id)}
                                    >
                                        Edit
                                    </Button>
                                    <DeleteButton
                                        label={`the ${budget.category.name} budget`}
                                        onDelete={() =>
                                            router.delete(
                                                `/budgets/${budget.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="row-start-1 lg:col-start-2">
                    <CardHeader>
                        <CardTitle>
                            {editing ? 'Edit budget' : 'New budget'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BudgetForm
                            key={`${period}-${editing?.id ?? 'new'}`}
                            budget={editing}
                            categories={categories}
                            period={period}
                            onClose={() => setEditingId(undefined)}
                        />
                    </CardContent>
                </Card>
            </div>
        </Page>
    );
}

Budgets.layout = { breadcrumbs: [{ title: 'Budgets', href: '/budgets' }] };
