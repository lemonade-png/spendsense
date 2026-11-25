import { Link } from '@inertiajs/react';
import { CircleMinus, CirclePlus, List, Plus, Wallet } from 'lucide-react';
import { money, Page, TransactionTable } from '@/components/finance-ui';
import type { Transaction } from '@/components/finance-ui';
import { SpendingCharts } from '@/components/spending-charts';
import type { ChartData } from '@/components/spending-charts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export type Totals = {
    income: string;
    expenses: string;
    balance: string;
    count: number;
};

export default function Dashboard({
    totals,
    recent,
    ...charts
}: ChartData & { totals: Totals; recent: Transaction[] }) {
    const metrics = [
        {
            label: 'Recorded balance',
            value: money(totals.balance),
            icon: Wallet,
            color: 'text-foreground',
            detail: 'Recorded income minus recorded expenses',
        },
        {
            label: 'Total income',
            value: money(totals.income),
            icon: CirclePlus,
            color: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Total expenses',
            value: money(totals.expenses),
            icon: CircleMinus,
            color: 'text-rose-600 dark:text-rose-400',
        },
        {
            label: 'Transactions',
            value: totals.count.toLocaleString('en-PK'),
            icon: List,
            color: 'text-foreground',
        },
    ];
    return (
        <Page
            title="Dashboard"
            description="An overview of all the income and expenses you’ve recorded."
            action={
                <Button asChild>
                    <Link href="/transactions/create">
                        <Plus /> Add transaction
                    </Link>
                </Button>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, icon: Icon, color, detail }) => (
                    <Card key={label} className="gap-2">
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2 text-sm">
                                <Icon className="size-4" />
                                {label}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-2xl font-semibold tracking-tight break-words tabular-nums ${color}`}
                            >
                                {value}
                            </p>
                            {detail && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {detail}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <SpendingCharts {...charts} />
            <Card className="gap-4 pb-0">
                <CardHeader>
                    <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                        Recent transactions
                        <Button asChild size="sm" variant="outline">
                            <Link href="/transactions">View transactions</Link>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <TransactionTable rows={recent} />
            </Card>
        </Page>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
