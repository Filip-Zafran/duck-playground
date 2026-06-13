self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
  if (e.data?.type === 'PING') {
    e.waitUntil(
      fetch('/health').catch(() => {})
    );
  }
});
