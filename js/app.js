/* Mucho Gusto · lógica de la web: menú, comanda y pedido por WhatsApp.
   Todo el contenido sale de js/config.js (window.MG_CONFIG). */
(function () {
  'use strict';

  var C = window.MG_CONFIG;
  if (!C) return;

  var STORAGE_KEY = 'mg-comanda-v1';
  var money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var allItems = [];
  C.categories.forEach(function (cat) {
    cat.items.forEach(function (it) { allItems.push(Object.assign({ cat: cat.id }, it)); });
  });
  var byId = {};
  allItems.forEach(function (it) { byId[it.id] = it; });

  var state = {
    cat: C.categories[0].id,
    cart: {},
    mode: C.modes[0].id,
    pay: C.payments[0].id,
    name: '',
    addr: ''
  };
  restore();

  /* ---------- Utilidades ---------- */
  function $(sel) { return document.querySelector(sel); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'text') node.textContent = v;
        else if (k === 'onClick') node.addEventListener('click', v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function icon(id) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ic');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(ns, 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function digits() { return String(C.contact.whatsapp || '').replace(/\D/g, ''); }
  function waLink(text) {
    var d = digits();
    return 'https://wa.me/' + (d ? d : '') + '?text=' + encodeURIComponent(text);
  }
  function priceLabel(p) { return typeof p === 'number' ? money.format(p) : '[$ precio]'; }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0] || list[0]; }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: state.cart, mode: state.mode, pay: state.pay, name: state.name })); } catch (e) { /* sin almacenamiento */ }
  }
  function restore() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved) return;
      Object.keys(saved.cart || {}).forEach(function (id) { if (byId[id] && saved.cart[id] > 0) state.cart[id] = saved.cart[id]; });
      if (C.modes.some(function (m) { return m.id === saved.mode; })) state.mode = saved.mode;
      if (C.payments.some(function (p) { return p.id === saved.pay; })) state.pay = saved.pay;
      if (typeof saved.name === 'string') state.name = saved.name;
    } catch (e) { /* datos viejos o bloqueados */ }
  }

  function lines() {
    return allItems.filter(function (it) { return state.cart[it.id] > 0; }).map(function (it) {
      return { item: it, qty: state.cart[it.id] };
    });
  }
  function count() { return lines().reduce(function (a, l) { return a + l.qty; }, 0); }
  function subtotal() {
    var ls = lines();
    if (!ls.length || ls.some(function (l) { return typeof l.item.price !== 'number'; })) return null;
    return ls.reduce(function (a, l) { return a + l.item.price * l.qty; }, 0);
  }
  function countLabel(n) { return n === 1 ? '1 ítem' : n + ' ítems'; }

  /* ---------- Pedido ---------- */
  var focusKey = null;

  function setQty(id, q, key) {
    var before = state.cart[id] || 0;
    if (q <= 0) delete state.cart[id]; else state.cart[id] = q;
    focusKey = key || null;
    save();
    renderItems();
    renderComanda();
    if (q > before) flashComanda();
  }

  function flashComanda() {
    if (reduceMotion) return;
    var box = $('#comanda');
    box.classList.remove('flash');
    void box.offsetWidth;
    box.classList.add('flash');
  }

  function buildMessage() {
    var mode = find(C.modes, state.mode);
    var pay = find(C.payments, state.pay);
    var msg = '¡Hola Mucho Gusto! Quiero hacer un pedido:\n';
    lines().forEach(function (l) {
      var p = typeof l.item.price === 'number' ? ' (' + money.format(l.item.price * l.qty) + ')' : '';
      msg += '• ' + l.qty + ' × ' + l.item.name + p + '\n';
    });
    var sub = subtotal();
    if (sub != null) msg += 'Subtotal: ' + money.format(sub) + '\n';
    msg += '\nModalidad: ' + mode.label;
    if (mode.addressLabel && state.addr.trim()) msg += '\n' + (mode.id === 'playa' ? 'Estoy en: ' : 'Dirección: ') + state.addr.trim();
    if (state.name.trim()) msg += '\nNombre: ' + state.name.trim();
    msg += '\nPago: ' + pay.label + '\n\n(Pedido armado desde la web)';
    return msg;
  }

  /* ---------- Render: menú ---------- */
  function renderTabs() {
    var wrap = $('#tabs');
    wrap.textContent = '';
    C.categories.forEach(function (cat) {
      wrap.appendChild(el('button', {
        type: 'button', class: 'tab', 'aria-pressed': String(cat.id === state.cat), text: cat.label,
        onClick: function () {
          if (state.cat === cat.id) return;
          state.cat = cat.id;
          renderTabs();
          renderCategory(true);
        }
      }));
    });
  }

  function renderCategory(animate) {
    var cat = find(C.categories, state.cat);
    $('#cat-title').textContent = cat.label;
    $('#cat-source').textContent = cat.source || '';
    var photo = $('#cat-photo');
    var old = photo.querySelector('img');
    if (old) old.remove();
    if (cat.image) {
      photo.insertBefore(el('img', { src: cat.image, alt: cat.label, width: '1400', height: '700', loading: 'lazy', decoding: 'async' }), photo.firstChild);
      $('#cat-photo-label').hidden = true;
      $('#cat-photo-tag').hidden = !C.photosAreDemo;
      photo.removeAttribute('role');
      photo.removeAttribute('aria-label');
    } else {
      $('#cat-photo-label').hidden = false;
      $('#cat-photo-label').textContent = '[Foto real] ' + (cat.photoNote || cat.label);
      $('#cat-photo-tag').hidden = true;
      photo.setAttribute('role', 'img');
      photo.setAttribute('aria-label', 'Espacio para foto de ' + cat.label);
    }
    renderItems(animate);
  }

  function renderItems(animate) {
    var list = $('#items');
    list.textContent = '';
    var items = allItems.filter(function (it) { return it.cat === state.cat; });
    items.forEach(function (it, i) {
      var q = state.cart[it.id] || 0;
      var media = it.image
        ? el('div', { class: 'ph item-ph' }, [el('img', { src: it.image, alt: '', width: '320', height: '320', loading: 'lazy', decoding: 'async' })])
        : el('div', { class: 'ph item-ph', role: 'img', 'aria-label': 'Espacio para foto del plato' }, [icon('i-photo')]);
      if (!it.image) media.firstChild.setAttribute('class', 'ph-mark');

      var action = q > 0
        ? el('div', { class: 'step' }, [
            el('button', { type: 'button', 'data-key': it.id + ':dec', 'aria-label': 'Quitar uno de ' + it.name, onClick: function () { setQty(it.id, q - 1, it.id + ':dec'); } }, [icon('i-minus')]),
            el('span', { class: 'step-qty', text: String(q), 'aria-label': q + ' en la comanda' }),
            el('button', { type: 'button', 'data-key': it.id + ':inc', 'aria-label': 'Sumar uno de ' + it.name, onClick: function () { setQty(it.id, q + 1, it.id + ':inc'); } }, [icon('i-plus')])
          ])
        : el('button', { type: 'button', class: 'btn add', 'data-key': it.id + ':inc', 'aria-label': 'Agregar ' + it.name + ' a la comanda', onClick: function () { setQty(it.id, 1, it.id + ':inc'); } }, [document.createTextNode('Agregar'), icon('i-plus')]);

      list.appendChild(el('li', { class: 'item' + (animate && !reduceMotion ? ' is-new' : ''), style: animate ? 'animation-delay:' + (i * 60) + 'ms' : null }, [
        el('span', { class: 'idx', 'aria-hidden': 'true', text: String(i + 1).padStart(2, '0') }),
        media,
        el('div', { class: 'item-body' }, [
          el('h4', { class: 'item-name', text: it.name }),
          el('p', { class: 'item-desc', text: it.desc || '' }),
          el('p', { class: 'item-price', text: priceLabel(it.price) })
        ]),
        el('div', { class: 'item-act' }, [action])
      ]));
    });
    restoreFocus(list);
  }

  function restoreFocus(scope) {
    if (!focusKey) return;
    var target = scope.querySelector('[data-key="' + focusKey + '"]') || scope.querySelector('[data-key="' + focusKey.split(':')[0] + ':inc"]');
    if (target) { target.focus({ preventScroll: true }); focusKey = null; }
  }

  /* ---------- Render: comanda ---------- */
  function renderSeg(container, list, current, onPick) {
    container.textContent = '';
    list.forEach(function (opt) {
      container.appendChild(el('button', {
        type: 'button', 'aria-pressed': String(opt.id === current), text: opt.label,
        onClick: function () { onPick(opt.id); }
      }));
    });
  }

  function renderComanda() {
    var ls = lines();
    var n = count();
    $('#comanda-count').textContent = countLabel(n);
    $('#comanda-empty').hidden = ls.length > 0;

    var ul = $('#lines');
    ul.textContent = '';
    ls.forEach(function (l) {
      var id = l.item.id;
      var price = typeof l.item.price === 'number' ? ' · ' + money.format(l.item.price * l.qty) : '';
      ul.appendChild(el('li', { class: 'line' }, [
        el('span', { class: 'line-name', text: l.qty + ' × ' + l.item.name + price }),
        el('span', { class: 'mini' }, [
          el('button', { type: 'button', 'data-key': 'l:' + id + ':dec', 'aria-label': 'Quitar uno de ' + l.item.name, onClick: function () { setQty(id, l.qty - 1, 'l:' + id + ':dec'); } }, [icon('i-minus')]),
          el('button', { type: 'button', 'data-key': 'l:' + id + ':inc', 'aria-label': 'Sumar uno de ' + l.item.name, onClick: function () { setQty(id, l.qty + 1, 'l:' + id + ':inc'); } }, [icon('i-plus')]),
          el('button', { type: 'button', 'aria-label': 'Eliminar ' + l.item.name + ' de la comanda', onClick: function () { setQty(id, 0, 'l:' + id + ':remove'); } }, [icon('i-x')])
        ])
      ]));
    });
    if (focusKey && focusKey.indexOf('l:') === 0) {
      var t = ul.querySelector('[data-key="' + focusKey + '"]');
      if (t) t.focus({ preventScroll: true }); else $('#f-name').focus({ preventScroll: true });
      focusKey = null;
    }

    renderSeg($('#modes'), C.modes, state.mode, function (id) { state.mode = id; save(); renderComanda(); });
    renderSeg($('#pays'), C.payments, state.pay, function (id) { state.pay = id; save(); renderComanda(); });

    var mode = find(C.modes, state.mode);
    var addrField = $('#addr-field');
    addrField.hidden = !mode.addressLabel;
    if (mode.addressLabel) {
      $('#f-addr-label').textContent = mode.addressLabel;
      $('#f-addr').placeholder = mode.addressHint || '';
    }

    var sub = subtotal();
    $('#total').textContent = sub != null ? money.format(sub) + ' · se confirma por WhatsApp' : 'Se confirma por WhatsApp';

    var send = $('#send');
    send.href = ls.length ? waLink(buildMessage()) : '#menu';
    send.setAttribute('aria-disabled', String(!ls.length));
    if (!ls.length) send.setAttribute('tabindex', '-1'); else send.removeAttribute('tabindex');
    $('#wa-missing').hidden = !!digits();

    renderOrderBar(n);
  }

  function renderOrderBar(n) {
    var btn = $('#order-bar-btn');
    if (n > 0) {
      btn.href = '#comanda';
      $('#order-bar-text').textContent = 'Tu pedido · ' + countLabel(n);
      $('#order-bar-pill').textContent = 'Enviar';
    } else {
      btn.href = '#menu';
      $('#order-bar-text').textContent = 'Armar mi pedido';
      $('#order-bar-pill').textContent = 'Ver menú';
    }
  }

  /* ---------- Render: contacto y enlaces ---------- */
  function renderContact() {
    var d = digits();
    var general = waLink(C.whatsappGreeting);
    document.querySelectorAll('[data-wa="general"]').forEach(function (a) { a.href = general; });
    document.querySelectorAll('[data-link="instagram"]').forEach(function (a) { a.href = C.contact.instagram; });
    document.querySelectorAll('[data-link="threads"]').forEach(function (a) { a.href = C.contact.threads; });

    var wa = $('#c-wa');
    wa.textContent = '';
    if (d) wa.appendChild(el('a', { href: general, target: '_blank', rel: 'noopener', text: '+' + d }));
    else {
      wa.appendChild(el('strong', { text: '[Número oficial de WhatsApp]' }));
      wa.appendChild(el('span', { class: 'demo', text: 'A confirmar' }));
    }

    var ig = $('#c-ig');
    ig.textContent = '';
    ig.appendChild(el('a', { href: C.contact.instagram, target: '_blank', rel: 'noopener', text: C.contact.instagramHandle }));

    var addr = $('#c-addr');
    addr.textContent = '';
    var a = C.contact.address;
    if (a && a.text) {
      if (a.verified && a.mapsUrl) addr.appendChild(el('a', { href: a.mapsUrl, target: '_blank', rel: 'noopener', text: a.text + ' ↗' }));
      else addr.appendChild(el('strong', { text: a.text }));
      if (!a.verified) addr.appendChild(el('span', { class: 'demo', text: 'Dato de directorio · a confirmar' }));
    } else {
      addr.appendChild(el('strong', { text: '[Dirección]' }));
    }

    var hours = $('#c-hours');
    hours.textContent = '';
    if (C.contact.hours && C.contact.hours.length) {
      C.contact.hours.forEach(function (h) { hours.appendChild(el('span', { text: h.days + ' · ' + h.hours })); });
    } else {
      hours.appendChild(el('strong', { text: '[Días y horarios]' }));
      hours.appendChild(el('span', { class: 'demo', text: 'Cargar desde el destacado “Horarios”' }));
    }

    $('#menu-demo-tag').hidden = !C.menuIsDemo;
    if (!C.photosAreDemo) document.querySelectorAll('[data-demo-photo]').forEach(function (n) { n.hidden = true; });
  }

  /* ---------- Formulario ---------- */
  var fName = $('#f-name');
  var fAddr = $('#f-addr');
  fName.value = state.name;
  fName.addEventListener('input', function () { state.name = fName.value; save(); refreshSend(); });
  fAddr.addEventListener('input', function () { state.addr = fAddr.value; refreshSend(); });
  function refreshSend() { if (lines().length) $('#send').href = waLink(buildMessage()); }

  /* ---------- Header, navegación móvil y barra de pedido ---------- */
  var header = $('#site-header');
  var burger = header.querySelector('.burger');
  var mobileNav = $('#mobile-nav');

  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setNav(open) {
    mobileNav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    burger.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  burger.addEventListener('click', function () { setNav(mobileNav.hidden); });
  mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !mobileNav.hidden) { setNav(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) { if (e.matches) setNav(false); });

  if ('IntersectionObserver' in window) {
    // La barra fija se oculta cuando la comanda o el footer están en pantalla, para no tapar controles.
    var bar = $('#order-bar');
    var visible = new Set();
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      bar.classList.toggle('is-hidden', visible.size > 0);
    }, { threshold: 0.05 });
    barIO.observe($('#comanda'));
    barIO.observe($('.site-footer'));
    barIO.observe($('.hero-ctas'));

    // Aparición progresiva de bloques.
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (n) { revealIO.observe(n); });

    // Sección activa en la navegación.
    var navLinks = document.querySelectorAll('.nav-links a');
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['menu', 'como', 'donde', 'contacto'].forEach(function (id) { var s = document.getElementById(id); if (s) spyIO.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (n) { n.classList.add('is-in'); });
    $('#order-bar').classList.remove('is-hidden');
  }

  /* ---------- Inicio ---------- */
  renderTabs();
  renderCategory(false);
  renderComanda();
  renderContact();
})();
