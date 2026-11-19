<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Models\Setting;

class BillingSettings
{
    public const CLAVE = 'cobranza';

    public const VARIABLES = ['{cliente}', '{concepto}', '{monto}', '{vence}', '{enlace}'];

    private const MENSAJE = 'Hola, {cliente}. Le recordamos su pago de {concepto} por {monto}, con vencimiento el {vence}. '
        .'Puede pagar y subir su comprobante en {enlace}. Gracias, Amantix.';

    private ?array $cache = null;

    public function todo(): array
    {
        if ($this->cache !== null) {
            return $this->cache;
        }

        $guardado = Setting::query()->where('clave', self::CLAVE)->value('valor');
        $valores = is_array($guardado) ? $guardado : [];

        $this->cache = [
            'dias_anticipacion' => (int) ($valores['dias_anticipacion'] ?? config('services.cobranza.dias_anticipacion')),
            'recordatorios' => $this->normalizarDias($valores['recordatorios'] ?? [-3, 0, 3]),
            'mensaje' => is_string($valores['mensaje'] ?? null) && trim($valores['mensaje']) !== '' ? $valores['mensaje'] : self::MENSAJE,
        ];

        return $this->cache;
    }

    public function guardar(array $datos): array
    {
        $nuevo = [...$this->todo(), ...array_intersect_key($datos, array_flip(['dias_anticipacion', 'recordatorios', 'mensaje']))];
        $nuevo['dias_anticipacion'] = (int) $nuevo['dias_anticipacion'];
        $nuevo['recordatorios'] = $this->normalizarDias($nuevo['recordatorios']);

        Setting::query()->updateOrCreate(['clave' => self::CLAVE], ['valor' => $nuevo]);
        $this->cache = null;

        return $this->todo();
    }

    public function diasAnticipacion(): int
    {
        return $this->todo()['dias_anticipacion'];
    }

    public function recordatorios(): array
    {
        return $this->todo()['recordatorios'];
    }

    public function mensaje(array $valores): string
    {
        return str_replace(self::VARIABLES, [
            $valores['cliente'] ?? '',
            $valores['concepto'] ?? '',
            $valores['monto'] ?? '',
            $valores['vence'] ?? '',
            $valores['enlace'] ?? '',
        ], $this->todo()['mensaje']);
    }

    private function normalizarDias(mixed $dias): array
    {
        $lista = array_map('intval', is_array($dias) ? $dias : []);
        $lista = array_values(array_unique(array_filter($lista, static fn (int $dia): bool => $dia >= -30 && $dia <= 60)));
        sort($lista);

        return $lista;
    }
}
