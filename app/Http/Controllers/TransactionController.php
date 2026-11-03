<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\FinancialCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $user->seedDefaultCategories();
        $query = $user->transactions()->with('category');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhere('payment_method', 'like', "%{$search}%");
            });
        }
        if ($request->filled('type') && in_array($request->type, ['income', 'expense'], true)) {
            $query->where('type', $request->type);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->date_to);
        }

        $filteredIncome = (string) ((clone $query)->where('type', 'income')->sum('amount') ?? '0.00');
        $filteredExpenses = (string) ((clone $query)->where('type', 'expense')->sum('amount') ?? '0.00');

        $transactions = $query->orderByDesc('transaction_date')->orderByDesc('id')->paginate(15)->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $user->categories()->orderBy('name')->get(),
            'filters' => $request->only(['search', 'type', 'category_id', 'date_from', 'date_to']),
            'totals' => [
                'income' => FinancialCalculator::normalize($filteredIncome),
                'expenses' => FinancialCalculator::normalize($filteredExpenses),
                'net' => FinancialCalculator::subtract($filteredIncome, $filteredExpenses),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'amount' => ['required', 'numeric', 'gt:0', 'max:999999999999.99'],
            'category_id' => ['required', Rule::exists('categories', 'id')->where(fn ($q) => $q->where('user_id', $user->id))],
            'transaction_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
        $user->transactions()->create($validated);
        return back()->with('success', 'Transaction saved.');
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'amount' => ['required', 'numeric', 'gt:0', 'max:999999999999.99'],
            'category_id' => ['required', Rule::exists('categories', 'id')->where(fn ($q) => $q->where('user_id', $request->user()->id))],
            'transaction_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
        $transaction->update($validated);
        return back()->with('success', 'Transaction updated.');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);
        $transaction->delete();
        return back()->with('success', 'Transaction deleted.');
    }
}
