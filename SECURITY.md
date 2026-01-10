# Security Documentation

## Overview
This document outlines the security measures implemented in the Mental Wealth Academy application.

## Security Fixes Applied

### Critical Vulnerabilities Fixed ✅

#### 1. Wallet Authentication
- **Issue**: Wallet addresses were accepted without signature verification
- **Fix**: Implemented signature-based authentication with timestamp validation
- **Format**: `Bearer <address>:<signature>:<timestamp>`
- **Expiry**: Signatures expire after 5 minutes
- **File**: `lib/wallet-auth.ts`

#### 2. Session Cookie Validation
- **Issue**: Middleware only checked cookie existence, not validity
- **Fix**: Added UUID v4 format validation for session tokens
- **File**: `middleware.ts`

#### 3. Webhook Authentication
- **Issue**: Webhooks processed without signature verification in production
- **Fix**: Always require `CDP_WEBHOOK_SECRET` and signature verification
- **File**: `app/api/webhooks/cdp/route.ts`

#### 4. File Upload Authentication
- **Issue**: No authentication required for file uploads
- **Fix**: Added user authentication requirement
- **File**: `app/api/upload/route.ts`

#### 5. CORS Configuration
- **Issue**: No CORS headers configured
- **Fix**: Added proper CORS headers for API routes with origin restrictions
- **File**: `next.config.js`

### High Severity Vulnerabilities Fixed ✅

#### 6. Rate Limiting
Implemented rate limiting on all critical endpoints:
- **Login**: 5 attempts per 15 minutes per email/IP
- **Signup**: 3 attempts per hour per IP
- **AI Daemon**: 20 requests per hour per user
- **Forum Threads**: 10 threads per hour per user
- **Proposals**: 1 per week per user (existing)
- **File**: `lib/rate-limit.ts`

#### 7. Password Requirements
- **Old**: Minimum 8 characters
- **New**: Minimum 8 characters + uppercase + lowercase + number
- **File**: `app/api/auth/signup/route.ts`

#### 8. Security Headers
Added comprehensive security headers:
- `Strict-Transport-Security`: HTTPS enforcement
- `X-Frame-Options`: Clickjacking protection
- `X-Content-Type-Options`: MIME sniffing protection
- `X-XSS-Protection`: XSS protection
- `Referrer-Policy`: Privacy protection
- `Permissions-Policy`: Feature restrictions
- **File**: `next.config.js`

#### 9. Input Length Validation
- **Proposal content**: Max 20,000 characters
- **Forum posts**: Max 10,000 characters (enforced)
- **AI Daemon input**: Max 5,000 characters
- **Thread titles**: Max 200 characters

#### 10. Sensitive Data Protection
- Removed detailed error messages in production
- Masked database connection strings in logs
- Only log errors in development mode
- Don't log sensitive OAuth responses

### Medium Severity Improvements ✅

#### 11. Environment File Protection
Updated `.gitignore` to exclude:
- All `.env*` files
- Private keys (`.key`, `.pem`, `.cert`, `.p12`)
- Secret files (`secrets.json`, `service-account.json`)

## Security Best Practices

### Authentication
1. **Wallet Auth**: Always verify signatures with recent timestamps
2. **Session Auth**: Validate session token format and expiry
3. **API Keys**: Never commit to version control

### Rate Limiting
- All public endpoints have rate limiting
- Limits are per-user or per-IP
- Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Input Validation
- All user inputs are validated for type and length
- SQL queries use parameterized queries (no SQL injection)
- File uploads restricted to images only (PNG, JPEG, GIF, WEBP)
- Max file size: 5MB

### Error Handling
- Production: Generic error messages
- Development: Detailed error information
- Never expose database credentials or internal paths

## Environment Variables

### Required Security Variables
```env
# Database
DATABASE_URL=postgresql://...  # Use pooler connection for production

# Webhooks
CDP_WEBHOOK_SECRET=your-secret-here  # REQUIRED for webhook security

# Authentication
SESSION_SECRET=your-random-secret-key-here

# API Keys (keep secret)
DEEPSEEK_API_KEY=sk-...
X_API_KEY=...
X_SECRET=...
```

### Public Variables (Safe to expose)
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ALCHEMY_ID=...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

## Deployment Checklist

### Before Deploying to Production

- [ ] All environment variables set in Vercel/hosting platform
- [ ] `CDP_WEBHOOK_SECRET` configured
- [ ] `DATABASE_URL` uses pooler connection (not direct)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] SSL/TLS certificate configured
- [ ] Security headers verified (check with securityheaders.com)
- [ ] Rate limiting tested
- [ ] No `.env` files in repository
- [ ] All API keys rotated from development

### Monitoring

1. **Failed Authentication Attempts**
   - Monitor logs for repeated failed login attempts
   - Check rate limit violations

2. **Webhook Signature Failures**
   - Alert on invalid webhook signatures
   - Could indicate attack attempts

3. **Rate Limit Violations**
   - Track which endpoints are being rate limited
   - Adjust limits if legitimate users affected

## Known Limitations

### Smart Contract
- **Flash Loan Risk**: The voting contract uses `balanceOf()` at vote time, which could be exploited with flash loans
- **Mitigation**: Consider implementing vote snapshots or time-locked voting power

### Rate Limiting
- **In-Memory Storage**: Current implementation uses in-memory storage
- **Limitation**: Won't work across multiple server instances
- **Recommendation**: Use Redis for production with multiple servers

## Reporting Security Issues

If you discover a security vulnerability, please email: security@mentalwealthacademy.com

**Do not** open public GitHub issues for security vulnerabilities.

## Security Updates

### 2025-01-09
- Initial security audit completed
- 22 vulnerabilities identified and fixed
- Comprehensive security measures implemented

---

**Last Updated**: January 9, 2025
**Security Audit By**: AI Security Review
**Status**: ✅ All Critical and High Severity Issues Resolved
