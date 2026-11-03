<?php

namespace App\Http\Controllers;

use App\Services\FinancialCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $user->seedDefaultCategories();

        $selectedMonth = $request->string('month', Carbon::now()->format('Y-m'))->toString();
        $startOfMonth = Carbon::createFromFormat('Y-m', $selectedMonth)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromFormat('Y-m', $selectedMonth)->endOfMonth()->toDateString();

        $periodIncome = (string) ($user->transactions()->where('type', 'income')->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])->sum('amount') ?? '0.00');
        $periodExpenses = (string) ($user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])->sum('amount') ?? '0.00');
        $netCashFlow = FinancialCalculator::subtract($periodIncome, $periodExpenses);

        $allTimeIncome = (string) ($user->transactions()->where('type', 'income')->sum('amount') ?? '0.00');
        $allTimeExpenses = (string) ($user->transactions()->where('type', 'expense')->sum('amount') ?? '0.00');
        $recordedBalance = FinancialCalculator::subtract($allTimeIncome, $allTimeExpenses);

        $overallBudget = $user->budgets()->where('month', $selectedMonth)->whereNull('category_id')->first();
        $budgetLimit = $overallBudget
            ? (string) $overallBudget->amount
            : (string) ($user->budgets()->where('month', $selectedMonth)->whereNotNull('category_id')->sum('amount') ?? '0.00');

        $budgetRemaining = FinancialCalculator::subtract($budgetLimit, $periodExpenses);
        $budgetUsage = FinancialCalculator::percentage($periodExpenses, $budgetLimit);

        $recentTransactions = $user->transactions()->with('category')->orderByDesc('transaction_date')->orderByDesc('id')->limit(7)->get();

        $categoryBreakdown = $user->transactions()
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->category?->name ?? 'Uncategorized',
                'color' => $row->category?->color ?? '#94a3b8',
                'total' => (float) FinancialCalculator::normalize($row->total),
            ]);

        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::createFromFormat('Y-m', $selectedMonth)->subMonths($i);
            $mStart = $m->copy()->startOfMonth()->toDateString();
            $mEnd = $m->copy()->endOfMonth()->toDateString();
            $inc = (string) ($user->transactions()->where('type', 'income')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount') ?? '0.00');
            $exp = (string) ($user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount') ?? '0.00');
            $monthlyTrend[] = [
                'month' => $m->format('M Y'),
                'income' => (float) FinancialCalculator::normalize($inc),
                'expenses' => (float) FinancialCalculator::normalize($exp),
                'net' => (float) FinancialCalculator::subtract($inc, $exp),
            ];
        }

        return Inertia::render('Dashboard', [
            'selectedMonth' => $selectedMonth,
            'summary' => [
                'totalIncome' => FinancialCalculator::normalize($periodIncome),
                'totalExpenses' => FinancialCalculator::normalize($periodExpenses),
                'netCashFlow' => $netCashFlow,
                'recordedBalance' => $recordedBalance,
                'budgetLimit' => FinancialCalculator::normalize($budgetLimit),
                'budgetRemaining' => $budgetRemaining,
                'budgetUsage' => $budgetUsage,
            ],
            'recentTransactions' => $recentTransactions,
            'categoryBreakdown' => $categoryBreakdown,
            'monthlyTrend' => $monthlyTrend,
        ]);
    }
}
