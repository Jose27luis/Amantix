<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Services\Images\ImageStore;

class NewsImageStore extends ImageStore
{
    protected function carpeta(): string
    {
        return 'noticias';
    }
}
