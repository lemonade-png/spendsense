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
