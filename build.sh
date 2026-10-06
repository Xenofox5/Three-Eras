#!/bin/sh
# Builds three-eras.html from the source files. Order matters: ui4.js boots the game, so it goes last.
set -e
cd "$(dirname "$0")"
OUT=${1:-three-eras.html}
{ cat shell_head.html; cat style.css; echo '</style></head><body><div id="app"></div><script>'; cat data.js; sed "s/^'use strict';//" engine.js; cat simstats.js art.js ui1.js ui2.js ui3.js ui5.js ui4.js; echo '</script></body></html>'; } > "$OUT"
{ cat data.js; sed "s/^'use strict';//" engine.js; cat simstats.js art.js ui1.js ui2.js ui3.js ui5.js ui4.js; } > /tmp/three-eras-all.js
node --check /tmp/three-eras-all.js && echo "Syntax OK: $OUT"
