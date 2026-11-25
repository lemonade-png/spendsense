import { money, MonthFilter, Page } from '@/components/finance-ui';
import { SpendingCharts } from '@/components/spending-charts';
import type { ChartData } from '@/components/spending-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Totals } from '@/pages/dashboard';

export default function Reports({
    totals,
    ...charts
}: ChartData & { totals: Totals }) {
    return (
        <Page
            title="Reports"
            description="Review a month’s income and expenses and compare the last six months."
            action={<MonthFilter period={charts.period} url="/reports" />}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="gap-2">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Monthly income
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                        {money(totals.income)}
                    </CardContent>
                </Card>
                <Card className="gap-2">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Monthly expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold text-rose-600 tabular-nums dark:text-rose-400">
                        {money(totals.expenses)}
                    </CardContent>
                </Card>
            </div>
            <SpendingCharts {...charts} />
        </Page>
    );
}

Reports.layout = { breadcrumbs: [{ title: 'Reports', href: '/reports' }] };
