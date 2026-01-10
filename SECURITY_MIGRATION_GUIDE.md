# Security Migration Guide

## Overview
This guide helps you migrate to the new secure authentication system.

## Breaking Changes

### 1. Wallet Authentication (CRITICAL)

#### Old Format (DEPRECATED)
```typescript
// ❌ This will only work in development mode
headers: {
  Authorization: `Bearer ${walletAddress}`
}
```

#### New Format (REQUIRED)
```typescript
// ✅ Use signed authentication
import { createWalletAuthHeader } from '@/lib/wallet-auth-client';

const headers = await createWalletAuthHeader(address, signMessageAsync);
// Result: Authorization: "Bearer 0x123...:0xabc...:1704844800000"
```

### 2. File Upload Now Requires Authentication

#### Migration Steps
```typescript
// Before: Anyone could upload
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

// After: Must be authenticated
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    // Add session cookie or wallet auth
  },
  body: formData,
});
```

### 3. AI Daemon Endpoint Requires Authentication

#### Migration Steps
```typescript
// Before: Public endpoint
const response = await fetch('/api/daemon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'Hello' }),
});

// After: Requires authentication + rate limited (20/hour)
const response = await fetch('/api/daemon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Session cookie automatically included
  },
  body: JSON.stringify({ input: 'Hello' }),
});
```

### 4. Webhook Secret Now Required

#### Migration Steps
1. Add to `.env.local`:
```env
CDP_WEBHOOK_SECRET=your-secret-from-coinbase-dashboard
```

2. Configure in Coinbase CDP Dashboard:
   - Go to Webhooks settings
   - Set the same secret value
   - Webhooks will now be verified

### 5. Password Requirements Strengthened

#### Old Requirements
- Minimum 8 characters

#### New Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

#### User Impact
- Existing users: Not affected (passwords already hashed)
- New signups: Must meet new requirements
- Password resets: Must meet new requirements

### 6. Rate Limiting Added

#### Affected Endpoints

| Endpoint | Limit | Window | Identifier |
|----------|-------|--------|------------|
| `/api/auth/login` | 5 attempts | 15 min | Email/IP |
| `/api/auth/signup` | 3 attempts | 1 hour | IP |
| `/api/daemon` | 20 requests | 1 hour | User ID |
| `/api/forum/threads` | 10 threads | 1 hour | User ID |
| `/api/voting/proposal/create` | 1 proposal | 7 days | User ID |
| `/api/upload` | Inherits session limits | - | User ID |

#### Handling Rate Limits
```typescript
const response = await fetch('/api/endpoint');

if (response.status === 429) {
  const data = await response.json();
  const resetTime = response.headers.get('X-RateLimit-Reset');
  
  console.error(`Rate limited. Try again at: ${resetTime}`);
  // Show user-friendly error message
}
```

## Frontend Updates Required

### 1. Update Wallet Authentication Calls

Find all instances of wallet-authenticated API calls and update them:

```bash
# Search for old pattern
grep -r "Authorization.*Bearer.*address" ./components
grep -r "Authorization.*Bearer.*walletAddress" ./components
```

Replace with:
```typescript
import { createWalletAuthHeader } from '@/lib/wallet-auth-client';
import { useSignMessage, useAccount } from 'wagmi';

function MyComponent() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  async function callAPI() {
    if (!address) return;
    
    const authHeaders = await createWalletAuthHeader(address, signMessageAsync);
    
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ data: 'value' }),
    });
  }
}
```

### 2. Add Rate Limit UI Feedback

```typescript
function handleRateLimitError(response: Response) {
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const resetDate = new Date(resetTime || Date.now());
    
    // Show toast/notification
    toast.error(
      `Too many requests. Please try again at ${resetDate.toLocaleTimeString()}`
    );
    return true;
  }
  return false;
}

// Usage
const response = await fetch('/api/endpoint');
if (handleRateLimitError(response)) return;
```

### 3. Update Password Validation UI

```typescript
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain an uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain a lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain a number';
  }
  return null; // Valid
}
```

## Environment Variables

### Required Updates

#### Development (.env.local)
```env
# Add these new variables
CDP_WEBHOOK_SECRET=your-dev-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Production (Vercel/Hosting)
```env
# Update these
CDP_WEBHOOK_SECRET=your-production-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://... # Use pooler connection
```

## Testing Checklist

### Authentication
- [ ] Wallet authentication with signature works
- [ ] Old wallet auth format fails in production
- [ ] Session authentication still works
- [ ] Unauthenticated requests to protected endpoints fail

### Rate Limiting
- [ ] Login rate limiting works (5 attempts)
- [ ] Signup rate limiting works (3 attempts)
- [ ] AI daemon rate limiting works (20/hour)
- [ ] Rate limit headers present in responses

### Webhooks
- [ ] Webhooks with valid signature accepted
- [ ] Webhooks without signature rejected
- [ ] Webhooks with invalid signature rejected

### File Upload
- [ ] Authenticated users can upload
- [ ] Unauthenticated requests rejected
- [ ] File size limits enforced (5MB)
- [ ] File type restrictions enforced

### Password Requirements
- [ ] New signups require strong passwords
- [ ] Weak passwords rejected with clear error
- [ ] Existing users can still login

## Rollback Plan

If issues arise, you can temporarily enable legacy mode:

### 1. Wallet Auth Legacy Mode
In `lib/wallet-auth.ts`, the legacy format is already supported in development:
```typescript
// Automatically falls back to simple address in development
if (process.env.NODE_ENV === 'development') {
  // Legacy format accepted
}
```

### 2. Disable Rate Limiting
Comment out rate limit checks in affected endpoints (not recommended).

### 3. Revert Webhook Validation
In `app/api/webhooks/cdp/route.ts`, temporarily allow missing secrets (not recommended for production).

## Timeline

### Phase 1: Immediate (Required for Production)
- ✅ All critical vulnerabilities fixed
- ✅ Rate limiting implemented
- ✅ Security headers added
- ✅ Webhook authentication enforced

### Phase 2: Frontend Updates (Next Sprint)
- [ ] Update all wallet auth calls to use signatures
- [ ] Add rate limit UI feedback
- [ ] Update password validation UI
- [ ] Add security documentation to user-facing docs

### Phase 3: Monitoring (Ongoing)
- [ ] Set up alerts for rate limit violations
- [ ] Monitor failed authentication attempts
- [ ] Track webhook signature failures
- [ ] Review security logs weekly

## Support

If you encounter issues during migration:

1. Check the console for detailed error messages (development mode)
2. Review `SECURITY.md` for implementation details
3. Check rate limit headers in API responses
4. Verify environment variables are set correctly

## Additional Resources

- [SECURITY.md](./SECURITY.md) - Complete security documentation
- [lib/wallet-auth-client.ts](./lib/wallet-auth-client.ts) - Client-side auth utilities
- [lib/rate-limit.ts](./lib/rate-limit.ts) - Rate limiting implementation

---

**Migration Support**: Open an issue with the `security` label for assistance.
**Last Updated**: January 9, 2025
