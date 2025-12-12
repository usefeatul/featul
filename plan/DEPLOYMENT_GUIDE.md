# Deployment & Infrastructure Guide

## Overview

This guide covers the complete deployment and infrastructure setup for oreilla, including development, staging, and production environments across multiple hosting providers.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │  Cloudflare CDN │    │   Neon Database │
│   (Frontend)    │────│  (File Storage) │────│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  Vercel Edge    │──────────────┘
                        │   Functions     │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   External      │
                        │   Services      │
                        │ (Resend, etc.)  │
                        └─────────────────┘
```

## Environment Setup

### Development Environment

#### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm 8+
- Git
- Docker (optional, for local database)

#### Local Setup
```bash
# Clone repository
git clone https://github.com/your-org/oreilla.git
cd oreilla

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/feed/.env.example apps/feed/.env.local

# Setup database
pnpm db:push
pnpm db:seed

# Start development servers
pnpm dev
```

#### Environment Variables
```bash
# .env.local (root)
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oreilla_dev
DIRECT_URL=postgresql://user:password@localhost:5432/oreilla_dev

# Authentication Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# External Services
RESEND_API_KEY=your-resend-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token

# Analytics (Optional)
POSTHOG_KEY=your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Optional)
SENTRY_DSN=your-sentry-dsn
```

### Staging Environment

#### Vercel Staging Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to staging
vercel --target staging
```

#### Staging Environment Variables
```bash
# Set via Vercel CLI or Dashboard
vercel env add NODE_ENV staging
vercel env add DATABASE_URL staging
vercel env add NEXTAUTH_SECRET staging
# ... add all required variables
```

### Production Environment

#### Production Checklist
- [ ] Domain configured with SSL
- [ ] Database optimized and backed up
- [ ] Environment variables secured
- [ ] Monitoring and alerting setup
- [ ] CDN configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active

## Database Setup

### Neon Database Configuration

#### Create Database
1. Sign up at [Neon](https://neon.tech)
2. Create new project
3. Copy connection strings
4. Configure environment variables

#### Database Migration
```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate

# Seed database (development only)
pnpm db:seed
```

#### Connection Pooling
```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// For serverless functions
const pooledSql = neon(process.env.DATABASE_URL!, {
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});
```

### Database Backup Strategy

#### Automated Backups
- **Neon**: Automatic daily backups (7-day retention)
- **Custom**: Weekly full backups to S3
- **Point-in-time recovery**: Available for 7 days

#### Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="oreilla_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://oreilla-backups/
rm $BACKUP_FILE
```

## Vercel Deployment

### Project Configuration

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/feed/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/feed/(.*)",
      "dest": "/apps/feed/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/apps/web/$1"
    }
  ],
  "functions": {
    "apps/web/app/api/**/*.ts": {
      "maxDuration": 30
    },
    "apps/feed/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/analytics",
      "schedule": "0 1 * * *"
    }
  ]
}
```

#### Build Configuration
```bash
# Build command
pnpm build

# Output directory
.next

# Install command
pnpm install

# Development command
pnpm dev
```

### Environment Variables (Production)
```bash
# Core
NODE_ENV=production
NEXTAUTH_SECRET=<strong-secret-key>
NEXTAUTH_URL=https://oreilla.com

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication
GOOGLE_CLIENT_ID=<production-google-id>
GOOGLE_CLIENT_SECRET=<production-google-secret>
GITHUB_CLIENT_ID=<production-github-id>
GITHUB_CLIENT_SECRET=<production-github-secret>

# Services
RESEND_API_KEY=<production-resend-key>
CLOUDFLARE_ACCOUNT_ID=<cloudflare-account>
CLOUDFLARE_API_TOKEN=<cloudflare-token>

# Monitoring
POSTHOG_KEY=<production-posthog-key>
SENTRY_DSN=<production-sentry-dsn>
VERCEL_ANALYTICS_ID=<vercel-analytics-id>
```

## File Storage (Cloudflare R2)

### Setup Configuration
```typescript
// lib/storage.ts
import { S3Client } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export { r2 };
```

### Bucket Configuration
- **Public bucket**: `oreilla-public` (avatars, logos)
- **Private bucket**: `oreilla-private` (attachments, exports)
- **CDN**: Cloudflare CDN for public assets
- **Lifecycle**: Auto-delete temporary files after 7 days

## Email Service (Resend)

### Configuration
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'oreilla <noreply@oreilla.com>'
}) => {
  return await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
};
```

### Email Templates
- Welcome email
- Password reset
- Email verification
- Feedback notifications
- Weekly digest

## Monitoring & Analytics

### Vercel Analytics
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### PostHog Integration
```typescript
// lib/analytics.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(
  process.env.POSTHOG_KEY!,
  { host: process.env.POSTHOG_HOST }
);

export const trackEvent = (userId: string, event: string, properties?: any) => {
  posthog.capture({
    distinctId: userId,
    event,
    properties,
  });
};
```

### Error Tracking (Sentry)
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

## Performance Optimization

### Caching Strategy
```typescript
// Next.js caching
export const revalidate = 3600; // 1 hour

// API route caching
export async function GET() {
  const data = await fetchData();
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

### Image Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['oreilla.com', 'r2.cloudflarestorage.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
};
```

## Security Configuration

### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-analytics.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: *.r2.cloudflarestorage.com;
      font-src 'self';
      connect-src 'self' *.neon.tech *.posthog.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Rate Limiting
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Disaster Recovery

### Backup Strategy
1. **Database**: Daily automated backups via Neon
2. **Files**: Replicated across Cloudflare regions
3. **Code**: Git repository with multiple remotes
4. **Configuration**: Infrastructure as Code

### Recovery Procedures
1. **Database Recovery**: Point-in-time restore from Neon
2. **Application Recovery**: Redeploy from Git
3. **File Recovery**: Restore from Cloudflare R2
4. **DNS Recovery**: Cloudflare DNS management

### RTO/RPO Targets
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour
- **Availability Target**: 99.9% uptime

## Scaling Considerations

### Horizontal Scaling
- **Vercel**: Auto-scaling serverless functions
- **Database**: Neon auto-scaling and read replicas
- **CDN**: Global edge distribution
- **Caching**: Redis for session and data caching

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **API Performance**: Response time monitoring
- **Database Performance**: Query optimization
- **Error Rates**: Real-time error tracking

## Cost Optimization

### Resource Management
- **Vercel**: Function execution optimization
- **Database**: Connection pooling and query optimization
- **Storage**: Lifecycle policies for old files
- **CDN**: Efficient caching strategies

### Budget Alerts
- Vercel usage monitoring
- Database connection limits
- Storage usage tracking
- Third-party service costs

This deployment guide ensures a robust, scalable, and maintainable infrastructure for oreilla across all environments.