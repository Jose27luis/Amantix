<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\LeadNoteController;
use App\Http\Controllers\Api\PublicLeadController;
use App\Http\Controllers\Api\PublicProductController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('products', [PublicProductController::class, 'index']);
Route::post('leads', [PublicLeadController::class, 'store'])->middleware('throttle:leads');

Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::put('auth/password', [AuthController::class, 'cambiarPassword'])->name('auth.password');

    Route::middleware('role:administrador')->prefix('admin')->group(function (): void {
        Route::get('leads', [LeadController::class, 'index']);
        Route::get('leads/pending', [LeadController::class, 'pendientes']);
        Route::get('leads/{lead}', [LeadController::class, 'show']);
        Route::patch('leads/{lead}', [LeadController::class, 'update']);
        Route::post('leads/{lead}/notes', [LeadNoteController::class, 'store']);

        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::patch('users/{user}', [UserController::class, 'update']);
        Route::post('users/{user}/reset-password', [UserController::class, 'restablecerPassword']);
    });
});
