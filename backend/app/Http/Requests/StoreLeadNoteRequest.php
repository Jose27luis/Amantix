<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadNoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nota' => ['required', 'string', 'max:3000'],
        ];
    }
}
