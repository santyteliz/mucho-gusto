/*
 * Mucho Gusto · configuración central de la web.
 * Todo el contenido editable vive acá: contacto, horarios, pagos y menú.
 *
 * Convenciones:
 *  - `null` o "" = dato pendiente. La web muestra un marcador "[...]" y la etiqueta "a confirmar".
 *  - `verified: false` = dato encontrado en fuentes externas que el cliente todavía no confirmó.
 *  - Precios en pesos, como número (ej. 8500). Si todos los productos del pedido tienen precio,
 *    la comanda calcula el subtotal; si falta alguno, muestra "se confirma por WhatsApp".
 *  - Imágenes: ruta relativa (ej. "assets/menu/hamburguesa-01.webp"). Sin imagen = espacio reservado.
 */
window.MG_CONFIG = {
  brand: {
    name: 'Mucho Gusto',
    city: 'Miramar, Buenos Aires'
  },

  contact: {
    // Número oficial de WhatsApp, sólo dígitos con código de país (ej. "5492291000000").
    // PENDIENTE: los teléfonos de directorios (02291 54-2052 / 02291 43-2462) NO están confirmados como WhatsApp.
    whatsapp: '',
    instagram: 'https://www.instagram.com/muchogustomiramar/',
    instagramHandle: '@muchogustomiramar',
    threads: 'https://www.threads.com/@muchogustomiramar',
    address: {
      text: 'Diagonal Fortunato de la Plaza 1601, Miramar',
      verified: false, // Dato de directorio. Al confirmarlo pasar a true para mostrar el enlace a Google Maps.
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Diagonal+Fortunato+de+la+Plaza+1601+Miramar'
    },
    // Horarios confirmados. Ej: [{ days: 'Mar a Dom', hours: '20 a 00 h' }]
    hours: []
  },

  // Confirmados en la bio de Instagram.
  payments: [
    { id: 'dni', label: 'Cuenta DNI', note: 'Pagás desde la app, al confirmar.' },
    { id: 'transf', label: 'Transferencia', note: 'Te pasamos los datos por WhatsApp.' }
  ],

  modes: [
    { id: 'delivery', label: 'Delivery', addressLabel: 'Dirección de entrega', addressHint: 'Calle, número, depto.' },
    { id: 'retiro', label: 'Take away', addressLabel: null, addressHint: null },
    { id: 'playa', label: 'Playa', addressLabel: '¿Dónde estás en la playa?', addressHint: 'Bajada, balneario o referencia' }
  ],

  whatsappGreeting: '¡Hola Mucho Gusto! Quiero hacer un pedido.',

  // MENÚ DE MUESTRA. Las categorías salen de publicaciones recientes de Instagram;
  // nombres, descripciones, precios e imágenes se reemplazan con el menú real.
  menuIsDemo: true,
  // Fotos de referencia de Unsplash (ver CREDITS.md). No son platos de Mucho Gusto:
  // mientras sea true, cada foto lleva la etiqueta "Foto de referencia".
  photosAreDemo: true,
  categories: [
    {
      id: 'burgers', label: 'Hamburguesas', source: 'Visto en IG · 16 y 18 sep', photoNote: 'hamburguesa · post del 18/09', image: 'assets/photos/cat-burgers.webp',
      items: [
        { id: 'burgers-1', name: '[Hamburguesa 01]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/burgers-1.webp' },
        { id: 'burgers-2', name: '[Hamburguesa 02]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/burgers-2.webp' },
        { id: 'burgers-3', name: '[Hamburguesa 03]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/burgers-3.webp' }
      ]
    },
    {
      id: 'pastas', label: 'Pastas', source: 'Visto en IG · 30 sep', photoNote: 'plato de pasta · post del 30/09', image: 'assets/photos/cat-pastas.webp',
      items: [
        { id: 'pastas-1', name: '[Pasta 01]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/pastas-1.webp' },
        { id: 'pastas-2', name: '[Pasta 02]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/pastas-2.webp' },
        { id: 'pastas-3', name: '[Pasta 03]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/pastas-3.webp' }
      ]
    },
    {
      id: 'bowls', label: 'Bowls', source: 'Visto en IG · 30 sep', photoNote: 'bowl de pollo, tofu o fideos · post del 30/09', image: 'assets/photos/cat-bowls.webp',
      items: [
        { id: 'bowls-1', name: '[Bowl 01]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/bowls-1.webp' },
        { id: 'bowls-2', name: '[Bowl 02]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/bowls-2.webp' },
        { id: 'bowls-3', name: '[Bowl 03]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/bowls-3.webp' }
      ]
    },
    {
      id: 'carnes', label: 'Carnes', source: 'Visto en IG · 23 sep', photoNote: 'bife · post del 23/09', image: 'assets/photos/cat-carnes.webp',
      items: [
        { id: 'carnes-1', name: '[Carne 01]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/carnes-1.webp' },
        { id: 'carnes-2', name: '[Carne 02]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/carnes-2.webp' },
        { id: 'carnes-3', name: '[Carne 03]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/carnes-3.webp' }
      ]
    },
    {
      id: 'horno', label: 'Al horno', source: 'Visto en IG · 25 sep', photoNote: 'pastel con verduras · post del 25/09', image: 'assets/photos/cat-horno.webp',
      items: [
        { id: 'horno-1', name: '[Plato al horno 01]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/horno-1.webp' },
        { id: 'horno-2', name: '[Plato al horno 02]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/horno-2.webp' },
        { id: 'horno-3', name: '[Plato al horno 03]', desc: '[Descripción breve con ingredientes confirmados]', price: null, image: 'assets/photos/horno-3.webp' }
      ]
    }
  ]
};
