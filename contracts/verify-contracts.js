#!/usr/bin/env node

/**
 * Verify contracts on Basescan using the API
 * 
 * Usage:
 *   node verify-contracts.js
 * 
 * Requires:
 *   - BASESCAN_API_KEY environment variable
 *   - Contract source code (will be flattened automatically)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Contract addresses on Base Mainnet (chain ID 8453)
const CONTRACTS = {
  GovernanceToken: {
    address: '0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F',
    name: 'GovernanceToken',
    // This contract is in Deploy.s.sol but we'll need to extract it
    // For now, we'll note that it extends ERC20
  },
  AzuraKillStreak: {
    address: '0x2cbb90a761ba64014b811be342b8ef01b471992d',
    name: 'AzuraKillStreak',
    sourcePath: 'src/AzuraKillStreak.sol',
  },
};

// Compiler settings from foundry.toml
const COMPILER_VERSION = '0.8.20';
const OPTIMIZER_ENABLED = true;
const OPTIMIZER_RUNS = 200;

const BASESCAN_API_URL = 'https://api.basescan.org/api';
const CHAIN_ID = '8453';

async function getFlattenedSource(contractPath, contractName) {
  console.log(`\n📦 Flattening ${contractName}...`);
  try {
    // Use forge flatten to get single-file source
    const flattened = execSync(`forge flatten ${contractPath}`, {
      cwd: path.join(__dirname),
      encoding: 'utf-8',
    });
    
    // Extract just the contract we want (remove everything before the contract definition)
    const contractStart = flattened.indexOf(`contract ${contractName}`);
    if (contractStart === -1) {
      throw new Error(`Could not find contract ${contractName} in flattened source`);
    }
    
    // For GovernanceToken, we need a different approach since it's in the deploy script
    // For now, let's focus on AzuraKillStreak first
    return flattened.substring(contractStart);
  } catch (error) {
    console.error(`❌ Error flattening ${contractName}:`, error.message);
    throw error;
  }
}

async function getCompilerVersionString() {
  try {
    // Try to get the exact compiler version from forge
    const version = execSync('forge --version', { encoding: 'utf-8' });
    console.log(`🔧 Foundry version: ${version.trim()}`);
    
    // For Solidity 0.8.20 with optimizer, we typically use a version string like:
    // v0.8.20+commit.a1b79de6
    // However, we need the exact commit hash. For now, we'll use a placeholder
    // that Basescan should accept. If verification fails, we can get the exact
    // version from the build artifacts.
    
    // Standard format: v0.8.20+commit.a1b79de6
    // For Basescan, we can try with just the version and it might auto-detect
    return `v${COMPILER_VERSION}+commit.a1b79de6`;
  } catch (error) {
    console.error('Error getting compiler version:', error);
    return `v${COMPILER_VERSION}+commit.a1b79de6`;
  }
}

async function verifySourceCode(contractConfig) {
  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    throw new Error('BASESCAN_API_KEY environment variable is required');
  }

  console.log(`\n🔍 Verifying ${contractConfig.name} at ${contractConfig.address}...`);

  // Get flattened source code
  let sourceCode;
  if (contractConfig.sourcePath) {
    sourceCode = await getFlattenedSource(contractConfig.sourcePath, contractConfig.name);
  } else {
    // For GovernanceToken, we'll need to handle it differently
    // Since it's a simple ERC20 contract, we could construct it manually
    // or extract it from Deploy.s.sol
    console.log(`⚠️  Note: ${contractConfig.name} is in Deploy.s.sol. Please flatten it manually or use forge verify.`);
    return null;
  }

  const compilerVersion = await getCompilerVersionString();

  const url = BASESCAN_API_URL;
  const params = new URLSearchParams({
    module: 'contract',
    action: 'verifysourcecode',
    apikey: apiKey,
  });

  const data = new URLSearchParams({
    chainId: CHAIN_ID,
    codeformat: 'solidity-single-file',
    sourceCode: sourceCode,
    contractaddress: contractConfig.address,
    contractname: contractConfig.name,
    compilerversion: compilerVersion,
    optimizationUsed: OPTIMIZER_ENABLED ? '1' : '0',
    runs: OPTIMIZER_ENABLED ? OPTIMIZER_RUNS.toString() : '200',
    evmversion: 'paris',
  });

  try {
    console.log(`📤 Sending verification request...`);
    console.log(`   Contract: ${contractConfig.name}`);
    console.log(`   Address: ${contractConfig.address}`);
    console.log(`   Compiler: ${compilerVersion}`);
    console.log(`   Optimizer: ${OPTIMIZER_ENABLED ? 'enabled' : 'disabled'} (runs: ${OPTIMIZER_RUNS})`);

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    const result = await response.json();
    console.log(`\n📋 Response:`, JSON.stringify(result, null, 2));

    if (result.status === '1' && result.message === 'OK') {
      console.log(`\n✅ Verification submitted successfully!`);
      console.log(`📝 GUID: ${result.result}`);
      console.log(`\n⏳ Check verification status with:`);
      console.log(`   curl "https://api.basescan.org/api?module=contract&action=checkverifystatus&guid=${result.result}&apikey=${apiKey}"`);
      return result.result;
    } else {
      console.error(`\n❌ Verification failed:`, result.message || result.result);
      return null;
    }
  } catch (error) {
    console.error(`\n❌ Error verifying contract:`, error.message);
    throw error;
  }
}

async function checkVerificationStatus(guid) {
  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    throw new Error('BASESCAN_API_KEY environment variable is required');
  }

  const url = `${BASESCAN_API_URL}?module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    console.log(`\n📊 Verification status:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`Error checking status:`, error.message);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Basescan Contract Verification Script\n');
  console.log('==========================================\n');

  // Verify AzuraKillStreak (the main contract)
  try {
    const guid = await verifySourceCode(CONTRACTS.AzuraKillStreak);
    
    if (guid) {
      console.log(`\n⏳ Waiting a few seconds before checking status...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log(`\n🔍 Checking verification status...`);
      await checkVerificationStatus(guid);
    }
  } catch (error) {
    console.error(`\n❌ Failed to verify AzuraKillStreak:`, error.message);
    process.exit(1);
  }

  console.log(`\n💡 Note: For GovernanceToken verification, you may want to use:`);
  console.log(`   forge verify-contract ${CONTRACTS.GovernanceToken.address} script/Deploy.s.sol:GovernanceToken --chain-id 8453 --num-of-optimizations 200`);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { verifySourceCode, checkVerificationStatus };
