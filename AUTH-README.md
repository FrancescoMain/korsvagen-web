# KORSVAGEN Authentication System

## Overview

A comprehensive JWT-based authentication system with advanced security features including rate limiting, CSRF protection, password hashing, and token blacklisting.

## Features

### 🔐 Authentication

- **JWT Access Tokens**: Short-lived (1h) tokens for API authentication
- **JWT Refresh Tokens**: Long-lived (7d) tokens for seamless renewal
- **Token Blacklisting**: Secure logout with token invalidation
- **Password Hashing**: bcrypt with 12 salt rounds

### 🛡️ Security

- **Rate Limiting**: Multi-layer protection against brute force attacks
- **CSRF Protection**: Token-based cross-site request forgery prevention
- **Input Validation**: Comprehensive sanitization and validation
- **Account Locking**: Automatic lockout after failed attempts
- **Security Headers**: Helmet.js with comprehensive CSP

### 👥 User Management

- **Role-Based Access**: Admin and Editor roles
- **Account Status**: Active/inactive user management
- **Password Management**: Secure password changes
- **Audit Logging**: Authentication event tracking

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                    | Description                           | Auth Required |
| ------ | --------------------------- | ------------------------------------- | ------------- |
| POST   | `/api/auth/login`           | User login with email/password        | No            |
| POST   | `/api/auth/logout`          | Secure logout with token blacklisting | Yes           |
| POST   | `/api/auth/refresh`         | Refresh access token                  | Refresh Token |
| GET    | `/api/auth/me`              | Get current user profile              | Yes           |
| GET    | `/api/auth/verify`          | Verify token validity                 | Yes           |
| POST   | `/api/auth/change-password` | Change user password                  | Yes + CSRF    |

### Request/Response Examples

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@korsvagen.com",
  "password": "admin123"
}
```

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@korsvagen.com",
      "name": "Administrator",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "1h",
    "tokenType": "Bearer",
    "csrfToken": "csrf-token-here"
  }
}
```

#### Protected Request

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Security Configuration

### Rate Limiting

| Endpoint Type  | Limit              | Window     | Block Duration |
| -------------- | ------------------ | ---------- | -------------- |
| General API    | 100 requests       | 15 minutes | -              |
| Authentication | 5 attempts         | 15 minutes | -              |
| Account Lock   | 5 failed logins    | -          | 30 minutes     |
| IP Block       | 10 failed attempts | -          | 1 hour         |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Configuration

- **Algorithm**: HS256
- **Access Token**: 1 hour expiration
- **Refresh Token**: 7 days expiration
- **Issuer**: korsvagen-api
- **Audience**: korsvagen-cms

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_256_bits
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your_session_secret

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=30
```

## Database Schema

### Users Table Extensions

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  password_hash TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP WITH TIME ZONE;
```

### Audit Log Table

```sql
CREATE TABLE auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Frontend Integration

### Token Storage

```javascript
// Store tokens securely
localStorage.setItem("accessToken", response.data.accessToken);
// Refresh token is stored in HTTP-only cookie automatically
```

### API Requests

```javascript
// Include token in requests
const token = localStorage.getItem("accessToken");
const response = await fetch("/api/protected-endpoint", {
  headers: {
    Authorization: `Bearer ${token}`,
    "X-CSRF-Token": csrfToken, // For sensitive operations
  },
});
```

### Token Refresh

```javascript
// Automatic token refresh
async function refreshToken() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // Include refresh token cookie
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("accessToken", data.data.accessToken);
    return data.data.accessToken;
  }

  // Redirect to login if refresh fails
  window.location.href = "/login";
}
```

### Error Handling

```javascript
// Handle authentication errors
if (response.status === 401) {
  if (error.code === "TOKEN_EXPIRED") {
    // Try to refresh token
    await refreshToken();
    // Retry original request
  } else {
    // Redirect to login
    window.location.href = "/login";
  }
}
```

## Middleware Usage

### Authentication Middleware

```javascript
import {
  authenticateToken,
  requireAdmin,
  requireEditor,
} from "./utils/auth.js";

// Protect all routes
app.use("/api/admin/*", authenticateToken, requireAdmin);

// Protect with role requirement
app.use("/api/content/*", authenticateToken, requireEditor);

// Optional authentication
app.use("/api/public/*", optionalAuth);
```

### Rate Limiting

```javascript
import { authRateLimit, generalRateLimit } from "./utils/rateLimiter.js";

// Apply to authentication endpoints
app.use("/api/auth/login", authRateLimit);

// Apply to all API endpoints
app.use("/api/*", generalRateLimit);
```

## Testing

Run the authentication test suite:

```bash
# Make sure server is running
npm run dev

# Run authentication tests
node test-auth.js
```

### Test Coverage

- ✅ User login/logout flow
- ✅ Token generation and validation
- ✅ Token refresh mechanism
- ✅ Protected route access
- ✅ Rate limiting behavior
- ✅ Invalid token handling
- ✅ Password change flow

## Production Deployment

### Security Checklist

- [ ] Update JWT secrets to cryptographically strong values
- [ ] Enable HTTPS for secure cookie transmission
- [ ] Configure proper CORS origins
- [ ] Set up Redis for token blacklisting (recommended)
- [ ] Configure log aggregation for audit trails
- [ ] Review and test rate limiting thresholds
- [ ] Set up monitoring for authentication failures

### Performance Considerations

- **Token Blacklist**: Use Redis in production for distributed systems
- **Rate Limiting**: Use Redis for cross-instance rate limiting
- **Session Store**: Use external store for load balancing
- **Database Indexing**: Ensure email and token indexes exist

## Troubleshooting

### Common Issues

**Login fails with 401**

- Check email/password combination
- Verify user account is active
- Check if account is locked

**Token validation fails**

- Verify JWT_SECRET matches between login and verification
- Check token expiration
- Ensure token is included in Authorization header

**Rate limiting triggered**

- Wait for rate limit window to reset
- Check IP isn't blocked
- Verify rate limit configuration

**CSRF token errors**

- Include X-CSRF-Token header for sensitive operations
- Ensure CSRF token is obtained from login response
- Check cookie configuration

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development
LOG_LEVEL=debug
```

## Security Considerations

### Production Recommendations

1. **Strong Secrets**: Use cryptographically secure random secrets
2. **HTTPS Only**: Never transmit tokens over HTTP
3. **Token Rotation**: Implement regular token rotation
4. **Monitoring**: Set up authentication failure monitoring
5. **Backup**: Regular backup of user data and audit logs

### Compliance

- **OWASP Top 10**: Addresses authentication vulnerabilities
- **JWT Best Practices**: Follows RFC 7519 guidelines
- **NIST Guidelines**: Password requirements follow NIST standards
- **GDPR Compliance**: Audit logging supports compliance requirements

## License

This authentication system is part of the KORSVAGEN Web Application project.

## Support

For issues or questions about the authentication system, please refer to the project documentation or contact the development team.
