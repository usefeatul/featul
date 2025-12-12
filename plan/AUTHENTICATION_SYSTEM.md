# Authentication & Authorization System

## Overview

oreilla implements a comprehensive authentication and authorization system using Better-Auth with role-based access control (RBAC) to ensure secure access to feedback management features.

## Authentication Strategy

### Core Authentication Provider
- **Primary**: Better-Auth
- **Session Management**: JWT tokens with refresh token rotation
- **Security**: CSRF protection, rate limiting, secure cookie handling

### Supported Authentication Methods

#### 1. Email/Password Authentication
- Email verification required
- Password strength requirements (8+ chars, mixed case, numbers, symbols)
- Password reset via secure email links
- Account lockout after failed attempts

#### 2. Social Authentication
- **Google OAuth 2.0**
- **GitHub OAuth**
- **Microsoft Azure AD**
- **Discord OAuth** (for developer communities)

#### 3. Enterprise Authentication
- **SAML 2.0** (Enterprise tier)
- **OIDC (OpenID Connect)** (Enterprise tier)
- **Active Directory integration** (Enterprise tier)

## Authorization Model

### Role-Based Access Control (RBAC)

#### System Roles
1. **Super Admin**
   - Platform-wide administration
   - User management across organizations
   - System configuration

2. **Organization Owner**
   - Full organization control
   - Billing and subscription management
   - Member management
   - Organization settings

3. **Organization Admin**
   - User management within organization
   - Category and project management
   - Integration configuration
   - Analytics access

4. **Moderator**
   - Feedback moderation
   - Comment management
   - User content oversight
   - Basic analytics

5. **Member**
   - Submit feedback
   - Vote and comment
   - View public feedback
   - Basic profile management

6. **Viewer**
   - Read-only access
   - View feedback and comments
   - No voting or submission rights

### Permission Matrix

| Action | Super Admin | Org Owner | Org Admin | Moderator | Member | Viewer |
|--------|-------------|-----------|-----------|-----------|--------|---------|
| Create Organization | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Billing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invite Users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Categories | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Submit Feedback | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Moderate Content | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Vote on Feedback | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

## Security Implementation

### Session Management
```typescript
// Session configuration
const sessionConfig = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  updateAge: 24 * 60 * 60,   // 24 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax'
};
```

### Rate Limiting
- **Login attempts**: 5 per 15 minutes per IP
- **Password reset**: 3 per hour per email
- **API calls**: 1000 per hour per user (Free), 10000 (Pro), Unlimited (Enterprise)
- **Feedback submission**: 10 per hour per user

### Data Protection
- **Encryption at rest**: AES-256
- **Encryption in transit**: TLS 1.3
- **PII handling**: GDPR compliant data processing
- **Audit logging**: All authentication events logged

## Multi-Tenant Architecture

### Organization Isolation
- **Database**: Row-level security with organization_id
- **API**: Automatic tenant filtering in middleware
- **Storage**: Organization-scoped file access
- **Analytics**: Tenant-isolated metrics

### Cross-Organization Access
- Users can belong to multiple organizations
- Role inheritance not supported across organizations
- Separate permissions per organization

## API Authentication

### Authentication Methods
1. **Session Cookies** (Web app)
2. **JWT Bearer Tokens** (API access)
3. **API Keys** (Server-to-server)

### API Key Management
```typescript
// API Key structure
interface APIKey {
  id: string;
  name: string;
  organizationId: string;
  permissions: Permission[];
  lastUsed: Date;
  expiresAt: Date;
  isActive: boolean;
}
```

### Webhook Authentication
- **HMAC-SHA256** signature verification
- **Timestamp validation** (5-minute window)
- **Replay attack prevention**

## Implementation Details

### Better-Auth Configuration
```typescript
// auth.config.ts
export const authConfig = {
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24      // 24 hours
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      // Custom sign-in logic
      return true;
    },
    session: async ({ session, user }) => {
      // Add custom session data
      return session;
    }
  }
};
```

### Middleware Implementation
```typescript
// auth.middleware.ts
export async function authMiddleware(req: Request) {
  const session = await getSession(req);
  
  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }
  
  // Add user context to request
  req.user = session.user;
  req.organizationId = getOrganizationFromRequest(req);
  
  return session;
}

export async function requireRole(role: Role) {
  return async (req: Request) => {
    const session = await authMiddleware(req);
    const userRole = await getUserRole(session.user.id, req.organizationId);
    
    if (!hasPermission(userRole, role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}
```

## Security Best Practices

### Password Security
- **Hashing**: bcrypt with salt rounds 12
- **Validation**: zxcvbn for password strength
- **History**: Prevent reuse of last 5 passwords
- **Expiration**: Optional password expiration (Enterprise)

### Account Security
- **Two-Factor Authentication** (2FA) support
- **Device tracking** and suspicious login detection
- **Account recovery** with multiple verification methods
- **Security notifications** for important account changes

### Compliance
- **GDPR**: Right to deletion, data portability
- **SOC 2**: Security controls and audit trails
- **CCPA**: California privacy compliance
- **HIPAA**: Healthcare data protection (Enterprise)

## Monitoring & Logging

### Authentication Events
- Login attempts (success/failure)
- Password changes
- Role modifications
- API key usage
- Suspicious activities

### Metrics
- Authentication success rates
- Session duration analytics
- Failed login patterns
- API usage by organization

### Alerting
- Multiple failed login attempts
- Unusual access patterns
- Privilege escalation attempts
- API rate limit violations

## Future Enhancements

### Phase 2 Features
- **Passwordless authentication** (Magic links, WebAuthn)
- **Advanced MFA** (Hardware tokens, biometrics)
- **Risk-based authentication**
- **Identity federation**

### Phase 3 Features
- **Zero-trust architecture**
- **Advanced threat detection**
- **Behavioral analytics**
- **Automated incident response**

## Testing Strategy

### Unit Tests
- Authentication flows
- Permission checks
- Token validation
- Rate limiting

### Integration Tests
- End-to-end authentication
- Multi-tenant isolation
- API security
- Social login flows

### Security Tests
- Penetration testing
- Vulnerability scanning
- Session security
- OWASP compliance

This authentication system provides enterprise-grade security while maintaining developer-friendly implementation and user experience.