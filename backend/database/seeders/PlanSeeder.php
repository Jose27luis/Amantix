<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\BillingPeriod;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            [
                'nombre' => 'Esencial',
                'precio' => 80,
                'descripcion' => 'Para empezar a facturar y operar con un solo sistema.',
                'caracteristicas' => ['Un sistema a elección', 'Multi-tenant por RUC', 'Comprobantes SUNAT', 'Soporte por WhatsApp'],
                'destacado' => false,
            ],
            [
                'nombre' => 'Negocio',
                'precio' => 100,
                'descripcion' => 'Para negocios en crecimiento que combinan sistemas.',
                'caracteristicas' => ['Hasta dos sistemas', 'SIRE y reportes', 'Capacitación inicial', 'Soporte prioritario', 'Cierre de caja diario'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Corporativo',
                'precio' => 120,
                'descripcion' => 'Para operaciones grandes con varios locales.',
                'caracteristicas' => ['Los tres sistemas', 'Multi-local', 'Integraciones a medida', 'Acompañamiento dedicado', 'Auditoría de seguridad'],
                'destacado' => false,
            ],
        ];

        foreach ($planes as $orden => $plan) {
            Plan::query()->updateOrCreate(
                ['nombre' => $plan['nombre']],
                [...$plan, 'periodo' => BillingPeriod::Mensual, 'orden' => $orden + 1, 'visible' => true],
            );
        }
    }
}
