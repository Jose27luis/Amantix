<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private const PAGINAS = [
        ['ruta' => '/', 'frecuencia' => 'weekly', 'prioridad' => '1.0'],
        ['ruta' => '/productos', 'frecuencia' => 'monthly', 'prioridad' => '0.9'],
        ['ruta' => '/planes', 'frecuencia' => 'monthly', 'prioridad' => '0.9'],
        ['ruta' => '/noticias', 'frecuencia' => 'weekly', 'prioridad' => '0.8'],
        ['ruta' => '/nosotros', 'frecuencia' => 'yearly', 'prioridad' => '0.6'],
        ['ruta' => '/contacto', 'frecuencia' => 'yearly', 'prioridad' => '0.7'],
    ];

    public function __invoke(): Response
    {
        $base = rtrim((string) config('app.url'), '/');
        $ultimaNoticia = News::query()->publicadas()->max('updated_at');

        $entradas = array_map(
            static fn (array $pagina): array => [
                'loc' => $base.($pagina['ruta'] === '/' ? '/' : $pagina['ruta']),
                'lastmod' => in_array($pagina['ruta'], ['/', '/noticias'], true) && is_string($ultimaNoticia)
                    ? substr($ultimaNoticia, 0, 10)
                    : null,
                'changefreq' => $pagina['frecuencia'],
                'priority' => $pagina['prioridad'],
            ],
            self::PAGINAS,
        );

        foreach (Product::query()->where('visible', true)->orderBy('orden')->get(['slug', 'updated_at']) as $producto) {
            $entradas[] = [
                'loc' => $base.'/productos/'.$producto->slug,
                'lastmod' => $producto->updated_at?->toDateString(),
                'changefreq' => 'monthly',
                'priority' => '0.9',
            ];
        }

        foreach (News::query()->publicadas()->orderByDesc('publicada_en')->get(['slug', 'updated_at']) as $noticia) {
            $entradas[] = [
                'loc' => $base.'/noticias/'.$noticia->slug,
                'lastmod' => $noticia->updated_at?->toDateString(),
                'changefreq' => 'yearly',
                'priority' => '0.6',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($entradas as $entrada) {
            $xml .= '  <url><loc>'.htmlspecialchars($entrada['loc'], ENT_XML1).'</loc>';
            if ($entrada['lastmod'] !== null) {
                $xml .= '<lastmod>'.$entrada['lastmod'].'</lastmod>';
            }
            $xml .= '<changefreq>'.$entrada['changefreq'].'</changefreq><priority>'.$entrada['priority'].'</priority></url>'."\n";
        }
        $xml .= '</urlset>'."\n";

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
