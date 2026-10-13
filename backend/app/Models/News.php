<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\NewsStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class News extends Model
{
    protected $table = 'noticias';

    protected $fillable = [
        'usuario_id',
        'slug',
        'titulo',
        'resumen',
        'contenido',
        'imagen',
        'imagen_ancho',
        'imagen_alto',
        'estado',
        'publicada_en',
    ];

    protected function casts(): array
    {
        return [
            'estado' => NewsStatus::class,
            'imagen_ancho' => 'integer',
            'imagen_alto' => 'integer',
            'publicada_en' => 'datetime',
        ];
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function scopePublicadas(Builder $consulta): Builder
    {
        return $consulta
            ->where('estado', NewsStatus::Publicada)
            ->whereNotNull('publicada_en')
            ->where('publicada_en', '<=', now());
    }

    public function estaPublicada(): bool
    {
        return $this->estado === NewsStatus::Publicada;
    }
}
