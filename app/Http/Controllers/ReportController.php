<?php

namespace App\Http\Controllers;

use App\Services\FinancialCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $year = $request->integer('year', (int) Carbon::now()->format('Y'));
        $startOfYear = Carbon::createFromDate($year, 1, 1)->startOfYear()->toDateString();
        $endOfYear = Carbon::createFromDate($year, 12, 31)->endOfYear()->toDateString();

        $yearIncome = (string) ($user->transactions()->where('type', 'income')->whereBetween('transaction_date', [$startOfYear, $endOfYear])->sum('amount') ?? '0.00');
        $yearExpenses = (string) ($user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$startOfYear, $endOfYear])->sum('amount') ?? '0.00');
        $yearNetSavings = FinancialCalculator::subtract($yearIncome, $yearExpenses);
        $savingsRate = bccomp(FinancialCalculator::normalize($yearIncome), '0.00', 2) > 0
            ? FinancialCalculator::percentage($yearNetSavings, $yearIncome)
            : '0.00';

        $monthlyComparison = [];
        for ($month = 1; $month <= 12; $month++) {
            $mDate = Carbon::createFromDate($year, $month, 1);
            $mStart = $mDate->copy()->startOfMonth()->toDateString();
            $mEnd = $mDate->copy()->endOfMonth()->toDateString();
            $inc = (string) ($user->transactions()->where('type', 'income')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount') ?? '0.00');
            $exp = (string) ($user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount') ?? '0.00');
            $monthlyComparison[] = [
                'month' => $mDate->format('M'),
                'income' => (float) FinancialCalculator::normalize($inc),
                'expenses' => (float) FinancialCalculator::normalize($exp),
                'savings' => (float) FinancialCalculator::subtract($inc, $exp),
            ];
        }

        $expenseByCategory = $user->transactions()
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfYear, $endOfYear])
            ->groupBy('category_id')
            ->with('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->category?->name ?? 'Other',
                'color' => $item->category?->color ?? '#ef4444',
                'total' => (float) FinancialCalculator::normalize($item->total),
                'percentage' => (float) FinancialCalculator::percentage((string) $item->total, $yearExpenses),
            ]);

        return Inertia::render('Reports/Index', [
            'year' => $year,
            'summary' => [
                'yearIncome' => FinancialCalculator::normalize($yearIncome),
                'yearExpenses' => FinancialCalculator::normalize($yearExpenses),
                'yearNetSavings' => $yearNetSavings,
                'savingsRate' => $savingsRate,
            ],
            'monthlyComparison' => $monthlyComparison,
            'expenseByCategory' => $expenseByCategory,
        ]);
    }
}
