export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    currency?: 'USD' | 'PKR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD';
    timezone?: string;
    theme?: 'light' | 'dark' | 'system';
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
