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
