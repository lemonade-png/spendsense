<?php

namespace Database\Seeders;

use App\Actions\Fortify\CreateNewUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(CreateNewUser $register): void
    {
        if (! app()->environment('local')) {
            return;
        }

        $email = 'demo@spendsense.test';
        if (User::query()->where('email', $email)->exists()) {
            $this->command?->info('The SpendSense demo email is already in use.');

            return;
        }

        DB::transaction(function () use ($register, $email): void {
            $user = $register->create([
                'name' => 'SpendSense Demo',
                'email' => $email,
                'password' => 'SpendSenseDemo2026!',
                'password_confirmation' => 'SpendSenseDemo2026!',
            ]);

            $user->markEmailAsVerified();
        });
    }
}
