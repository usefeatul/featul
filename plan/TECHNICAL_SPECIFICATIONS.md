# oreilla Technical Specifications

## Project Overview

oreilla is an open-source user feedback platform designed to be the "Linear of feedback management" - beautiful, fast, and developer-loved. It aims to disrupt the market dominated by expensive closed-source solutions like FeatureBase ($60-250/month) and UserJot ($29-59/month).

## Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js 15)  │◄──►│   (API Routes)  │◄──►│   (Neon)        │
│   - Landing Web │    │   - Auth        │    │   - PostgreSQL  │
│   - Main Feed   │    │   - API         │    │   - Drizzle ORM │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Storage   │    │   Email/Notif   │    │   Analytics     │
│   (Cloudflare)  │    │   (Resend)      │    │   (PostHog)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **State Management**: Zustand + React Query
- **Authentication**: Better-Auth
- **Real-time**: WebSockets/Server-Sent Events

#### Backend Stack
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth with multiple providers
- **File Storage**: Cloudflare R2
- **Email**: Resend
- **Analytics**: PostHog (optional)

#### Infrastructure
- **Hosting**: Vercel (primary)
- **Database**: Neon
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (optional)

## Core Features

### 1. Feedback Management
- **Feedback Collection**: Public/private feedback boards
- **Categorization**: Tags, labels, and custom fields
- **Status Tracking**: Open, In Progress, Completed, Rejected
- **Voting System**: Upvotes/downvotes with user tracking
- **Comments**: Threaded discussions on feedback items

### 2. User Management
- **Authentication**: Email/password, OAuth (Google, GitHub, etc.)
- **User Roles**: Admin, Moderator, User, Guest
- **Organizations**: Multi-tenant support
- **User Profiles**: Avatars, bio, activity history

### 3. Integration & Embeds
- **Widget SDK**: Embeddable feedback widget
- **API**: RESTful API for third-party integrations
- **Webhooks**: Real-time notifications
- **Import/Export**: Data portability

### 4. Analytics & Reporting
- **Dashboard**: Feedback metrics and trends
- **Custom Reports**: Filterable analytics
- **Export Options**: CSV, JSON, PDF
- **Real-time Updates**: Live feedback tracking

## Database Schema Overview

### Core Tables

#### Users
```sql
users {
  id: uuid (primary key)
  email: varchar (unique)
  name: varchar
  avatar_url: varchar
  role: enum (admin, moderator, user)
  organization_id: uuid (foreign key)
  created_at: timestamp
  updated_at: timestamp
}
```

#### Organizations
```sql
organizations {
  id: uuid (primary key)
  name: varchar
  slug: varchar (unique)
  logo_url: varchar
  plan: enum (free, pro, enterprise)
  settings: jsonb
  created_at: timestamp
  updated_at: timestamp
}
```

#### Feedback
```sql
feedback {
  id: uuid (primary key)
  title: varchar
  description: text
  status: enum (open, in_progress, completed, rejected)
  priority: enum (low, medium, high, critical)
  category_id: uuid (foreign key)
  author_id: uuid (foreign key)
  organization_id: uuid (foreign key)
  vote_count: integer
  comment_count: integer
  created_at: timestamp
  updated_at: timestamp
}
```

#### Categories
```sql
categories {
  id: uuid (primary key)
  name: varchar
  color: varchar
  organization_id: uuid (foreign key)
  created_at: timestamp
}
```

#### Votes
```sql
votes {
  id: uuid (primary key)
  feedback_id: uuid (foreign key)
  user_id: uuid (foreign key)
  type: enum (up, down)
  created_at: timestamp
}
```

#### Comments
```sql
comments {
  id: uuid (primary key)
  content: text
  feedback_id: uuid (foreign key)
  author_id: uuid (foreign key)
  parent_id: uuid (foreign key, nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

## API Design

### RESTful Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Feedback
- `GET /api/feedback` - List feedback (with filters)
- `POST /api/feedback` - Create feedback
- `GET /api/feedback/:id` - Get feedback details
- `PATCH /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

#### Votes
- `POST /api/feedback/:id/vote` - Vote on feedback
- `DELETE /api/feedback/:id/vote` - Remove vote

#### Comments
- `GET /api/feedback/:id/comments` - Get comments
- `POST /api/feedback/:id/comments` - Add comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

#### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization
- `PATCH /api/organizations/:id` - Update organization

## Security Considerations

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Organization-level permissions
- Rate limiting on API endpoints

### Data Protection
- Input validation and sanitization
- SQL injection prevention (Drizzle ORM)
- XSS protection
- CSRF protection
- Secure headers (HSTS, CSP, etc.)

### Privacy
- GDPR compliance
- Data anonymization options
- User data export/deletion
- Cookie consent management

## Performance Optimization

### Frontend
- Code splitting and lazy loading
- Image optimization (Next.js Image)
- Caching strategies (React Query)
- Bundle size optimization

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching (Redis for sessions)

### Infrastructure
- CDN for static assets
- Edge functions for global performance
- Database read replicas
- Monitoring and alerting

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Database sharding strategies
- Load balancing
- Microservices architecture (future)

### Vertical Scaling
- Resource monitoring
- Auto-scaling policies
- Performance bottleneck identification
- Capacity planning

## Development Workflow

### Code Organization
```
oreilla/
├── apps/
│   ├── web/          # Landing web application
│   └── feed/         # Main application
├── packages/
│   ├── ui/           # Shared UI components
│   ├── tsconfig/     # TypeScript configurations
│   └── database/     # Database schemas and migrations
├── docs/             # Documentation
└── tools/            # Development tools
```

### Development Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Husky pre-commit hooks
- Conventional commits
- Automated testing (Jest, Playwright)

### CI/CD Pipeline
- GitHub Actions workflows
- Automated testing on PR
- Preview deployments
- Production deployment automation
- Database migration handling

## Monitoring & Observability

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics (PostHog)
- Custom metrics and dashboards

### Infrastructure Monitoring
- Database performance (Neon metrics)
- API response times
- Resource utilization
- Uptime monitoring

## Compliance & Standards

### Web Standards
- WCAG 2.1 AA accessibility
- Progressive Web App (PWA)
- SEO optimization
- Core Web Vitals optimization

### Data Standards
- OpenAPI 3.0 specification
- JSON:API compliance
- ISO 8601 date formats
- UTF-8 encoding

## Future Considerations

### Planned Features
- Mobile applications (React Native)
- Advanced analytics and reporting
- AI-powered feedback categorization
- Integration marketplace
- White-label solutions

### Technical Debt Management
- Regular dependency updates
- Code refactoring cycles
- Performance audits
- Security assessments

This technical specification serves as the foundation for the oreilla platform development and will be updated as the project evolves.