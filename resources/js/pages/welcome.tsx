import { Head, Link, usePage } from '@inertiajs/react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <main className="grid min-h-svh place-items-center bg-background p-6 text-foreground">
            <Head title="Personal expense and budget tracker" />
            <section className="grid max-w-xl justify-items-start gap-6 rounded-2xl border bg-card p-7 sm:p-12">
                <div className="flex items-center gap-3 font-semibold">
                    <span className="rounded-lg bg-emerald-500/15 p-2 text-emerald-700 dark:text-emerald-400">
                        <Wallet className="size-5" />
                    </span>
                    SpendSense
                </div>
                <div className="grid gap-3">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        Personal expense and budget tracker
                    </h1>
                    <p className="text-muted-foreground">
                        Record income and expenses in PKR, set monthly limits,
                        and see where your money goes.
                    </p>
                </div>
                <nav className="flex flex-wrap gap-3" aria-label="Account">
                    {auth.user ? (
                        <Button asChild>
                            <Link href={dashboard()}>Open dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild>
                                <Link href={register()}>Create account</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={login()}>Log in</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </section>
        </main>
    );
}
