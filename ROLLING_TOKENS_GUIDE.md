# Rolling Token Authentication Implementation

## Overview
This implementation replaces the basic session token system with a secure rolling token architecture using JWT tokens, bcrypt password hashing, and comprehensive rate limiting.

## Security Improvements

### 1. Rolling Token Architecture
- **Access Tokens**: Short-lived (15 minutes) secure random tokens for API access
- **Refresh Tokens**: Long-lived (7 days) secure random tokens for obtaining new access tokens
- **Token Rotation**: New tokens generated on each refresh, invalidating old ones
- **Version Tracking**: Each token rotation increments a version number

### 2. Enhanced Password Security
- **bcrypt Hashing**: Replaced SHA-256 with bcrypt (12 rounds)
- **Salt Rounds**: Configurable salt rounds for future-proofing
- **Secure Comparison**: Constant-time password verification

### 3. Rate Limiting
- **Login Protection**: 5 attempts per 15 minutes, 30-minute blocks
- **Token Refresh**: 10 attempts per 5 minutes, 10-minute blocks
- **General API**: 60 requests per minute, 5-minute blocks
- **IP + User Agent**: Combined client identification

### 4. Security Headers
- **XSS Protection**: X-XSS-Protection, Content-Security-Policy
- **Clickjacking**: X-Frame-Options: DENY
- **MIME Sniffing**: X-Content-Type-Options: nosniff
- **HTTPS Enforcement**: Strict-Transport-Security in production

## Database Changes

### Required Migration
Run the following SQL scripts in order:

1. **Initial Setup**: `scripts/setup_auth_tables.sql`
2. **Rolling Tokens**: `scripts/rolling_tokens_migration.sql`

### New Database Functions
- `generate_session_token()`: Secure random token generation
- `create_session_with_refresh()`: Create session with access/refresh tokens
- `refresh_access_token()`: Token rotation logic
- `revoke_all_user_sessions()`: Security cleanup
- `cleanup_expired_sessions()`: Automated cleanup

## Environment Variables

Add these to your `.env.local` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boooks_db
DB_USER=boooks
DB_PASSWORD=boooks_pass

# Environment
NODE_ENV=production  # or development
```

## API Changes

### New Endpoints
- `POST /api/refresh` - Refresh access tokens
- `GET /api/refresh/check` - Check token status

### Modified Endpoints
- `POST /api/login` - Now returns access/refresh tokens
- `GET /api/verify-session` - Uses access tokens
- `DELETE /api/logout` - Revokes both token types

### Cookie Changes
- `access_token`: HttpOnly, 15-minute expiry
- `refresh_token`: HttpOnly, 7-day expiry
- Removed: `session_token` (legacy)

## Client-Side Integration

### Automatic Token Refresh
The authentication middleware automatically refreshes tokens when:
- Access token expires within 5 minutes
- Invalid access token with valid refresh token

### Error Handling
- `401 Unauthorized`: Token expired/invalid, redirect to login
- `429 Too Many Requests`: Rate limit exceeded, show retry timer

### Auth Store Updates
The client auth store should handle:
- Access token storage (short-term)
- Automatic refresh on API calls
- Logout on refresh token expiry

## Security Best Practices

### Token Management
1. **Never store tokens in localStorage** - Use httpOnly cookies
2. **Implement CSRF protection** - SameSite cookies + CSRF tokens
3. **Monitor failed attempts** - Log and alert on suspicious activity
4. **Regular cleanup** - Automated removal of expired sessions

### Rate Limiting
1. **Progressive delays** - Increase delays with repeated failures
2. **IP allowlisting** - Bypass limits for trusted IPs
3. **Redis in production** - Replace in-memory store with Redis

### Monitoring
1. **Session analytics** - Track active sessions per user
2. **Failed login alerts** - Notify on repeated failures
3. **Token rotation logs** - Monitor refresh patterns

## Migration Steps

### 1. Database Setup
```sql
-- Run migrations
\i scripts/setup_auth_tables.sql
\i scripts/rolling_tokens_migration.sql
```

### 2. Dependencies
```bash
npm install bcryptjs
```

### 3. Environment Configuration
Update `.env.local` with database configuration.

### 4. Client Updates
Update frontend auth logic to:
- Handle new token structure
- Implement automatic refresh
- Handle rate limiting responses

### 5. Testing
- Test token refresh flow
- Verify rate limiting works
- Check security headers
- Test logout functionality

## Production Considerations

### Performance
- **Redis for rate limiting** - Replace in-memory store
- **Database indexing** - Ensure proper indexes on session tables
- **Connection pooling** - Optimize database connections

### Security
- **Secrets management** - Use proper secret management service
- **HTTPS only** - Enforce SSL/TLS in production
- **Log monitoring** - Implement comprehensive logging
- **Regular updates** - Keep dependencies updated

### Scalability
- **Horizontal scaling** - Share session state via Redis
- **Load balancing** - Sticky sessions not required
- **CDN integration** - Proper cache headers for static assets

## Troubleshooting

### Common Issues
1. **Token refresh loops** - Check JWT secret configuration
2. **Rate limiting false positives** - Adjust client identification logic
3. **Session cleanup** - Ensure cleanup functions run regularly

### Debug Tools
- Check rate limit headers: `X-RateLimit-*`
- Verify JWT tokens: Use jwt.io for debugging
- Monitor database sessions: Query `user_sessions` table

## Security Audit Checklist

- [ ] JWT secrets are cryptographically secure
- [ ] Password hashing uses bcrypt with sufficient rounds
- [ ] Rate limiting prevents brute force attacks
- [ ] Security headers are properly set
- [ ] Tokens rotate on each refresh
- [ ] Expired sessions are cleaned up
- [ ] HTTPS is enforced in production
- [ ] Sensitive data is not logged
- [ ] CSRF protection is implemented
- [ ] Input validation is comprehensive