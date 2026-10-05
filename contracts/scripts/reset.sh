#!/usr/bin/env bash
# Full demo reset: fresh local chain -> deploy -> seed -> ELIGIBLE state.
#
# A revoked credential cannot be un-revoked (by design), so the only way back to
# the clean "before" state is a fresh contract on a fresh chain. This script does
# the whole thing in one command.
#
# Usage (from contracts/):   npm run reset
#
# It will:
#   1. stop any process listening on 8545
#   2. start a fresh Hardhat node in the background
#   3. deploy the contract and seed the demo data
#   4. leave the node running for the web app
set -euo pipefail

export HARDHAT_DISABLE_TELEMETRY_PROMPT=true

echo "[reset] stopping any node on port 8545..."
if lsof -ti tcp:8545 >/dev/null 2>&1; then
  kill "$(lsof -ti tcp:8545)" || true
  sleep 2
fi

echo "[reset] starting a fresh local node (background)..."
# nohup so it survives this script; log to node.log
nohup npx hardhat node >node.log 2>&1 &
NODE_PID=$!
echo "[reset] node pid: $NODE_PID (logs: contracts/node.log)"

# wait for the RPC to answer
echo "[reset] waiting for the node to be ready..."
for i in $(seq 1 30); do
  if curl -s -X POST http://127.0.0.1:8545 \
      -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
      >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[reset] deploying..."
npx hardhat run scripts/deploy.ts --network localhost

echo "[reset] seeding..."
npx hardhat run scripts/seed.ts --network localhost

echo ""
echo "[reset] done. The activity is ELIGIBLE. Node is running in the background."
echo "[reset] start the web app:  cd ../web && npm run dev"
echo "[reset] to stop the node later:  kill $NODE_PID"
