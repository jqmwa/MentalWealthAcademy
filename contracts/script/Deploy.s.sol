// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AzuraKillStreak.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title GovernanceToken
 * @notice ERC20 governance token for Mental Wealth Academy voting
 */
contract GovernanceToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mental Wealth Governance", "MWG") {
        _mint(msg.sender, initialSupply);
    }
}

/**
 * @title Deploy
 * @notice Deployment script for AzuraKillStreak governance system
 * 
 * To deploy on Base Sepolia:
 * forge script script/Deploy.s.sol:Deploy --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 * 
 * To deploy on Base Mainnet:
 * forge script script/Deploy.s.sol:Deploy --rpc-url $BASE_MAINNET_RPC_URL --broadcast --verify
 */
contract Deploy is Script {
    // Token configuration
    uint256 constant TOTAL_SUPPLY = 100_000 * 1e18; // 100k governance tokens
    uint256 constant AZURA_ALLOCATION = 40_000 * 1e18; // 40% to Azura
    
    // USDC addresses (Base network)
    address constant USDC_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base Sepolia USDC
    address constant USDC_MAINNET = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base Mainnet USDC
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address azuraAgent = vm.envAddress("AZURA_AGENT_ADDRESS");
        
        // Determine which USDC to use based on chain ID
        address usdcAddress;
        if (block.chainid == 84532) { // Base Sepolia
            usdcAddress = USDC_SEPOLIA;
            console.log("Deploying to Base Sepolia...");
        } else if (block.chainid == 8453) { // Base Mainnet
            usdcAddress = USDC_MAINNET;
            console.log("Deploying to Base Mainnet...");
        } else {
            revert("Unsupported network");
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Governance Token
        console.log("\n1. Deploying Governance Token...");
        GovernanceToken governanceToken = new GovernanceToken(TOTAL_SUPPLY);
        console.log("Governance Token deployed at:", address(governanceToken));
        console.log("Total Supply:", TOTAL_SUPPLY / 1e18, "tokens");
        
        // 2. Deploy AzuraKillStreak Contract
        console.log("\n2. Deploying AzuraKillStreak Contract...");
        AzuraKillStreak governance = new AzuraKillStreak(
            address(governanceToken),
            usdcAddress,
            azuraAgent,
            TOTAL_SUPPLY
        );
        console.log("AzuraKillStreak deployed at:", address(governance));
        console.log("Azura Agent:", azuraAgent);
        console.log("USDC Token:", usdcAddress);
        
        // 3. Transfer tokens to Azura (40%)
        console.log("\n3. Transferring tokens to Azura...");
        governanceToken.transfer(azuraAgent, AZURA_ALLOCATION);
        console.log("Azura balance:", AZURA_ALLOCATION / 1e18, "tokens (40%)");
        
        // 4. Check remaining balance for admin distribution
        uint256 remainingBalance = governanceToken.balanceOf(msg.sender);
        console.log("Remaining for admins:", remainingBalance / 1e18, "tokens (60%)");
        
        vm.stopBroadcast();
        
        // 5. Print deployment summary
        console.log("\n==============================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("==============================================");
        console.log("Network:", block.chainid == 84532 ? "Base Sepolia" : "Base Mainnet");
        console.log("Governance Token:", address(governanceToken));
        console.log("AzuraKillStreak:", address(governance));
        console.log("USDC Token:", usdcAddress);
        console.log("Azura Agent:", azuraAgent);
        console.log("==============================================");
        console.log("\nNEXT STEPS:");
        console.log("1. Verify contracts on BaseScan");
        console.log("2. Fund AzuraKillStreak contract with USDC");
        console.log("3. Distribute remaining governance tokens to admins");
        console.log("4. Update frontend with contract addresses");
        console.log("5. Set up CDP webhooks for event monitoring");
        console.log("==============================================\n");
    }
}
