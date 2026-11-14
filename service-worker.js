// service-worker.js — PWA com cache + lembretes locais
// Estratégia "rede primeiro": sempre busca a versão nova; usa o cache só sem internet.
// (Antes era "cache primeiro", e atualizações do app nunca chegavam aos clientes.)
const CACHE_NAME = 'massagenszen-v3';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style-user.css',
  './user.js',
  './firebase-config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // Cada arquivo é salvo separadamente: se um faltar, os outros continuam no cache
      // (antes o cache listava arquivos do painel admin que não existem aqui e a instalação falhava)
      .then(cache => Promise.all(
        FILES_TO_CACHE.map(url => cache.add(url).catch(err => console.warn('SW: não foi possível guardar', url, err)))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  // Só arquivos do próprio site; Firebase, Google, CDN e ViaCEP passam direto
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
  );
});

// === Notificações locais ===
// Observação: o navegador pode encerrar o service worker a qualquer momento,
// então lembretes com atraso longo (setTimeout) não são garantidos.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [100, 50, 100],
      });
    }, delay);
  }
});
