<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IntegrationController extends Controller
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function index(): JsonResponse
    {
        $integraciones = Integration::query()->with('producto')->orderBy('id')->get();

        return response()->json(['data' => $integraciones->map(fn (Integration $i): array => $this->datos($i))->all()]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'min:2', 'max:80'],
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'prefijo_cuenta' => ['required', 'string', 'regex:/^[a-z0-9]{2,20}$/', Rule::unique('integraciones', 'prefijo_cuenta')],
        ]);

        $token = $this->token();
        $integracion = Integration::query()->create([
            ...$datos,
            'token_hash' => hash('sha256', $token),
            'token_inicio' => substr($token, 0, 12),
            'activo' => true,
        ]);

        $this->auditoria->registrar($this->usuario($request), 'integracion_creada', $integracion, ['nombre' => $integracion->nombre]);

        return response()->json([...$this->datos($integracion->load('producto')), 'token' => $token], 201);
    }

    public function update(Request $request, Integration $integration): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['sometimes', 'string', 'min:2', 'max:80'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        $integration->fill($datos)->save();
        $this->auditoria->registrar($this->usuario($request), 'integracion_actualizada', $integration, $datos);

        return response()->json($this->datos($integration->load('producto')));
    }

    public function renovar(Request $request, Integration $integration): JsonResponse
    {
        $token = $this->token();
        $integration->forceFill([
            'token_hash' => hash('sha256', $token),
            'token_inicio' => substr($token, 0, 12),
        ])->save();

        $this->auditoria->registrar($this->usuario($request), 'integracion_llave_renovada', $integration);

        return response()->json([...$this->datos($integration->load('producto')), 'token' => $token]);
    }

    private function datos(Integration $integracion): array
    {
        return [
            'id' => $integracion->id,
            'nombre' => $integracion->nombre,
            'producto' => $integracion->producto?->nombre,
            'prefijo_cuenta' => $integracion->prefijo_cuenta,
            'token_inicio' => $integracion->token_inicio,
            'activo' => $integracion->activo,
            'ultimo_uso_at' => $integracion->ultimo_uso_at?->toIso8601String(),
        ];
    }

    private function token(): string
    {
        return 'amx_'.bin2hex(random_bytes(24));
    }

    private function usuario(Request $request): User
    {
        $usuario = $request->user();
        abort_unless($usuario instanceof User, 401);

        return $usuario;
    }
}
