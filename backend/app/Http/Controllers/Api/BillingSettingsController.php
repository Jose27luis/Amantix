<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BillingSettingsRequest;
use App\Http\Resources\ReceivableResource;
use App\Models\Receivable;
use App\Models\Setting;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use App\Services\Billing\BillingSettings;
use App\Services\Billing\NoticeAgenda;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingSettingsController extends Controller
{
    public function show(BillingSettings $ajustes): JsonResponse
    {
        return response()->json([...$ajustes->todo(), 'variables' => BillingSettings::VARIABLES]);
    }

    public function update(BillingSettingsRequest $request, BillingSettings $ajustes, AuditRecorder $auditoria): JsonResponse
    {
        $guardado = $ajustes->guardar($request->validated());
        $registro = Setting::query()->where('clave', BillingSettings::CLAVE)->firstOrFail();
        $auditoria->registrar($this->usuario($request), 'cobranza_configurada', $registro, [
            'dias_anticipacion' => $guardado['dias_anticipacion'],
            'recordatorios' => $guardado['recordatorios'],
        ]);

        return response()->json([...$guardado, 'variables' => BillingSettings::VARIABLES]);
    }

    public function avisos(Request $request, NoticeAgenda $agenda): JsonResponse
    {
        $avisos = array_map(fn (array $aviso): array => [
            'cuenta' => ReceivableResource::make($aviso['cuenta'])->resolve($request),
            'dia_relativo' => $aviso['dia_relativo'],
            'dias_para_vencer' => $aviso['dias_para_vencer'],
            'mensaje' => $aviso['mensaje'],
            'whatsapp' => $aviso['whatsapp'],
            'ultimo_aviso' => $aviso['ultimo_aviso'],
        ], $agenda->deHoy(CarbonImmutable::today()));

        return response()->json(['data' => $avisos]);
    }

    public function marcar(Request $request, Receivable $receivable, NoticeAgenda $agenda): JsonResponse
    {
        $datos = $request->validate(['dia_relativo' => ['required', 'integer', 'min:-30', 'max:60']]);
        $agenda->registrar($receivable, (int) $datos['dia_relativo'], $this->usuario($request));

        return response()->json(['ok' => true], 201);
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
