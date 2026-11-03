import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User } from '@/types/spendsense';

export default function SettingsIndex({ user }: { user: User }) {
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        currency: user.currency || 'PKR',
        timezone: user.timezone || 'Asia/Karachi',
        theme: user.theme || 'system',
    });

    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    return (
        <AppLayout title="Account & Application Settings">
            <Head title="Settings" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={(e) => { e.preventDefault(); profileForm.put('/settings/profile'); }} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-base font-semibold">Profile & Regional Preferences</h2>
                    <div><label className="block text-xs font-medium mb-1">Full Name</label><input type="text" value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">Email Address</label><input type="email" value={profileForm.data.email} onChange={(e) => profileForm.setData('email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Currency</label>
                            <select value={profileForm.data.currency} onChange={(e) => profileForm.setData('currency', e.target.value as NonNullable<User['currency']>)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="PKR">PKR (₨)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="AED">AED</option><option value="CAD">CAD ($)</option><option value="AUD">AUD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Timezone</label>
                            <select value={profileForm.data.timezone} onChange={(e) => profileForm.setData('timezone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="Asia/Karachi">Asia/Karachi</option><option value="UTC">UTC</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option><option value="Asia/Dubai">Asia/Dubai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Theme</label>
                            <select value={profileForm.data.theme} onChange={(e) => profileForm.setData('theme', e.target.value as NonNullable<User['theme']>)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                                <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={profileForm.processing} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Save Preferences</button>
                </form>

                <form onSubmit={(e) => { e.preventDefault(); passwordForm.put('/settings/password', { onSuccess: () => passwordForm.reset() }); }} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-base font-semibold">Update Password</h2>
                    <div><label className="block text-xs font-medium mb-1">Current Password</label><input type="password" value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">New Password</label><input type="password" value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <div><label className="block text-xs font-medium mb-1">Confirm New Password</label><input type="password" value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm" /></div>
                    <button type="submit" disabled={passwordForm.processing} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium">Change Password</button>
                </form>
            </div>
        </AppLayout>
    );
}
