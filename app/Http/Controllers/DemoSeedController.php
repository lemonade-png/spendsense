<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DemoSeedController extends Controller
{
    public function seed(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->seedDefaultCategories();

        $categories = $user->categories()->get()->keyBy('name');

        $salaryCat = $categories['Salary'] ?? $user->categories()->where('type', 'income')->first();
        $freelanceCat = $categories['Freelance'] ?? $salaryCat;
        $groceryCat = $categories['Groceries'] ?? $user->categories()->where('type', 'expense')->first();
        $rentCat = $categories['Rent & Utilities'] ?? $groceryCat;
        $transportCat = $categories['Transportation'] ?? $groceryCat;
        $diningCat = $categories['Dining Out'] ?? $groceryCat;
        $eduCat = $categories['Education'] ?? $groceryCat;

        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthStr = $monthDate->format('Y-m');

            // Overall & Category Budgets
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => null, 'month' => $monthStr],
                ['amount' => 120000]
            );
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => $groceryCat->id, 'month' => $monthStr],
                ['amount' => 35000]
            );
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => $diningCat->id, 'month' => $monthStr],
                ['amount' => 15000]
            );

            // Monthly Salary
            $user->transactions()->create([
                'category_id' => $salaryCat->id,
                'type' => 'income',
                'amount' => 145000,
                'title' => 'Monthly Software Dev Salary',
                'notes' => 'Direct bank deposit',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(1)->toDateString(),
                'payment_method' => 'Bank Transfer',
            ]);

            // Freelance side income
            $user->transactions()->create([
                'category_id' => $freelanceCat->id,
                'type' => 'income',
                'amount' => rand(25, 55) * 1000,
                'title' => 'React & Laravel Client Milestone',
                'notes' => 'Upwork / direct client invoice',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(14)->toDateString(),
                'payment_method' => 'Bank Transfer',
            ]);

            // Rent & Utilities
            $user->transactions()->create([
                'category_id' => $rentCat->id,
                'type' => 'expense',
                'amount' => 38000 + rand(0, 4000),
                'title' => 'House Rent, Electricity & Fiber Internet',
                'notes' => 'Monthly fixed utility bills',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(4)->toDateString(),
                'payment_method' => 'Bank Transfer',
            ]);

            // Groceries (2 trips per month)
            $user->transactions()->create([
                'category_id' => $groceryCat->id,
                'type' => 'expense',
                'amount' => rand(14, 19) * 1000,
                'title' => 'Monthly Mart Grocery Stockup',
                'notes' => 'Staples, household supplies & fresh produce',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(7)->toDateString(),
                'payment_method' => 'Debit Card',
            ]);

            $user->transactions()->create([
                'category_id' => $groceryCat->id,
                'type' => 'expense',
                'amount' => rand(9, 14) * 1000,
                'title' => 'Mid-Month Fresh Groceries & Dairy',
                'notes' => 'Weekly essentials',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(19)->toDateString(),
                'payment_method' => 'Cash',
            ]);

            // Fuel & Transport
            $user->transactions()->create([
                'category_id' => $transportCat->id,
                'type' => 'expense',
                'amount' => rand(8, 13) * 1000,
                'title' => 'Fuel & Commute Refills',
                'notes' => 'PSO / Total Parco fuel station',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(11)->toDateString(),
                'payment_method' => 'Cash',
            ]);

            // Dining Out
            $user->transactions()->create([
                'category_id' => $diningCat->id,
                'type' => 'expense',
                'amount' => rand(5, 12) * 1000,
                'title' => 'Weekend Dinner & Coffee with Friends',
                'notes' => 'Restaurant & cafe',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(22)->toDateString(),
                'payment_method' => 'Mobile Wallet',
            ]);

            // Cloud & University
            $user->transactions()->create([
                'category_id' => $eduCat->id,
                'type' => 'expense',
                'amount' => rand(4, 9) * 1000,
                'title' => 'Books, Cloud Lab Credits & Course Material',
                'notes' => 'Semester project resources',
                'transaction_date' => $monthDate->copy()->startOfMonth()->addDays(16)->toDateString(),
                'payment_method' => 'Debit Card',
            ]);
        }

        return back()->with('success', 'Populated 6 months of realistic income, expenses, and budgets!');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $user = $request->user();
        $transactions = $user->transactions()
            ->with('category')
            ->orderByDesc('transaction_date')
            ->get();

        $filename = 'spendsense-transactions-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes']);

            foreach ($transactions as $tx) {
                fputcsv($handle, [
                    $tx->transaction_date,
                    $tx->title,
                    strtoupper($tx->type),
                    $tx->category?->name ?? 'Uncategorized',
                    $tx->amount,
                    $tx->payment_method,
                    $tx->notes ?? '',
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
