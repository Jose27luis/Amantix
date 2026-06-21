# Amantix — Sitio web corporativo

Sitio web institucional de **Amantix**, empresa de desarrollo de software que crea y comercializa sistemas de gestión empresarial. El sitio presenta la empresa, su catálogo de productos y capta clientes (leads) para la venta de los sistemas.

---

## 1. Objetivo del sitio

Una web de **marketing + captación** (no es uno de los sistemas en sí) que:

- Presenta a Amantix y su propuesta de valor.
- Muestra el **catálogo de productos** (3 sistemas) con sus funcionalidades, planes y casos de uso.
- Permite **solicitar una demo / cotización** y contactar a ventas.
- Sirve de punto de entrada (con enlaces) a cada sistema en producción.

---

## 2. Productos de Amantix (catálogo)

El sitio documenta y vende tres sistemas propios:

### 2.1. Facturador Amantix
> Sistema base: `pro8`

Sistema de **facturación electrónica** integral para Perú, conectado a **SUNAT**.

- Comprobantes electrónicos (factura, boleta, nota de crédito/débito), guías de remisión (GRE).
- Multi-tenant: cada empresa cliente opera con su propio RUC y base de datos aislada.
- **SIRE** — extracción del Registro de Compras/Ventas electrónico desde SUNAT.
- Inventario, almacenes, listas de precios, POS, reportes y panel del contador.
- Stack del sistema: Laravel + frontend SPA + MySQL (multi-tenant `hyn/tenancy`).
- En producción: `facturito.tokefact.pe`.

### 2.2. Restaurant Sumaqta
> Sistema base: `mozo4`

Sistema de **gestión para restaurantes** (punto de venta gastronómico).

- Toma de comandas desde el celular del mozo; impresión en cocina/caja.
- Gestión de mesas, salones, carta/menú, pedidos y cuentas.
- Impresión de comandas (la PC con la app imprime vía QZ Tray; el celular registra la orden).
- Integración con facturación electrónica para emitir el comprobante.
- En producción: `sumaq.tokefact.pe`.

### 2.3. Agente Amantix
> Sistema base: `agente`

Plataforma SaaS para operar **agentes multibancarios** en Perú.

- Multi-tenant por subdominio (`empresa.midominio.pe`), cada cliente con su BD aislada.
- Cajeros registran ingreso/salida de dinero contra múltiples billeteras (BBVA, BCP, Yape, Plin, Western Union, efectivo, etc.).
- Emisión de boletas SUNAT, préstamos y cierre de caja diario.
- Panel de administración central + panel por empresa.
- En producción: `agente.tokefacts.com` (+ `admin.agente.tokefacts.com`).

---

## 3. Tecnologías del sitio web

| Capa | Tecnología |
|---|---|
| **Frontend** | **Angular** (SSR para SEO) + TypeScript |
| **Backend / API** | **Laravel** (PHP) — API REST para formularios de contacto/leads |
| **Base de datos** | MySQL |
| **Estilos** | (a definir: Tailwind / SCSS) |
| **Servidor web** | nginx |
| **Despliegue** | servidor propio (VPS) + dominio Amantix |

> Misma base tecnológica que los productos (Angular + Laravel), para reutilizar conocimiento y componentes.

---

## 4. Estructura del sitio (secciones / páginas)

| Página | Contenido |
|---|---|
| **Inicio (Home)** | Hero con propuesta de valor, resumen de los 3 productos, CTA "Solicitar demo". |
| **Productos** | Listado de los 3 sistemas con tarjetas (icono, nombre, descripción corta). |
| **Producto — Facturador Amantix** | Detalle, funcionalidades, capturas, planes, CTA. |
| **Producto — Restaurant Sumaqta** | Detalle, funcionalidades, capturas, planes, CTA. |
| **Producto — Agente Amantix** | Detalle, funcionalidades, capturas, planes, CTA. |
| **Planes / Precios** | Comparativa de planes por producto. |
| **Nosotros** | Quiénes somos, misión, equipo. |
| **Contacto** | Formulario (nombre, empresa, correo, teléfono, producto de interés, mensaje) → guarda lead y notifica por correo/WhatsApp. |
| **Demo / Cotización** | Formulario de solicitud de demo o cotización. |

Elementos transversales: navbar con logo + menú, footer con contacto/redes, botón flotante de WhatsApp.

---

## 5. Estructura del proyecto (propuesta)

```
Amantix/
  frontend/            # Angular (SSR)
    src/app/
      pages/           # home, productos, producto-detalle, planes, nosotros, contacto
      components/       # navbar, footer, product-card, cta, hero, whatsapp-button
      services/        # api (contacto/leads), seo
    angular.json
  backend/             # Laravel (API)
    app/Http/Controllers/  # ContactController, LeadController
    routes/api.php          # POST /contact, POST /demo
    database/migrations/    # leads
  nginx/               # vhost del sitio
  README.md
```

(La estructura final se ajusta al implementar; esta es la guía inicial.)

---

## 6. Funcionalidades del sitio (alcance)

- **SEO**: Angular SSR, metadatos por página, sitemap, Open Graph (importante por ser sitio de venta).
- **Catálogo de productos** con páginas de detalle.
- **Captación de leads**: formularios de contacto y de demo → se guardan en BD (tabla `leads`) y se notifican por correo (y opcionalmente WhatsApp).
- **Responsive** (móvil/escritorio).
- **Multi-idioma** (opcional, a futuro): español por defecto.
- **Integración**: enlaces directos a cada sistema en producción.

---

## 7. Datos de leads (tabla `leads`)

```
id, name, company, email, phone, product_interest (facturador|restaurant|agente),
message, source (contacto|demo|cotizacion), created_at, updated_at
```

---

## 8. Productos y dominios de producción (referencia)

| Producto en el sitio | Sistema | Dominio en producción |
|---|---|---|
| Facturador Amantix | pro8 | `facturito.tokefact.pe` |
| Restaurant Sumaqta | mozo4 | `sumaq.tokefact.pe` |
| Agente Amantix | agente | `agente.tokefacts.com` |

---

## 9. Próximos pasos

1. Inicializar el proyecto Angular (SSR) en `frontend/` y la API Laravel en `backend/`.
2. Definir identidad visual (logo, paleta, tipografía) de Amantix.
3. Maquetar Home + páginas de producto.
4. Implementar formularios de contacto/demo → API `leads` + notificación.
5. Configurar SEO (SSR, metadatos, sitemap) y desplegar con nginx en el dominio Amantix.
