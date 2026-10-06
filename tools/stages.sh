#!/bin/sh
# Hero-boss stage check. Optional JSON overrides, e.g.: sh tools/stages.sh '{"archive":{"heroAtk":1.0}}'
set -e
cd "$(dirname "$0")/.."
mkdir -p sim-results
cat data.js engine.js tools/st.js > sim-results/st.js
node sim-results/st.js "${1:-{\}}"
