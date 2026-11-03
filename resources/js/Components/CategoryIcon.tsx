import React from 'react';
import { Wallet, Briefcase, Laptop, TrendingUp, ShoppingCart, Home, Car, Utensils, HeartPulse, GraduationCap, Plane, Gift, Tag } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Wallet, Briefcase, Laptop, TrendingUp, ShoppingCart, Home, Car, Utensils, HeartPulse, GraduationCap, Plane, Gift, Tag,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export default function CategoryIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
    const IconComponent = ICON_MAP[name] || Wallet;
    return <IconComponent className={className} />;
}
