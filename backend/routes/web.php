<?php

declare(strict_types=1);

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('sitemap.xml', SitemapController::class);
