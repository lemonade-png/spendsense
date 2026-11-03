<?php

namespace App\Services;

class FinancialCalculator
{
    public static function add(string|int|float $a, string|int|float $b): string
    {
        return bcadd(self::normalize($a), self::normalize($b), 2);
    }

    public static function subtract(string|int|float $a, string|int|float $b): string
    {
        return bcsub(self::normalize($a), self::normalize($b), 2);
    }

    public static function percentage(string|int|float $used, string|int|float $limit): string
    {
        $normLimit = self::normalize($limit);
        if (bccomp($normLimit, '0.00', 2) <= 0) {
            return '0.00';
        }
        return bcdiv(bcmul(self::normalize($used), '100', 4), $normLimit, 2);
    }

    public static function normalize(string|int|float|null $value): string
    {
        if ($value === null || $value === '') {
            return '0.00';
        }
        return number_format((float) $value, 2, '.', '');
    }
}
