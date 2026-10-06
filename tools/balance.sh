#!/bin/sh
# Full balance research: campaign, builds, 3v3 and 1v1, then prints the combined table.
# Usage: sh tools/balance.sh [version-for-stats-screen]   e.g. sh tools/balance.sh 0.93
# With a version, it also rewrites simstats.js for the in-game Stats screen.
set -e
cd "$(dirname "$0")/.."
OUT=sim-results; mkdir -p $OUT
cat data.js engine.js tools/rep_tail.js > $OUT/rep.js
cat data.js engine.js tools/pvp_tail.js > $OUT/pvp.js
cat data.js > $OUT/ids.js; echo "console.log(HERO_ORDER.join(','))" >> $OUT/ids.js
IDS=$(node $OUT/ids.js)
echo "Campaign (heroes)..."; node $OUT/rep.js heroes "$IDS" ${RUNS:-50} > $OUT/heroes.json
echo "Campaign (builds)..."; node $OUT/rep.js builds "$IDS" ${BUILD_RUNS:-20} > $OUT/builds.json
echo "3v3..."; node $OUT/pvp.js team ${TEAMS:-10000} > $OUT/team3.json
# Duels are cheap now that each pair is played once instead of twice: 150 per side is
# about 30 seconds for the whole matrix, and takes the error on a cell from roughly
# 10 points down to 2.5.
echo "1v1..."; node $OUT/pvp.js duel ${DUELS:-150} > $OUT/duel.json
cat data.js tools/combo.js > $OUT/combo.js && node $OUT/combo.js $OUT/heroes.json $OUT/team3.json $OUT/duel.json | tee $OUT/summary.txt
cat data.js tools/show.js > $OUT/show.js && node $OUT/show.js $OUT/heroes.json $OUT/builds.json > $OUT/builds.txt
echo "Build win rates written to $OUT/builds.txt"
if [ -n "$1" ]; then cat data.js tools/gen_simstats.js > $OUT/gen.js && node $OUT/gen.js "$1" $OUT/heroes.json $OUT/builds.json $OUT/team3.json $OUT/duel.json; fi
