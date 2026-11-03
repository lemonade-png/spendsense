#!/usr/bin/env zsh
set -e

mkdir -p app/Services

cat << 'MIG1' > database/migrations/0001_01_01_000000_create_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('currency', 10)->default('PKR');
            $table->string('timezone', 64)->default('Asia/Karachi');
            $table->enum('theme', ['light', 'dark', 'system'])->default('system');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
MIG1

cat << 'MIG2' > database/migrations/2025_01_01_000001_create_categories_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['income', 'expense']);
            $table->string('icon', 50)->default('Wallet');
            $table->string('color', 20)->default('#10b981');
            $table->timestamps();

            $table->unique(['user_id', 'name', 'type']);
            $table->index(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
MIG2

cat << 'MIG3' > database/migrations/2025_01_01_000002_create_transactions_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 15, 2);
            $table->string('title', 150);
            $table->text('notes')->nullable();
            $table->date('transaction_date');
            $table->string('payment_method', 50)->default('Cash');
            $table->timestamps();

            $table->index(['user_id', 'transaction_date']);
            $table->index(['user_id', 'type', 'transaction_date']);
            $table->index(['user_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
MIG3

cat << 'MIG4' > database/migrations/2025_01_01_000003_create_budgets_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('month', 7);
            $table->decimal('amount', 15, 2);
            $table->timestamps();

            $table->unique(['user_id', 'category_id', 'month']);
            $table->index(['user_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
MIG4

cat << 'SVC' > app/Services/FinancialCalculator.php
<?php

namespace App\Services;

class FinancialCalculator
{
    public static function add(string|int|float $a, string|int|float $b): string
    {
        return bcadd(self::normalize($a), self::normalize($b), 2);
    }

    public static function subtract(string|int|float $a, string|int|float $b): string
    {
        return bcsub(self::normalize($a), self::normalize($b), 2);
    }

    public static function percentage(string|int|float $used, string|int|float $limit): string
    {
        $normLimit = self::normalize($limit);
        if (bccomp($normLimit, '0.00', 2) <= 0) {
            return '0.00';
        }
        return bcdiv(bcmul(self::normalize($used), '100', 4), $normLimit, 2);
    }

    public static function normalize(string|int|float|null $value): string
    {
        if ($value === null || $value === '') {
            return '0.00';
        }
        return number_format((float) $value, 2, '.', '');
    }
}
SVC

cat << 'MOD_USER' > app/Models/User.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'currency', 'timezone', 'theme'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function categories(): HasMany { return $this->hasMany(Category::class); }
    public function transactions(): HasMany { return $this->hasMany(Transaction::class); }
    public function budgets(): HasMany { return $this->hasMany(Budget::class); }

    public function seedDefaultCategories(): void
    {
        if ($this->categories()->exists()) {
            return;
        }
        $defaults = [
            ['name' => 'Salary', 'type' => 'income', 'icon' => 'Briefcase', 'color' => '#10b981'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'Laptop', 'color' => '#059669'],
            ['name' => 'Investments', 'type' => 'income', 'icon' => 'TrendingUp', 'color' => '#34d399'],
            ['name' => 'Groceries', 'type' => 'expense', 'icon' => 'ShoppingCart', 'color' => '#ef4444'],
            ['name' => 'Rent & Utilities', 'type' => 'expense', 'icon' => 'Home', 'color' => '#f97316'],
            ['name' => 'Transportation', 'type' => 'expense', 'icon' => 'Car', 'color' => '#eab308'],
            ['name' => 'Dining Out', 'type' => 'expense', 'icon' => 'Utensils', 'color' => '#ec4899'],
            ['name' => 'Healthcare', 'type' => 'expense', 'icon' => 'HeartPulse', 'color' => '#8b5cf6'],
            ['name' => 'Education', 'type' => 'expense', 'icon' => 'GraduationCap', 'color' => '#3b82f6'],
        ];
        foreach ($defaults as $category) {
            $this->categories()->create($category);
        }
    }
}
MOD_USER

cat << 'MOD_CAT' > app/Models/Category.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'name', 'type', 'icon', 'color'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function transactions(): HasMany { return $this->hasMany(Transaction::class); }
    public function budgets(): HasMany { return $this->hasMany(Budget::class); }
}
MOD_CAT

cat << 'MOD_TX' > app/Models/Transaction.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'category_id', 'type', 'amount', 'title', 'notes', 'transaction_date', 'payment_method'];
    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'transaction_date' => 'date:Y-m-d'];
    }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
}
MOD_TX

cat << 'MOD_BUD' > app/Models/Budget.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'category_id', 'month', 'amount'];
    protected function casts(): array { return ['amount' => 'decimal:2']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
}
MOD_BUD

cat << 'CTRL_DASH' > app/Http/Controllers/DashboardController.php
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
CTRL_DASH

cat << 'CTRL_TX' > app/Http/Controllers/TransactionController.php
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
CTRL_TX

cat << 'CTRL_BUD' > app/Http/Controllers/BudgetController.php
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
CTRL_BUD

cat << 'CTRL_CAT' > app/Http/Controllers/CategoryController.php
<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $user->seedDefaultCategories();
        $categories = $user->categories()->withCount('transactions')->withSum('transactions as total_amount', 'amount')->orderBy('type')->orderBy('name')->get();
        return Inertia::render('Categories/Index', ['categories' => $categories]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('categories')->where(fn ($q) => $q->where('user_id', $user->id)->where('type', $request->type))],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'icon' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:20'],
        ]);
        $user->categories()->create($validated);
        return back()->with('success', 'Category created.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        abort_unless($category->user_id === $request->user()->id, 403);
        if ($category->transactions()->exists()) {
            return back()->with('error', 'Cannot delete a category that has recorded transactions.');
        }
        $category->delete();
        return back()->with('success', 'Category deleted.');
    }
}
CTRL_CAT

cat << 'CTRL_REP' > app/Http/Controllers/ReportController.php
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
CTRL_REP

cat << 'CTRL_CAL' > app/Http/Controllers/CalendarController.php
<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $month = $request->string('month', Carbon::now()->format('Y-m'))->toString();
        $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
        $endOfMonth = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();

        $transactions = $user->transactions()->with('category')->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])->orderBy('transaction_date')->orderByDesc('id')->get();
        return Inertia::render('Calendar/Index', ['month' => $month, 'transactions' => $transactions]);
    }
}
CTRL_CAL

cat << 'CTRL_SET' > app/Http/Controllers/SettingsController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Index', ['user' => $request->user()]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'currency' => ['required', Rule::in(['USD', 'PKR', 'EUR', 'GBP', 'AED', 'CAD', 'AUD'])],
            'timezone' => ['required', 'string', 'max:64'],
            'theme' => ['required', Rule::in(['light', 'dark', 'system'])],
        ]);
        $user->update($validated);
        return back()->with('success', 'Profile & preferences updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);
        $request->user()->update(['password' => Hash::make($validated['password'])]);
        return back()->with('success', 'Password changed successfully.');
    }
}
CTRL_SET

cat << 'MIDDLEWARE' > app/Http/Middleware/HandleInertiaRequests.php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => ['user' => $request->user()],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
MIDDLEWARE

cat << 'ROUTES' > routes/web.php
<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
    Route::post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
    Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
ROUTES

/opt/lampp/bin/php artisan migrate:fresh
echo "==> Backend & Database Migrations Completed Successfully!"
