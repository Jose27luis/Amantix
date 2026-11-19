<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'ajustes';

    protected $fillable = [
        'clave',
        'valor',
    ];

    protected function casts(): array
    {
        return [
            'valor' => 'array',
        ];
    }
}
