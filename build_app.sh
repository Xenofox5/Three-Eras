#!/bin/sh
# Builds three-eras-app/: an installable home-screen web app (PWA) that works offline after its first visit.
# Upload the folder's contents to any HTTPS host (GitHub Pages, Netlify), open it in Safari, Share > Add to Home Screen.
set -e
cd "$(dirname "$0")"
DIR=${1:-three-eras-app}
VER=$(sed -n "s/^const GAME_VERSION = '\([0-9.]*\)';/\1/p" data.js)
rm -rf "$DIR"; mkdir -p "$DIR"
sh build_offline.sh /tmp/te-offline.html >/dev/null
sed -e 's#<meta name="theme-color" content="\#121127">#<meta name="theme-color" content="\#121127"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Three Eras">#' \
    -e 's#^const OFFLINE = true;#const OFFLINE = true; const APPMODE = true;#' \
    -e "s#</script></body></html>#</script><script>if ('serviceWorker' in navigator \&\& (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('./sw.js').catch(function () {});</script></body></html>#" \
    /tmp/te-offline.html > "$DIR/index.html"
cp appicons/icon-192.png appicons/icon-512.png appicons/apple-touch-icon.png "$DIR/"
cat > "$DIR/manifest.webmanifest" <<JSON
{ "name": "Three Eras", "short_name": "Three Eras", "start_url": "./", "scope": "./", "display": "standalone",
  "orientation": "portrait", "background_color": "#121127", "theme_color": "#121127",
  "icons": [ { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
             { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" } ] }
JSON
cat > "$DIR/sw.js" <<JS
// Three Eras offline cache, v$VER. A new version changes this file, so the browser installs the new cache.
const CACHE = 'three-eras-v$VER';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).catch(() => (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
JS
grep -q 'rel="manifest"' "$DIR/index.html" && grep -q "serviceWorker" "$DIR/index.html" && grep -q "APPMODE = true" "$DIR/index.html" && echo "App build OK: $DIR (v$VER)"
