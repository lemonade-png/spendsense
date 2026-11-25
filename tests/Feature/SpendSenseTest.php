<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SpendSenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_starting_categories(): void
    {
        $this->post(route('register.store'), [
            'name' => 'New Student',
            'email' => 'student@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticated();
        $user = User::whereEmail('student@example.test')->firstOrFail();
        $this->assertSame(11, $user->categories()->count());
        $this->assertDatabaseHas('categories', ['user_id' => $user->id, 'type' => 'expense', 'name' => 'Food']);
    }

    public function test_transaction_crud_recalculates_the_dashboard_and_filters_history(): void
    {
        $user = User::factory()->create();
        $food = $this->category($user, 'Food');
        $salary = $this->category($user, 'Salary', 'income');

        $this->actingAs($user)->post('/transactions', $this->entry($food))->assertRedirect('/transactions');
        $this->post('/transactions', [...$this->entry($salary), 'title' => 'Salary', 'amount' => '10000.10'])
            ->assertRedirect('/transactions');
        $expense = $user->transactions()->where('type', 'expense')->sole();

        $this->get('/transactions?search=Groceries&type=expense&category='.$food->id)
            ->assertInertia(fn (Assert $page) => $page->component('transactions/index')
                ->has('transactions.data', 1)->where('transactions.data.0.id', $expense->id));
        $this->get("/transactions/{$expense->id}/edit")->assertInertia(fn (Assert $page) => $page
            ->component('transactions/form')->where('transaction.notes', 'Weekly shopping'));
        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page->component('dashboard')
            ->where('totals.income', '10000.10')->where('totals.expenses', '6000.05')
            ->where('totals.balance', '4000.05')->where('totals.count', 2));

        $this->put("/transactions/{$expense->id}", [...$this->entry($food), 'amount' => '150.11'])
            ->assertRedirect('/transactions');
        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page->where('totals.balance', '9849.99'));

        $this->delete("/transactions/{$expense->id}")->assertRedirect('/transactions');
        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('totals.expenses', '0.00')->where('totals.balance', '10000.10')->where('totals.count', 1));
    }

    public function test_category_crud_protects_existing_records(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post('/categories', ['name' => 'Food', 'type' => 'expense'])->assertRedirect('/categories');
        $food = $user->categories()->sole();

        $this->get('/categories')->assertInertia(fn (Assert $page) => $page->component('categories')->has('categories', 1));
        $this->put("/categories/{$food->id}", ['name' => 'Groceries', 'type' => 'expense'])->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['id' => $food->id, 'name' => 'Groceries']);

        $this->post('/transactions', $this->entry($food))->assertRedirect('/transactions');
        $this->from('/categories')->delete("/categories/{$food->id}")->assertSessionHasErrors('category');
        $this->put("/categories/{$food->id}", ['name' => 'Groceries', 'type' => 'income'])->assertSessionHasErrors('type');

        $user->transactions()->delete();
        $this->delete("/categories/{$food->id}")->assertRedirect('/categories');
        $this->assertDatabaseMissing('categories', ['id' => $food->id]);
    }

    public function test_budgets_use_matching_month_and_category_and_prevent_duplicates(): void
    {
        $user = User::factory()->create();
        $food = $this->category($user, 'Food');
        $travel = $this->category($user, 'Travel');
        $user->transactions()->create($this->entry($food));
        $user->transactions()->create([...$this->entry($food), 'transaction_date' => '2026-10-31']);
        $user->transactions()->create($this->entry($travel));

        $data = ['category_id' => $food->id, 'amount' => '10000.00', 'month' => 11, 'year' => 2026];
        $this->actingAs($user)->post('/budgets', $data)->assertRedirect('/budgets?period=2026-11');
        $this->post('/budgets', $data)->assertSessionHasErrors('category_id');
        $budget = $user->budgets()->sole();

        $this->get('/budgets?period=2026-11')->assertInertia(fn (Assert $page) => $page->component('budgets')
            ->where('budgets.0.spent', '6000.05')->where('budgets.0.remaining', '3999.95')
            ->where('budgets.0.percentage', 60));

        $this->put("/budgets/{$budget->id}", [...$data, 'amount' => '5000.00'])->assertRedirect('/budgets?period=2026-11');
        $this->get('/budgets?period=2026-11')->assertInertia(fn (Assert $page) => $page
            ->where('budgets.0.remaining', '-1000.05')->where('budgets.0.percentage', 120));
        $this->delete("/budgets/{$budget->id}")->assertRedirect('/budgets?period=2026-11');
        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);

        $this->get('/reports?period=2026-11')->assertInertia(fn (Assert $page) => $page->component('reports')
            ->where('totals.expenses', '12000.10')->has('history', 6)->has('breakdown', 2));
    }

    public function test_records_and_category_choices_are_isolated_by_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $food = $this->category($owner, 'Food');
        $transaction = $owner->transactions()->create($this->entry($food));
        $budget = $owner->budgets()->create(['category_id' => $food->id, 'amount' => '5.00', 'month' => 11, 'year' => 2026]);
        $salary = $this->category($other, 'Salary', 'income');

        $this->get('/transactions')->assertRedirect('/login');
        $this->actingAs($other)->get('/transactions')->assertInertia(fn (Assert $page) => $page->has('transactions.data', 0));
        $this->get("/transactions/{$transaction->id}/edit")->assertNotFound();
        $this->put("/transactions/{$transaction->id}")->assertNotFound();
        $this->delete("/transactions/{$transaction->id}")->assertNotFound();
        $this->put("/categories/{$food->id}")->assertNotFound();
        $this->delete("/categories/{$food->id}")->assertNotFound();
        $this->put("/budgets/{$budget->id}")->assertNotFound();
        $this->delete("/budgets/{$budget->id}")->assertNotFound();
        $this->post('/transactions', $this->entry($food))->assertSessionHasErrors('category_id');
        $this->post('/transactions', [...$this->entry($salary), 'type' => 'expense'])->assertSessionHasErrors('category_id');
        $this->post('/transactions', [...$this->entry($salary), 'amount' => '0'])->assertSessionHasErrors('amount');
        $this->post('/budgets', ['category_id' => $salary->id, 'amount' => '5.00', 'month' => 11, 'year' => 2026])
            ->assertSessionHasErrors('category_id');
    }

    private function category(User $user, string $name, string $type = 'expense'): Category
    {
        return $user->categories()->create(compact('name', 'type'));
    }

    private function entry(Category $category): array
    {
        return [
            'category_id' => $category->id,
            'title' => 'Groceries',
            'type' => $category->type,
            'amount' => '6000.05',
            'transaction_date' => '2026-11-08',
            'notes' => 'Weekly shopping',
        ];
    }
}
