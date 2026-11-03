import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Wallet, ShieldCheck, TrendingUp, PieChart, ArrowRight, UserPlus } from 'lucide-react';

export default function Login({ status }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 text-slate-100">
            <Head title="Sign In — SpendSense" />

            {/* Left Brand Showcase */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-r border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">SpendSense</span>
                </div>

                <div className="space-y-6 max-w-lg">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        BSCS Full-Stack Financial Suite
                    </span>
                    <h1 className="text-4xl font-extrabold leading-tight">
                        Precision Expense Tracking & Smart Budgeting.
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Built with Laravel, React, TypeScript, Inertia.js, and XAMPP MariaDB using exact decimal arithmetic for zero floating-point drift.
                    </p>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold">Real-Time Cash Flow Analytics</h3>
                                <p className="text-xs text-slate-400">Interactive 6-month trend bars, savings rates, and daily burn rate metrics.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                            <PieChart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold">Category & Monthly Budget Guardrails</h3>
                                <p className="text-xs text-slate-400">Visual progress bars that alert you before you cross 80% or 100% of your budget.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold">Private Multi-User Isolation</h3>
                                <p className="text-xs text-slate-400">Strict per-user database scoping with instant CSV export.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-500">© {new Date().getFullYear()} SpendSense • Powered by Laravel & XAMPP</p>
            </div>

            {/* Right Login Form */}
            <div className="flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Mode Switcher Tabs */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="py-2.5 text-center text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow">
                            Sign In
                        </div>
                        <Link
                            href="/register"
                            className="py-2.5 text-center text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition"
                        >
                            Create Account
                        </Link>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">Welcome back</h2>
                        <p className="text-sm text-slate-400 mt-1">Sign in to access your financial dashboard</p>
                    </div>

                    {status && (
                        <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                            />
                            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                            />
                            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-900 text-emerald-600"
                                />
                                Remember me on this device
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                        >
                            Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="pt-4 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-400 mb-3">First time using SpendSense?</p>
                        <Link
                            href="/register"
                            className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/60 hover:bg-slate-900 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 transition"
                        >
                            <UserPlus className="w-4 h-4 text-emerald-400" /> Register a New Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
