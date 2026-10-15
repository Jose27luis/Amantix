<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Enums\NewsStatus;
use App\Models\News;
use App\Models\User;
use App\Services\Audit\AuditRecorder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class NewsService
{
    private const LARGO_RESUMEN = 220;

    public function __construct(
        private readonly NewsImageStore $imagenes,
        private readonly AuditRecorder $auditoria,
    ) {
    }

    public function crear(array $datos, UploadedFile $imagen, User $autor): News
    {
        $archivo = $this->imagenes->guardar($imagen);
        $estado = NewsStatus::from($datos['estado']);

        try {
            $noticia = News::query()->create([
                'usuario_id' => $autor->id,
                'slug' => $this->slugUnico($datos['titulo']),
                'titulo' => trim($datos['titulo']),
                'resumen' => $this->resumen($datos['resumen'] ?? null, $datos['contenido']),
                'contenido' => $this->normalizar($datos['contenido']),
                ...$this->columnasImagen($archivo),
                'estado' => $estado,
                'publicada_en' => $estado === NewsStatus::Publicada ? now() : null,
            ]);
        } catch (Throwable $error) {
            $this->imagenes->borrar($archivo['archivo']);
            throw $error;
        }

        $this->auditoria->registrar($autor, 'noticia_creada', $noticia, ['estado' => $estado->value]);

        return $noticia;
    }

    public function actualizar(News $noticia, array $datos, ?UploadedFile $imagen, User $autor): News
    {
        $anterior = $noticia->imagen;
        $nuevaImagen = $imagen === null ? null : $this->imagenes->guardar($imagen);

        try {
            DB::transaction(function () use ($noticia, $datos, $nuevaImagen): void {
                if (isset($datos['titulo'])) {
                    $titulo = trim($datos['titulo']);
                    if (! $noticia->estaPublicada() && $noticia->publicada_en === null && $titulo !== $noticia->titulo) {
                        $noticia->slug = $this->slugUnico($titulo, $noticia->id);
                    }
                    $noticia->titulo = $titulo;
                }

                if (isset($datos['contenido'])) {
                    $noticia->contenido = $this->normalizar($datos['contenido']);
                }

                if (array_key_exists('resumen', $datos) || isset($datos['contenido'])) {
                    $noticia->resumen = $this->resumen($datos['resumen'] ?? null, $noticia->contenido);
                }

                if (isset($datos['estado'])) {
                    $estado = NewsStatus::from($datos['estado']);
                    $noticia->estado = $estado;
                    if ($estado === NewsStatus::Publicada && $noticia->publicada_en === null) {
                        $noticia->publicada_en = now();
                    }
                }

                if ($nuevaImagen !== null) {
                    $noticia->fill($this->columnasImagen($nuevaImagen));
                }

                $noticia->save();
            });
        } catch (Throwable $error) {
            if ($nuevaImagen !== null) {
                $this->imagenes->borrar($nuevaImagen['archivo']);
            }
            throw $error;
        }

        if ($nuevaImagen !== null) {
            $this->imagenes->borrar($anterior);
        }

        $this->auditoria->registrar($autor, 'noticia_actualizada', $noticia, ['estado' => $noticia->estado->value]);

        return $noticia;
    }

    public function borrar(News $noticia, User $autor): void
    {
        $imagen = $noticia->imagen;
        $this->auditoria->registrar($autor, 'noticia_borrada', $noticia, ['titulo' => $noticia->titulo]);
        $noticia->delete();
        $this->imagenes->borrar($imagen);
    }

    private function columnasImagen(array $archivo): array
    {
        return [
            'imagen' => $archivo['archivo'],
            'imagen_ancho' => $archivo['ancho'],
            'imagen_alto' => $archivo['alto'],
        ];
    }

    private function slugUnico(string $titulo, ?int $ignorar = null): string
    {
        $base = Str::limit(Str::slug($titulo), 120, '');
        $base = $base === '' ? 'noticia' : rtrim($base, '-');
        $slug = $base;
        $contador = 2;

        while (News::query()->where('slug', $slug)->when($ignorar !== null, fn (Builder $consulta): Builder => $consulta->whereKeyNot($ignorar))->exists()) {
            $slug = $base.'-'.$contador;
            $contador++;
        }

        return $slug;
    }

    private function resumen(?string $resumen, string $contenido): string
    {
        $texto = trim((string) $resumen);

        if ($texto === '') {
            $lineas = array_map(
                static fn (string $linea): string => trim(preg_replace('/^(?:[-•*▪▫◦➤►→✓✔✅]|\d{1,2}[.)])\s+/u', '', trim($linea)) ?? $linea),
                explode("\n", $contenido),
            );
            $plano = implode(' ', array_filter($lineas, static fn (string $linea): bool => $linea !== ''));
            $plano = preg_replace('/\*\*(.+?)\*\*/u', '$1', $plano) ?? $plano;
            $plano = preg_replace('/https?:\/\/\S+/u', '', $plano) ?? $plano;
            $plano = preg_replace('/\s+([.,;:])/u', '$1', $plano) ?? $plano;
            $texto = trim(preg_replace('/\s+/u', ' ', $plano) ?? $plano);
        }

        return Str::limit($texto, self::LARGO_RESUMEN, '…');
    }

    private function normalizar(string $contenido): string
    {
        $texto = str_replace(["\r\n", "\r"], "\n", $contenido);
        $texto = preg_replace("/\n{3,}/u", "\n\n", $texto) ?? $texto;

        return trim($texto);
    }
}
