import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Wallet, Sparkles, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const fillQuickDemo = () => {
        setData({
            name: 'Sarfaraz Ahmed',
            email: 'sarfaraz@spendsense.local',
            password: 'Password123!',
            password_confirmation: 'Password123!',
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
            <Head title="Create Account — SpendSense" />

            <div className="w-full max-w-md space-y-6 bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500 text-slate-950">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold">SpendSense</span>
                    </div>
                    <button
                        type="button"
                        onClick={fillQuickDemo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Demo Profile
                    </button>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <Link
                        href="/login"
                        className="py-2 text-center text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition"
                    >
                        Sign In
                    </Link>
                    <div className="py-2 text-center text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow">
                        Create Account
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold">Create your SpendSense account</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Default income & expense categories will be automatically created for you.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Sarfaraz Ahmed"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="sarfaraz@spendsense.local"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                        Complete Registration <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
