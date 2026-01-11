#!/bin/bash

# Contract Verification Script for Base Mainnet
# 
# This script uses Foundry's built-in verification which is the recommended approach.
# It will verify both contracts on Basescan.
#
# Usage:
#   ./verify.sh
#
# Requires:
#   - BASESCAN_API_KEY environment variable
#   - Contracts must be deployed to Base Mainnet (chain ID 8453)

set -e

# Contract addresses (from deployment broadcast file)
GOVERNANCE_TOKEN_ADDRESS="0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F"
AZURA_KILLSTREAK_ADDRESS="0x2cbb90a761ba64014b811be342b8ef01b471992d"

# Constructor arguments from deployment
# GovernanceToken: constructor(uint256 initialSupply) with 100000000000000000000000 (100k tokens)
GOV_TOKEN_CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(uint256)" 100000000000000000000000)

# AzuraKillStreak: constructor(address,address,address,uint256)
# Args: governanceToken, usdcToken, azuraAgent, totalSupply
GOV_TOKEN_ADDR="0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F"
USDC_ADDR="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
AZURA_AGENT="0x0920553CcA188871b146ee79f562B4Af46aB4f8a"
TOTAL_SUPPLY="100000000000000000000000"

AZURA_CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(address,address,address,uint256)" \
    $GOV_TOKEN_ADDR \
    $USDC_ADDR \
    $AZURA_AGENT \
    $TOTAL_SUPPLY)

echo "🚀 Verifying contracts on Basescan (Base Mainnet)"
echo "=================================================="
echo ""

# Check if BASESCAN_API_KEY is set, if not try to read from .env file
if [ -z "$BASESCAN_API_KEY" ]; then
    if [ -f .env ]; then
        # Try to source .env file
        export $(grep -v '^#' .env | grep BASESCAN_API_KEY | xargs)
    fi
fi

# Check again if BASESCAN_API_KEY is set
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "❌ Error: BASESCAN_API_KEY environment variable is not set"
    echo ""
    echo "Please set it with:"
    echo "  export BASESCAN_API_KEY=your_api_key_here"
    echo ""
    echo "Or add it to contracts/.env file"
    echo "Get your API key from: https://basescan.org/myapikey"
    exit 1
fi

echo "✅ BASESCAN_API_KEY found"
echo ""

# Verify GovernanceToken
echo "📝 Verifying GovernanceToken..."
echo "   Address: $GOVERNANCE_TOKEN_ADDRESS"
echo "   Constructor args: $GOV_TOKEN_CONSTRUCTOR_ARGS"
echo ""

if forge verify-contract \
    $GOVERNANCE_TOKEN_ADDRESS \
    script/Deploy.s.sol:GovernanceToken \
    --chain-id 8453 \
    --num-of-optimizations 200 \
    --constructor-args $GOV_TOKEN_CONSTRUCTOR_ARGS \
    --watch \
    --etherscan-api-key $BASESCAN_API_KEY; then
    echo "✅ GovernanceToken verified successfully!"
else
    echo "⚠️  GovernanceToken verification failed (may already be verified)"
fi

echo ""
echo "----------------------------------------"
echo ""

# Verify AzuraKillStreak
echo "📝 Verifying AzuraKillStreak..."
echo "   Address: $AZURA_KILLSTREAK_ADDRESS"
echo "   Constructor args: $AZURA_CONSTRUCTOR_ARGS"
echo ""

if forge verify-contract \
    $AZURA_KILLSTREAK_ADDRESS \
    src/AzuraKillStreak.sol:AzuraKillStreak \
    --chain-id 8453 \
    --num-of-optimizations 200 \
    --constructor-args $AZURA_CONSTRUCTOR_ARGS \
    --watch \
    --etherscan-api-key $BASESCAN_API_KEY; then
    echo "✅ AzuraKillStreak verified successfully!"
else
    echo "⚠️  AzuraKillStreak verification failed (may already be verified)"
fi

echo ""
echo "=========================================="
echo "✅ Verification complete!"
echo ""
echo "🔍 Check your contracts on Basescan:"
echo "   GovernanceToken: https://basescan.org/address/$GOVERNANCE_TOKEN_ADDRESS"
echo "   AzuraKillStreak: https://basescan.org/address/$AZURA_KILLSTREAK_ADDRESS"
echo ""
