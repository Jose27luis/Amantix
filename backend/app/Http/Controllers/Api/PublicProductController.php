<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProductSummaryResource::collection(
            Product::query()->where('visible', true)->orderBy('orden')->get()
        );
    }
}
