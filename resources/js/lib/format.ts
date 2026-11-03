export function formatCurrency(amount: string | number, currency: string = 'PKR'): string {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numeric)) return `${currency} 0.00`;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric);
}
