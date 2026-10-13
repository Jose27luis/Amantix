<?php

declare(strict_types=1);

namespace App\Services\Leads;

use App\Enums\LeadStatus;
use App\Enums\Role;
use App\Models\Company;
use App\Models\Lead;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use App\Services\Companies\CompanyService;
use App\Services\Subscriptions\SubscriptionService;
use App\Services\Users\UserAccountService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeadConverter
{
    public function __construct(
        private readonly CompanyService $empresas,
        private readonly SubscriptionService $suscripciones,
        private readonly UserAccountService $usuarios,
        private readonly AuditRecorder $auditoria,
    ) {
    }

    public function convertir(Lead $lead, array $datos, User $autor): array
    {
        if ($lead->empresa_id !== null) {
            throw ValidationException::withMessages(['lead' => 'Este lead ya se convirtió en cliente.']);
        }

        if (User::query()->where('correo', mb_strtolower($lead->correo))->exists()) {
            throw ValidationException::withMessages(['correo' => 'Ya existe un usuario con el correo de este lead.']);
        }

        return DB::transaction(function () use ($lead, $datos, $autor): array {
            $empresa = Company::query()->where('ruc', $datos['ruc'])->first()
                ?? $this->empresas->crear([
                    'razon_social' => $datos['razon_social'],
                    'ruc' => $datos['ruc'],
                    'rubro' => $datos['rubro'] ?? null,
                    'contacto' => $lead->nombre,
                    'telefono' => $lead->telefono,
                    'correo' => $lead->correo,
                ], $autor);

            $suscripcion = $this->suscripciones->crear($empresa, [
                'producto_id' => $datos['producto_id'],
                'plan_id' => $datos['plan_id'],
                'precio' => $datos['precio'],
                'fecha_alta' => $datos['fecha_alta'],
            ], $autor);

            $cuenta = $this->usuarios->crear([
                'nombre' => $lead->nombre,
                'correo' => $lead->correo,
                'rol' => Role::Cliente->value,
                'empresa_id' => $empresa->id,
            ], $autor);

            $anterior = $lead->estado;
            $lead->forceFill(['empresa_id' => $empresa->id, 'estado' => LeadStatus::Ganado, 'motivo_perdida' => null])->save();

            if ($anterior !== LeadStatus::Ganado) {
                $this->auditoria->registrar($autor, 'lead_estado', $lead, ['de' => $anterior->value, 'a' => LeadStatus::Ganado->value]);
            }

            $this->auditoria->registrar($autor, 'lead_convertido', $lead, ['empresa_id' => $empresa->id]);

            return [
                'empresa' => $empresa,
                'suscripcion' => $suscripcion,
                'usuario' => $cuenta['usuario'],
                'password_temporal' => $cuenta['password_temporal'],
            ];
        });
    }
}
