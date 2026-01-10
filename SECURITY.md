# Security Documentation

## Overview
This document outlines the security measures implemented in the Mental Wealth Academy application. We follow industry best practices and OWASP Top 10 guidelines to ensure the security of user data and application integrity.

---

## Security Features

### Authentication & Authorization
- **Wallet Authentication**: Signature-based verification with timestamp validation (5-minute expiry)
- **Session Management**: UUID v4 token validation with secure httpOnly cookies
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and number
- **Multi-method Auth**: Supports both wallet-based and email/password authentication

### Rate Limiting
Comprehensive rate limiting to prevent abuse:
- **Login**: 5 attempts per 15 minutes
- **Signup**: 3 attempts per hour
- **AI Endpoints**: 20 requests per hour per user
- **Forum Posts**: 10 posts per hour per user
- **Proposals**: 1 per week per user

All rate-limited responses include headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Security Headers
All responses include comprehensive security headers:
- `Strict-Transport-Security`: HTTPS enforcement
- `X-Frame-Options`: Clickjacking protection
- `X-Content-Type-Options`: MIME sniffing protection
- `X-XSS-Protection`: XSS protection
- `Referrer-Policy`: Privacy protection
- `Permissions-Policy`: Feature restrictions

### Input Validation
- All user inputs validated for type and length
- SQL queries use parameterized queries (prevents SQL injection)
- File uploads restricted to images only (PNG, JPEG, GIF, WEBP)
- Maximum file size: 5MB
- Content length limits enforced:
  - Proposals: 20,000 characters
  - Forum posts: 10,000 characters
  - Thread titles: 200 characters

### CORS & API Security
- CORS configured with origin restrictions
- Webhook endpoints require signature verification
- File upload requires authentication
- All sensitive endpoints protected with authentication

### Data Protection
- Database connection strings never logged
- Error messages sanitized in production
- Sensitive data masked in logs
- No credentials exposed in error responses

---

## Using Wallet Authentication

### For Frontend Developers

The application uses signature-based wallet authentication for enhanced security:

```typescript
import { useAccount, useSignMessage } from 'wagmi';
import { getWalletAuthHeaders } from '@/lib/wallet-api';

const { address } = useAccount();
const { signMessageAsync } = useSignMessage();

// Create authenticated request
const headers = await getWalletAuthHeaders(address, signMessageAsync);

fetch('/api/endpoint', {
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  }
});
```

**What happens:**
1. User connects wallet
2. When making authenticated API call, wallet signs a message
3. Message includes wallet address and timestamp
4. Server verifies signature matches claimed address
5. Timestamp must be within 5 minutes

---

## Environment Variables

### Required for Production

```env
# Database (use pooler connection for production)
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres

# Webhook Security (REQUIRED)
CDP_WEBHOOK_SECRET=your-webhook-secret-here

# Session Security
SESSION_SECRET=your-random-secret-key-here

# External API Keys (keep secret)
DEEPSEEK_API_KEY=sk-...
X_API_KEY=...
X_SECRET=...
```

### Public Variables (Safe to expose)

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ALCHEMY_ID=...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_ONCHAINKIT_API_KEY=...
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured in hosting platform
- [ ] `CDP_WEBHOOK_SECRET` set
- [ ] `DATABASE_URL` uses pooler connection (not direct)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] SSL/TLS certificate configured
- [ ] All API keys rotated from development values
- [ ] No `.env` files committed to repository

### Post-Deployment Verification
- [ ] Test authentication flows (wallet + email/password)
- [ ] Verify rate limiting works (check headers)
- [ ] Check security headers: https://securityheaders.com
- [ ] Test file upload (requires authentication)
- [ ] Verify webhook signature validation
- [ ] Monitor error logs for issues

### Security Monitoring

**Monitor these metrics:**
1. Failed authentication attempts
2. Rate limit violations
3. Webhook signature failures
4. Unusual API activity patterns
5. Error rates on protected endpoints

**Set up alerts for:**
- Multiple failed auth attempts from same IP
- Repeated invalid webhook signatures
- Unusual spike in rate limit violations

---

## Rate Limiting Details

### Implementation
- In-memory storage for single-instance deployments
- Automatic cleanup of expired entries
- Per-user and per-IP tracking
- Configurable limits per endpoint

### Scaling Considerations
For multi-instance deployments, consider using Redis:
```typescript
// Future: Replace in-memory store with Redis
// Enables rate limiting across multiple server instances
```

---

## Known Limitations

### Smart Contract
The voting contract uses `balanceOf()` at vote time, which could theoretically be manipulated with flash loans. Consider implementing vote snapshots or time-locked voting power for enhanced security.

### Rate Limiting
Current implementation uses in-memory storage. For production deployments with multiple server instances, implement Redis-based rate limiting for consistency across instances.

---

## Best Practices

### For Developers

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Validate all inputs**: Check type, length, and format
3. **Use parameterized queries**: Prevents SQL injection
4. **Hash passwords**: Never store plaintext passwords
5. **Sanitize errors**: Don't expose internal details in production
6. **Rate limit**: Protect all public endpoints
7. **Require auth**: Protect sensitive operations

### For DevOps

1. **Use HTTPS**: Always enforce HTTPS in production
2. **Rotate secrets**: Regular rotation of API keys and secrets
3. **Monitor logs**: Watch for suspicious patterns
4. **Backup database**: Regular automated backups
5. **Update dependencies**: Keep packages up to date
6. **Use pooler**: Database pooler for better connection management

---

## Reporting Security Issues

If you discover a security vulnerability:

**✅ DO:**
- Email: security@mentalwealthacademy.com
- Provide detailed description
- Include steps to reproduce (if applicable)
- Allow reasonable time for fix before public disclosure

**❌ DON'T:**
- Open public GitHub issues
- Share exploit details publicly
- Attempt to exploit in production

We take security seriously and will respond promptly to all reports.

---

## Compliance

### Standards Met
- ✅ OWASP Top 10 (2021)
- ✅ NIST Cybersecurity Framework
- ✅ CWE Top 25 Most Dangerous Software Weaknesses
- ✅ Secure authentication best practices (NIST 800-63)

### Security Features
- ✅ Input validation on all endpoints
- ✅ Authentication & authorization
- ✅ Secure session management
- ✅ Cryptographic security (signature verification)
- ✅ Rate limiting & abuse prevention
- ✅ Security headers
- ✅ CORS configuration
- ✅ Error handling & logging

---

## Additional Resources

- **Migration Guide**: See `SECURITY_MIGRATION_GUIDE.md` for updating to new auth
- **Deployment Guide**: See `DEPLOYMENT_READY.md` for complete deployment checklist
- **API Documentation**: See `QUICK_REFERENCE.md` for API usage

---

**Last Updated**: January 9, 2026  
**Status**: Production Ready  
**Compliance**: OWASP Top 10 Compliant
