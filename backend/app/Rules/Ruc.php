<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Ruc implements ValidationRule
{
    private const FACTORES = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/^(10|15|16|17|20)\d{9}$/', $value) !== 1) {
            $fail('El RUC debe tener 11 dígitos y empezar con 10, 15, 16, 17 o 20.');

            return;
        }

        $suma = 0;
        foreach (self::FACTORES as $indice => $factor) {
            $suma += (int) $value[$indice] * $factor;
        }

        $resto = 11 - ($suma % 11);
        $digito = $resto === 10 ? 0 : ($resto === 11 ? 1 : $resto);

        if ($digito !== (int) $value[10]) {
            $fail('El RUC no es válido. Revisa los dígitos.');
        }
    }
}
