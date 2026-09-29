#!/bin/bash
# Autopilot every Act I Venture against the dev server (localhost:5173), three at a time.
# Logs: full<N>.log here. Each should end with "REACHED V<N+1>" (or CREDITS for V12) and "no console errors".
cd "$(dirname "$0")"
run() { v=$1; rm -f full$v.log; MAX_MIN=22 timeout 1500 node drive.mjs ./auto.mjs full$v "?venture=$v&fast" > full$v.log 2>&1; }
for batch in "1 2 3" "4 5 6" "7 8 9" "10 11 12"; do
  for v in $batch; do run $v & done
  wait
done
echo ALLDONE
