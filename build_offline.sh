#!/bin/sh
# Builds three-eras-offline.html: no network needed. Fonts are embedded, saves stay on the device.
set -e
cd "$(dirname "$0")"
OUT=${1:-three-eras-offline.html}
mkdir -p "$(dirname "$OUT")"
ff() { printf "@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}\n" "$1" "$2" "$(base64 -w0 "fonts/$3")"; }
{
  sed '/fonts.googleapis.com/d;/fonts.gstatic.com/d' shell_head.html
  ff 'Grenze Gotisch' 400 grenze-gotisch-latin-400-normal.woff2
  ff 'Chakra Petch' 400 chakra-petch-latin-400-normal.woff2
  ff 'Chakra Petch' 600 chakra-petch-latin-600-normal.woff2
  ff 'Chakra Petch' 700 chakra-petch-latin-700-normal.woff2
  cat style.css
  echo '</style></head><body><div id="app"></div><script>'
  echo 'const OFFLINE = true;'
  cat data.js; sed "s/^'use strict';//" engine.js; cat simstats.js art.js ui1.js ui2.js ui3.js ui5.js ui4.js
  echo '</script></body></html>'
} > "$OUT"
{ echo 'const OFFLINE = true;'; cat data.js; sed "s/^'use strict';//" engine.js; cat simstats.js art.js ui1.js ui2.js ui3.js ui5.js ui4.js; } > /tmp/three-eras-offline-all.js
node --check /tmp/three-eras-offline-all.js && echo "Syntax OK: $OUT"
