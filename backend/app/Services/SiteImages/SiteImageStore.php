<?php

declare(strict_types=1);

namespace App\Services\SiteImages;

use App\Services\Images\ImageStore;

class SiteImageStore extends ImageStore
{
    protected function carpeta(): string
    {
        return 'sitio';
    }
}
