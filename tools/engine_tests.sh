#!/bin/sh
# Headless engine tests: no browser, no dependencies. Run with: npm run test:engine
set -e
cd "$(dirname "$0")/.."
OUT=sim-results; mkdir -p $OUT
cat data.js engine.js tools/engine_tail.js > $OUT/engine_tests.js
node $OUT/engine_tests.js
