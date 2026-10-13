<?php

declare(strict_types=1);

namespace App\Services\Companies;

use App\Models\Company;
use App\Models\User;
use App\Services\Audit\AuditRecorder;

class CompanyService
{
    public function __construct(private readonly AuditRecorder $auditoria)
    {
    }

    public function crear(array $datos, User $autor): Company
    {
        $empresa = Company::query()->create($this->normalizar($datos));

        $this->auditoria->registrar($autor, 'empresa_creada', $empresa, ['ruc' => $empresa->ruc]);

        return $empresa;
    }

    public function actualizar(Company $empresa, array $datos, User $autor): Company
    {
        $empresa->fill($this->normalizar($datos));
        $cambios = array_keys($empresa->getDirty());
        $empresa->save();

        if ($cambios !== []) {
            $this->auditoria->registrar($autor, 'empresa_actualizada', $empresa, ['campos' => $cambios]);
        }

        return $empresa;
    }

    private function normalizar(array $datos): array
    {
        if (array_key_exists('correo', $datos) && $datos['correo'] !== null) {
            $datos['correo'] = mb_strtolower(trim($datos['correo']));
        }

        if (array_key_exists('razon_social', $datos)) {
            $datos['razon_social'] = trim($datos['razon_social']);
        }

        return $datos;
    }
}
