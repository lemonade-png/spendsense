<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    public const DEFAULTS = [
        'expense' => ['Food', 'Transport', 'Education', 'Shopping', 'Entertainment', 'Bills', 'Other'],
        'income' => ['Salary', 'Freelancing', 'Allowance', 'Other Income'],
    ];

    protected $fillable = ['name', 'type'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
