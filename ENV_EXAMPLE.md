# Environment Variables Example

Copy these to your `.env.local` file:

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@host:port/database

# ============================================================================
# AUTHENTICATION
# ============================================================================
SESSION_SECRET=your-random-secret-key-here

# ============================================================================
# AI / DEEPSEEK
# ============================================================================
DEEPSEEK_API_KEY=your_deepseek_api_key

# ============================================================================
# WEB3 / BLOCKCHAIN
# ============================================================================
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CDP_API_KEY=your_cdp_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Contract Addresses (Base Mainnet)
NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS=0x2cbb90a761ba64014b811be342b8ef01b471992d
NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS=0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# ============================================================================
# PHASE 2: AZURA WALLET (Blockchain Integration)
# ============================================================================
CDP_API_KEY_NAME=organizations/your-org-id/apiKeys/your-key-id
CDP_API_KEY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
AZURA_WALLET_ID=
AZURA_WALLET_SEED=
VOTING_TOKEN_CONTRACT_ADDRESS=0x...
VOTING_TOKEN_DECIMALS=18
AZURA_TOTAL_TOKEN_POOL=1000000
BLOCKCHAIN_NETWORK=base-sepolia
```

See `PHASE_2_SETUP_GUIDE.md` for detailed instructions on obtaining these values.
