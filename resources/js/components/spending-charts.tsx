import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { money } from '@/components/finance-ui';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export type ChartData = {
    history: { period: string; income: number; expenses: number }[];
    breakdown: { name: string; amount: number }[];
    period: string;
};

const chartTooltipStyle = {
    background: 'var(--popover)',
    color: 'var(--popover-foreground)',
    borderColor: 'var(--border)',
    borderRadius: 8,
};
const compactNumber = new Intl.NumberFormat('en-PK', { notation: 'compact' });

export function SpendingCharts({ history, breakdown, period }: ChartData) {
    const label = new Date(`${period}-01T00:00:00`).toLocaleDateString(
        'en-PK',
        { month: 'long', year: 'numeric' },
    );
    const highest = breakdown[0]?.amount ?? 0;

    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle>Income and expenses</CardTitle>
                    <CardDescription>
                        Monthly totals in PKR for the six months ending {label}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {history.some(
                        ({ income, expenses }) => income > 0 || expenses > 0,
                    ) ? (
                        <>
                            <div className="mb-3 flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    Income
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-rose-500" />
                                    Expenses
                                </span>
                            </div>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={history}
                                        margin={{
                                            top: 4,
                                            right: 2,
                                            bottom: 0,
                                            left: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="var(--border)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="period"
                                            tick={{
                                                fill: 'var(--muted-foreground)',
                                                fontSize: 12,
                                            }}
                                            tickFormatter={(value: string) =>
                                                value.slice(0, 3)
                                            }
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            width={44}
                                            tick={{
                                                fill: 'var(--muted-foreground)',
                                                fontSize: 12,
                                            }}
                                            tickFormatter={(value: number) =>
                                                compactNumber.format(value)
                                            }
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={chartTooltipStyle}
                                            itemStyle={{
                                                color: 'var(--popover-foreground)',
                                            }}
                                            cursor={{
                                                fill: 'var(--muted)',
                                                opacity: 0.45,
                                            }}
                                            formatter={(value) =>
                                                money(Number(value))
                                            }
                                        />
                                        <Bar
                                            dataKey="income"
                                            name="Income"
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                            isAnimationActive={false}
                                        />
                                        <Bar
                                            dataKey="expenses"
                                            name="Expenses"
                                            fill="#f43f5e"
                                            radius={[4, 4, 0, 0]}
                                            isAnimationActive={false}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <details className="mt-3 text-sm text-muted-foreground">
                                <summary className="cursor-pointer">
                                    View monthly totals
                                </summary>
                                <ul className="mt-2 grid gap-1">
                                    {history.map((row) => (
                                        <li key={row.period}>
                                            {row.period} · Income{' '}
                                            {money(row.income)} · Expenses{' '}
                                            {money(row.expenses)}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </>
                    ) : (
                        <p className="py-8 text-sm text-muted-foreground">
                            No transactions were recorded in these six months.
                        </p>
                    )}
                </CardContent>
            </Card>
            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle>Spending by category</CardTitle>
                    <CardDescription>{label}</CardDescription>
                </CardHeader>
                <CardContent>
                    {breakdown.length ? (
                        <ul className="grid gap-4">
                            {breakdown.map(({ name, amount }) => (
                                <li key={name} className="grid gap-2">
                                    <div className="flex justify-between gap-2 text-sm">
                                        <span className="break-words">
                                            {name}
                                        </span>
                                        <span className="shrink-0 tabular-nums">
                                            {money(amount)}
                                        </span>
                                    </div>
                                    <div
                                        aria-hidden="true"
                                        className="h-2 overflow-hidden rounded-full bg-muted"
                                    >
                                        <div
                                            className="h-full rounded-full bg-rose-500/75"
                                            style={{
                                                width: `${(amount / highest) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-8 text-sm text-muted-foreground">
                            No expenses recorded this month.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
