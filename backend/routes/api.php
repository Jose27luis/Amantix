<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ClientBillingController;
use App\Http\Controllers\Api\ClientSummaryController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CompanyUserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\LeadConversionController;
use App\Http\Controllers\Api\LeadNoteController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\PaymentCaptureController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PublicLeadController;
use App\Http\Controllers\Api\PublicNewsController;
use App\Http\Controllers\Api\PublicProductController;
use App\Http\Controllers\Api\PublicSiteController;
use App\Http\Controllers\Api\SiteImageController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketMessageController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('products', [PublicProductController::class, 'index']);
Route::get('plans', [PlanController::class, 'index']);
Route::get('site-images', [PublicSiteController::class, 'imagenes']);
Route::get('site-images/files/{archivo}', [PublicSiteController::class, 'archivo']);
Route::get('stats', [PublicSiteController::class, 'cifras']);
Route::get('news', [PublicNewsController::class, 'index']);
Route::get('news/images/{archivo}', [PublicNewsController::class, 'imagen']);
Route::get('news/share-images/{archivo}', [PublicNewsController::class, 'imagenCompartir']);
Route::get('news/{slug}', [PublicNewsController::class, 'show']);
Route::post('leads', [PublicLeadController::class, 'store'])->middleware('throttle:leads');

Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::put('auth/password', [AuthController::class, 'cambiarPassword'])->name('auth.password');

    Route::get('tickets', [TicketController::class, 'index']);
    Route::get('tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('tickets/{ticket}/messages', [TicketMessageController::class, 'store'])->middleware('throttle:tickets');
    Route::post('tickets/{ticket}/close', [TicketController::class, 'cerrar']);
    Route::get('tickets/{ticket}/attachments/{attachment}', [AttachmentController::class, 'show']);
    Route::get('billing/payments/{payment}/capture', PaymentCaptureController::class);

    Route::middleware('role:cliente')->prefix('client')->group(function (): void {
        Route::get('summary', ClientSummaryController::class);
        Route::get('billing', [ClientBillingController::class, 'index']);
        Route::post('billing/receivables/{receivable}/payments', [ClientBillingController::class, 'reportar'])->middleware('throttle:tickets');
        Route::post('tickets', [TicketController::class, 'store'])->middleware('throttle:tickets');
    });

    Route::middleware('role:administrador')->prefix('admin')->group(function (): void {
        Route::get('dashboard', [DashboardController::class, 'index']);

        Route::get('leads', [LeadController::class, 'index']);
        Route::get('leads/pending', [LeadController::class, 'pendientes']);
        Route::get('leads/{lead}', [LeadController::class, 'show']);
        Route::patch('leads/{lead}', [LeadController::class, 'update']);
        Route::post('leads/{lead}/notes', [LeadNoteController::class, 'store']);
        Route::post('leads/{lead}/convert', [LeadConversionController::class, 'store']);

        Route::get('companies', [CompanyController::class, 'index']);
        Route::post('companies', [CompanyController::class, 'store']);
        Route::get('companies/{company}', [CompanyController::class, 'show']);
        Route::patch('companies/{company}', [CompanyController::class, 'update']);
        Route::post('companies/{company}/subscriptions', [SubscriptionController::class, 'store']);
        Route::post('companies/{company}/users', [CompanyUserController::class, 'store']);
        Route::patch('subscriptions/{subscription}', [SubscriptionController::class, 'update']);

        Route::get('billing/summary', [BillingController::class, 'resumen']);
        Route::get('billing/receivables', [BillingController::class, 'index']);
        Route::post('billing/receivables', [BillingController::class, 'store']);
        Route::post('billing/receivables/{receivable}/void', [BillingController::class, 'anular']);
        Route::post('billing/receivables/{receivable}/payments', [BillingController::class, 'cobrar']);
        Route::post('billing/receivables/{receivable}/invoice', [BillingController::class, 'emitir']);
        Route::get('billing/payments/pending', [BillingController::class, 'pagosEnRevision']);
        Route::post('billing/payments/{payment}/accept', [BillingController::class, 'aceptar']);
        Route::post('billing/payments/{payment}/reject', [BillingController::class, 'rechazar']);

        Route::get('tickets/pending', [TicketController::class, 'pendientes']);
        Route::patch('tickets/{ticket}', [TicketController::class, 'update']);

        Route::get('news', [NewsController::class, 'index']);
        Route::post('news', [NewsController::class, 'store']);
        Route::get('news/{news}', [NewsController::class, 'show']);
        Route::post('news/{news}', [NewsController::class, 'update']);
        Route::delete('news/{news}', [NewsController::class, 'destroy']);

        Route::get('site-images', [SiteImageController::class, 'index']);
        Route::post('site-images', [SiteImageController::class, 'store']);
        Route::patch('site-images/{siteImage}', [SiteImageController::class, 'update']);
        Route::delete('site-images/{siteImage}', [SiteImageController::class, 'destroy']);

        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::patch('users/{user}', [UserController::class, 'update']);
        Route::post('users/{user}/reset-password', [UserController::class, 'restablecerPassword']);
    });
});
