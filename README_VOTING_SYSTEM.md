# Mental Wealth Academy - Voting Proposal System

## 🎯 Overview

A complete blockchain-integrated voting proposal system where users submit funding proposals, Azura AI reviews them, and approved proposals receive on-chain token allocations.

## ✨ Features

### Phase 1: Core System ✅
- ✅ Markdown proposal submission
- ✅ AI-powered review by Azura (DeepSeek integration)
- ✅ 6-criteria evaluation (clarity, impact, feasibility, budget, ingenuity, chaos)
- ✅ Dynamic token allocation (1-40% based on quality)
- ✅ 3-stage progress visualization
- ✅ Transparent decision-making (reasoning tooltips)
- ✅ Rate limiting (1 proposal per week)
- ✅ Responsive design
- ✅ Database persistence

### Phase 2: Blockchain Integration ✅
- ✅ Azura wallet management (Coinbase CDP SDK)
- ✅ Real ERC-20 token transfers on Base network
- ✅ Secure transaction signing
- ✅ Automatic transaction monitoring
- ✅ Gas estimation and optimization
- ✅ Transaction confirmation tracking
- ✅ Full audit trail
- ✅ Error recovery mechanisms

### Phase 3: Community Voting 🔜
- ⏳ Token-weighted voting mechanism
- ⏳ Voting periods and deadlines
- ⏳ Results calculation and display
- ⏳ Community governance

## 🚀 Quick Start

### 1. Installation
```bash
git clone <your-repo>
cd academyv3
npm install
```

### 2. Environment Setup
```bash
# Copy example environment file
cp ENV_EXAMPLE.md .env.local

# Edit with your values
nano .env.local
```

Required variables:
- Database connection string
- DeepSeek API key
- Coinbase CDP API credentials
- Base network RPC endpoint
- Token contract address

See `PHASE_2_SETUP_GUIDE.md` for detailed setup instructions.

### 3. Database Setup
```bash
# Run migrations
psql $DATABASE_URL < db/migration-proposals.sql

# Or let the app auto-create schema on first run
```

### 4. Start Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000/voting`

## 📖 Documentation

### Setup & Configuration
- **[PHASE_2_SETUP_GUIDE.md](PHASE_2_SETUP_GUIDE.md)** - Complete setup instructions
- **[ENV_EXAMPLE.md](ENV_EXAMPLE.md)** - Environment variable reference

### Implementation Details
- **[VOTING_PROPOSAL_IMPLEMENTATION.md](VOTING_PROPOSAL_IMPLEMENTATION.md)** - Phase 1 plan
- **[PHASE_2_BLOCKCHAIN_INTEGRATION.md](PHASE_2_BLOCKCHAIN_INTEGRATION.md)** - Phase 2 architecture
- **[PHASE_2_COMPLETE.md](PHASE_2_COMPLETE.md)** - Phase 2 summary

### Testing & Operations
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Phase 1 testing instructions
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands and troubleshooting
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Full Phase 1 summary

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Create Page  │  │ Voting Page  │  │ Proposal Card│      │
│  │              │  │              │  │ + Finalize   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────┐
│         │    Next.js API Routes (Backend)     │             │
│         │                  │                  │             │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │   Create     │  │   Get All    │  │  Finalize    │      │
│  │  Proposal    │  │  Proposals   │  │  Proposal    │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                     │             │
│  ┌──────▼───────┐                    ┌──────▼───────┐      │
│  │    Azura     │                    │    Azura     │      │
│  │    Review    │                    │    Wallet    │      │
│  │  (DeepSeek)  │                    │  (CDP SDK)   │      │
│  └──────┬───────┘                    └──────┬───────┘      │
└─────────┼──────────────────────────────────────┼───────────┘
          │                                      │
┌─────────▼──────────────────────────────────────▼───────────┐
│                      Database (PostgreSQL)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  proposals   │  │proposal_     │  │proposal_     │     │
│  │              │  │reviews       │  │transactions  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│              Blockchain (Base Network)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Azura     │  │  ERC-20      │  │ Transaction  │     │
│  │    Wallet    │──│  Token       │──│  Monitor     │     │
│  │              │  │  Contract    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Submission**: User → Frontend → API → Database
2. **Review**: API → DeepSeek → Database
3. **Display**: Database → API → Frontend
4. **Finalization**: Frontend → API → Azura Wallet → Blockchain
5. **Monitoring**: Blockchain → Monitor → Database → Frontend

## 🔐 Security

### Wallet Security
- Private keys stored server-side only
- Environment variable encryption
- Automatic wallet backups
- Secure transaction signing

### API Security
- User authentication required
- Wallet address verification
- Rate limiting (1 proposal per week)
- SQL injection prevention
- Input validation

### Transaction Security
- Double-spending prevention
- Balance validation
- Gas estimation
- Transaction monitoring
- Automatic failure handling

## 🧪 Testing

### Phase 1 Testing
```bash
# 1. Submit proposal
# 2. Check Azura review
# 3. Verify display
# 4. Test rate limiting
```

See `TESTING_GUIDE.md` for detailed instructions.

### Phase 2 Testing
```bash
# 1. Test on Base Sepolia (testnet)
# 2. Verify wallet creation
# 3. Test token transfer
# 4. Monitor transaction
# 5. Verify confirmation
```

See `PHASE_2_SETUP_GUIDE.md` for detailed instructions.

## 📊 Database Schema

### proposals
Stores user proposal submissions

### proposal_reviews
Stores Azura's AI analysis and decisions

### proposal_transactions
Tracks blockchain transactions

See `db/migration-proposals.sql` for complete schema.

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Wagmi** - Ethereum React hooks
- **ConnectKit** - Wallet connection UI
- **Viem** - Ethereum interactions

### Backend
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Database
- **DeepSeek API** - AI analysis

### Blockchain
- **Coinbase CDP SDK** - Wallet management
- **Base Network** - L2 blockchain
- **ERC-20 Standard** - Token standard
- **Alchemy** - RPC provider

## 📈 Monitoring

### Key Metrics
- Azura wallet balance
- Total tokens allocated
- Transaction success rate
- Average gas costs
- Proposal approval rate
- Average review time

### Alerts
- Low wallet balance
- Failed transactions
- Long pending transactions
- API errors
- Network issues

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment
- Set all required environment variables
- Fund Azura's wallet with tokens
- Configure monitoring
- Set up alerts
- Test on testnet first

## 🔄 Roadmap

### ✅ Phase 1: Core System (Complete)
- Proposal submission
- AI review
- Display system

### ✅ Phase 2: Blockchain Integration (Complete)
- Wallet management
- Token transfers
- Transaction monitoring

### 🔜 Phase 3: Community Voting (Next)
- Voting mechanism
- Token-weighted votes
- Results calculation

### 🔜 Phase 4: Advanced Features (Future)
- Multi-sig wallet
- Automated refills
- Dynamic algorithms
- Governance dashboard
- Analytics

## 📞 Support

### Documentation
- Setup: `PHASE_2_SETUP_GUIDE.md`
- Testing: `TESTING_GUIDE.md`
- Reference: `QUICK_REFERENCE.md`

### Troubleshooting
- Check console logs
- Verify environment variables
- Test on Base Sepolia
- Review transaction on Basescan
- Check database records

### Common Issues
- Wallet not initializing → Check CDP credentials
- Transaction failing → Check token balance
- Review not triggering → Check DeepSeek API key
- Proposal not appearing → Check database connection

## 🏆 Success Criteria

System is successful when:
- ✅ Users can submit proposals easily
- ✅ Azura reviews automatically
- ✅ Decisions are transparent and fair
- ✅ Tokens transfer on-chain reliably
- ✅ Transactions confirm quickly
- ✅ System is secure and monitored
- ✅ Error handling is robust
- ✅ Documentation is complete

## 📜 License

See LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- Coinbase Developer Platform
- Base Network
- DeepSeek AI
- Next.js
- PostgreSQL

## 🎉 Status

- **Phase 1**: ✅ Complete & Tested
- **Phase 2**: ✅ Complete & Ready for Testing
- **Phase 3**: 📋 Planned
- **Production**: 🚀 Ready to Deploy (after testing)

---

**For detailed setup instructions, see [PHASE_2_SETUP_GUIDE.md](PHASE_2_SETUP_GUIDE.md)**

**For troubleshooting, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md)**

**Questions? Review the documentation files or check console logs for errors.**
