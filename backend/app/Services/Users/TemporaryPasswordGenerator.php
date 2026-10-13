<?php

declare(strict_types=1);

namespace App\Services\Users;

class TemporaryPasswordGenerator
{
    private const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

    public function generar(int $longitud = 12): string
    {
        $maximo = strlen(self::ALFABETO) - 1;
        $password = '';

        for ($i = 0; $i < $longitud; $i++) {
            $password .= self::ALFABETO[random_int(0, $maximo)];
        }

        return $password;
    }
}
