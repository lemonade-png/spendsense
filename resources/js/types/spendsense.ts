import { User as BaseUser } from './index';
export type User = BaseUser;

export interface Category {
    id: number;
    user_id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    transactions_count?: number;
    total_amount?: string | null;
}

export interface Transaction {
    id: number;
    user_id: number;
    category_id: number;
    type: 'income' | 'expense';
    amount: string;
    title: string;
    notes: string | null;
    transaction_date: string;
    payment_method: string;
    category?: Category;
}

export interface BudgetItem {
    id: number;
    category_id: number | null;
    category_name: string;
    category_color: string;
    category_icon: string;
    month: string;
    limit: string;
    spent: string;
    remaining: string;
    usage_percentage: number;
}
