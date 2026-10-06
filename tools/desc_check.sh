#!/bin/sh
# Checks every effect a hero applies is stated in their descriptions. Run: npm run check:desc
set -e
cd "$(dirname "$0")/.."
OUT=sim-results; mkdir -p $OUT
{
  cat data.js
  echo "const KIT_SOURCE = $(node -e 'const fs=require("fs");const s=fs.readFileSync("engine.js","utf8");const i=s.indexOf("const KIT = {");const j=s.indexOf("\n};",i);console.log(JSON.stringify(s.slice(i,j)))');"
  cat tools/desc_tail.js
} > $OUT/desc_check.js
node $OUT/desc_check.js
