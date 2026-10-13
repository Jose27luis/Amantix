<?php

declare(strict_types=1);

namespace App\Services\Leads;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Product;
use App\Services\Audit\AuditRecorder;
use Illuminate\Support\Str;

class LeadRegistrar
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function registrar(array $datos, ?string $ip): Lead
    {
        $producto = isset($datos['producto'])
            ? Product::query()->where('slug', $datos['producto'])->first()
            : null;

        $lead = Lead::query()->create([
            'codigo' => $this->generarCodigo(),
            'producto_id' => $producto?->id,
            'nombre' => $datos['nombre'],
            'empresa' => $datos['empresa'] ?? null,
            'correo' => Str::lower($datos['correo']),
            'telefono' => $datos['telefono'] ?? null,
            'mensaje' => $datos['mensaje'],
            'origen' => LeadSource::from($datos['origen'] ?? LeadSource::Contacto->value),
            'estado' => LeadStatus::Nuevo,
            'ip' => $ip,
        ]);

        $this->auditoria->registrar(null, 'lead_recibido', $lead, ['origen' => $lead->origen->value]);

        return $lead;
    }

    private function generarCodigo(): string
    {
        do {
            $codigo = 'AMX-'.Str::upper(Str::random(6));
        } while (Lead::query()->where('codigo', $codigo)->exists());

        return $codigo;
    }
}
