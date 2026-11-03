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
