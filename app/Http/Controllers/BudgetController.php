<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Services\FinancialCalculator;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $user->seedDefaultCategories();
        $month = $request->string('month', Carbon::now()->format('Y-m'))->toString();
        $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();

        $totalMonthlyExpenses = (string) ($user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])->sum('amount') ?? '0.00');
        $expensesByCategory = $user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])->selectRaw('category_id, SUM(amount) as spent')->groupBy('category_id')->pluck('spent', 'category_id');

        $budgets = $user->budgets()->with('category')->where('month', $month)->get()->map(function (Budget $budget) use ($totalMonthlyExpenses, $expensesByCategory) {
            $spent = $budget->category_id === null ? $totalMonthlyExpenses : (string) ($expensesByCategory[$budget->category_id] ?? '0.00');
            $limit = (string) $budget->amount;
            return [
                'id' => $budget->id,
                'category_id' => $budget->category_id,
                'category_name' => $budget->category?->name ?? 'Overall Monthly Budget',
                'category_color' => $budget->category?->color ?? '#10b981',
                'category_icon' => $budget->category?->icon ?? 'Wallet',
                'month' => $budget->month,
                'limit' => FinancialCalculator::normalize($limit),
                'spent' => FinancialCalculator::normalize($spent),
                'remaining' => FinancialCalculator::subtract($limit, $spent),
                'usage_percentage' => (float) FinancialCalculator::percentage($spent, $limit),
            ];
        });

        return Inertia::render('Budgets/Index', [
            'month' => $month,
            'budgets' => $budgets,
            'expenseCategories' => $user->categories()->where('type', 'expense')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'month' => ['required', 'regex:/^\d{4}-\d{2}$/'],
            'category_id' => ['nullable', Rule::exists('categories', 'id')->where(fn ($q) => $q->where('user_id', $user->id)->where('type', 'expense'))],
            'amount' => ['required', 'numeric', 'gt:0', 'max:999999999999.99'],
        ]);

        Budget::updateOrCreate(
            ['user_id' => $user->id, 'category_id' => $validated['category_id'] ?: null, 'month' => $validated['month']],
            ['amount' => $validated['amount']]
        );
        return back()->with('success', 'Budget saved.');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);
        $budget->delete();
        return back()->with('success', 'Budget removed.');
    }
}
