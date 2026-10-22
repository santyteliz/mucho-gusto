# Mucho Gusto · Delivery Miramar — demo web

Sitio estático (HTML + CSS + JS, sin dependencias ni build) preparado como demo comercial por Web Wisse.

## Cómo verlo

```bash
node serve.mjs
```

Abrir http://localhost:5173. También se puede subir la carpeta tal cual a cualquier hosting estático (Netlify, Vercel, GitHub Pages, Hostinger). `serve.mjs` y `.claude/` son sólo para desarrollo local y no hace falta publicarlos.

## Estructura

| Archivo | Qué contiene |
| --- | --- |
| `index.html` | Estructura semántica, metadatos SEO y Open Graph, iconos SVG |
| `css/styles.css` | Sistema visual (tokens en `:root`), secciones, responsive y animaciones |
| `js/config.js` | **Todos los datos editables**: WhatsApp, Instagram, dirección, horarios, pagos, modalidades y menú |
| `js/app.js` | Menú por categorías, comanda, mensaje de WhatsApp, navegación móvil, barra de pedido |
| `assets/logo.png` | Logo original (también se usa como favicon) |

## Qué editar en `js/config.js`

- `contact.whatsapp`: número oficial, sólo dígitos con código de país (ej. `5492291000000`). Vacío = la web avisa que falta y los botones abren WhatsApp sin destinatario.
- `contact.address.verified`: pasar a `true` cuando el cliente confirme la dirección. Así se muestra el enlace a Google Maps y desaparece la etiqueta "a confirmar".
- `contact.hours`: lista de `{ days, hours }`.
- `categories[].items[]`: `name`, `desc`, `price` (número en pesos) e `image` (ruta). Con precios cargados, la comanda calcula el subtotal y lo incluye en el mensaje.
- `menuIsDemo`: pasar a `false` cuando el menú sea el real, para ocultar el aviso de muestra.
- `photosAreDemo`: las fotos actuales son de referencia (Unsplash, ver `CREDITS.md`) y llevan la etiqueta "Foto de referencia". Para pasar a las fotos reales, reemplazar los archivos en `assets/photos/` (mismo nombre o nueva ruta en `config.js`) y poner `photosAreDemo: false`. La foto del hero y las de "Pedí desde donde estés" están en `index.html`.

## Deploy en Vercel

Importar el repositorio en Vercel con el preset **Other**, sin comando de build y con el directorio raíz del proyecto como salida. Es un sitio estático: Vercel publica `index.html` directamente.
- Para quitar la barra superior de "Demo comercial", borrar el `<div class="demo-bar">` en `index.html`.

## Implementado

- Hero editorial con composición propia para escritorio, tablet y móvil.
- Menú por categorías con agregar, sumar, restar y quitar productos.
- Comanda con modalidad (delivery, take away, playa), nombre, dirección o ubicación en la playa y medio de pago.
- Mensaje de WhatsApp generado y codificado (`encodeURIComponent`). La comanda se recuerda en el navegador.
- Barra fija de pedido en móvil y tablet, que se oculta cuando está visible el CTA del hero, la comanda o el footer.
- Header que se compacta al bajar, menú móvil accesible (Escape lo cierra) y sección activa marcada en la navegación.
- Animaciones de entrada y aparición al hacer scroll, desactivadas con `prefers-reduced-motion`.
- Revisado en 360, 390, 430, 768, 1366 y 1920 px, sin scroll horizontal y con el CTA principal visible en el primer pantallazo.

## Contenido de muestra (pedir al cliente)

- Número oficial de WhatsApp. Los teléfonos de directorios (02291 54-2052 / 02291 43-2462) no se usan sin confirmar.
- Menú real: nombres, descripciones, precios (destacado "Menú" de Instagram).
- Horarios (destacado "Horarios") y zona de delivery.
- Dirección: Diagonal Fortunato de la Plaza 1601 sale sólo de directorios.
- Fotos originales de los platos en buena resolución, y logo en vector o PNG grande (el actual es de 150 px).
- La valoración de 4,7 estrellas no se muestra hasta validar la fuente.

Confirmado en la bio de Instagram: delivery y take away en Miramar, entregas en la playa, pago con Cuenta DNI o transferencia, pedidos por WhatsApp.
