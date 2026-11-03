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
