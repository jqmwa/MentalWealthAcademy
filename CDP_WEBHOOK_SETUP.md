# CDP Webhook Setup Guide

## 🎯 Overview

Set up Coinbase Developer Platform webhooks to monitor AzuraKillStreak contract events in real-time.

## 📝 Prerequisites

- Deployed AzuraKillStreak contract on Base (Sepolia or Mainnet)
- CDP account at [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
- Public webhook endpoint (use ngrok for local testing)

## 🔧 Setup Steps

### Step 1: Create CDP Webhook

1. Go to [CDP Portal - Node Product](https://portal.cdp.coinbase.com/products/data/node)
2. Select your project
3. Navigate to "Webhooks" section
4. Click "Create Webhook"

### Step 2: Configure Webhook

**Webhook Configuration:**
```json
{
  "url": "https://your-domain.com/api/webhooks/cdp",
  "events": [
    "log.created"
  ],
  "network": "base-sepolia",
  "filters": {
    "contract_address": "0xYOUR_AZURAKILLSTREAK_ADDRESS"
  }
}
```

For local testing with ngrok:
```bash
# Install ngrok
brew install ngrok

# Start ngrok
ngrok http 3000

# Use ngrok URL in webhook
# https://abc123.ngrok.io/api/webhooks/cdp
```

### Step 3: Set Webhook Secret

```env
# Add to .env.local
CDP_WEBHOOK_SECRET=your_webhook_secret_here
```

CDP will provide this secret - use it to verify webhook signatures.

### Step 4: Configure Event Filters

Monitor these specific events from AzuraKillStreak:

```
✅ ProposalCreated
✅ AzuraReview
✅ VoteCast
✅ ProposalExecuted
✅ ProposalRejected
✅ ProposalCancelled
```

Event signature examples:
```
ProposalCreated(uint256 indexed proposalId, address indexed proposer, address indexed recipient, uint256 usdcAmount, string title, uint256 votingDeadline)

AzuraReview(uint256 indexed proposalId, uint256 azuraLevel, bool approved, uint256 voteWeight)

VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)

ProposalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 usdcAmount)
```

## 🧪 Testing Webhooks

### Test with ngrok (Local Development)

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Terminal 3: Create test proposal on-chain
cd contracts
cast send $CONTRACT_ADDRESS \
  "createProposal(address,uint256,string,string,uint256)" \
  $RECIPIENT \
  10000000000 \
  "Test" \
  "Testing webhooks" \
  604800 \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Check webhook received in Terminal 1
```

### Test Webhook Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/webhooks/cdp \
  -H "Content-Type: application/json" \
  -d '{
    "type": "log.created",
    "network": "base-sepolia",
    "transactionHash": "0x123...",
    "blockNumber": 12345,
    "contractAddress": "0xYOUR_CONTRACT",
    "eventName": "ProposalCreated",
    "eventData": {
      "proposalId": 1,
      "proposer": "0x...",
      "recipient": "0x...",
      "usdcAmount": 10000000000,
      "title": "Test Proposal",
      "votingDeadline": 1234567890
    },
    "timestamp": "2026-01-10T00:00:00Z"
  }'
```

## 🔒 Security

### Webhook Signature Verification

Our handler verifies signatures using HMAC-SHA256:

```typescript
// Automatically handled in /api/webhooks/cdp/route.ts
const signature = request.headers.get('x-cdp-signature');
const isValid = await verifyWebhookSignature(body, signature, secret);
```

### Best Practices

- ✅ Always verify signatures in production
- ✅ Use HTTPS for webhook URLs
- ✅ Implement idempotency (handle duplicate events)
- ✅ Rate limit webhook endpoint
- ✅ Log all webhook events
- ✅ Monitor for missing events
- ✅ Implement retry logic for failed processing

## 📊 Event Processing Flow

```
1. On-chain event occurs (e.g., VoteCast)
   ↓
2. CDP detects event
   ↓
3. CDP sends webhook to your endpoint
   ↓
4. Your handler verifies signature
   ↓
5. Process event based on type
   ↓
6. Update database (optional - blockchain is source of truth)
   ↓
7. Notify frontend via real-time updates
   ↓
8. Return 200 OK to CDP
```

## 🎯 Events We Handle

### ProposalCreated
- Updates database proposal status to 'on_chain_pending'
- Notifies frontend of new proposal

### AzuraReview
- Updates proposal based on Azura's decision
- Status: 'on_chain_active' (approved) or 'rejected' (killed)

### VoteCast
- Logs vote for transparency (optional)
- Blockchain is source of truth

### ProposalExecuted
- Updates proposal status to 'executed'
- Records transaction hash
- Triggers success notifications

### ProposalRejected
- Updates status to 'rejected'
- Logs rejection reason

## 🔍 Monitoring

### Check Webhook Deliveries

CDP Portal shows:
- Delivery status (success/failed)
- Response codes
- Response times
- Retry attempts

### Debug Failed Webhooks

```bash
# Check application logs
pm2 logs

# Check database for missing updates
SELECT * FROM proposals WHERE status = 'pending_review' AND created_at < NOW() - INTERVAL '5 minutes';

# Manually replay event if needed
curl -X POST http://localhost:3000/api/webhooks/cdp ...
```

## ⚡ Real-Time Frontend Updates

Use webhooks to trigger real-time UI updates:

```typescript
// In your API route, after processing
// Use Server-Sent Events (SSE) or WebSockets
import { EventEmitter } from 'events';

// Emit event to frontend
eventEmitter.emit('proposal:updated', {
  proposalId,
  status: 'executed',
});
```

## 🛠️ Testing Checklist

- [ ] Webhook endpoint accessible publicly
- [ ] Signature verification working
- [ ] ProposalCreated events processed
- [ ] AzuraReview events processed
- [ ] VoteCast events logged
- [ ] ProposalExecuted events update database
- [ ] Error handling for malformed events
- [ ] Idempotency working (duplicate events)
- [ ] Rate limiting configured
- [ ] Monitoring dashboard showing deliveries

## 📚 Resources

- [CDP Webhooks Documentation](https://docs.cdp.coinbase.com/developer-platform/docs/webhooks)
- [CDP Portal](https://portal.cdp.coinbase.com/)
- [ngrok Documentation](https://ngrok.com/docs)
- [HMAC Signature Verification](https://en.wikipedia.org/wiki/HMAC)

## ✅ Success Criteria

Webhooks are working when:
- ✅ Events received within seconds of on-chain occurrence
- ✅ Signatures verified correctly
- ✅ Database updates reflect on-chain state
- ✅ Frontend shows real-time updates
- ✅ No missed events
- ✅ Error handling works correctly

---

**Ready to set up? Follow the steps above and test with ngrok first!** 🚀
