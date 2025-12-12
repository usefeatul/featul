# oreilla Database Schema

## Overview

This document defines the complete database schema for oreilla, a user feedback management platform. The schema is designed for PostgreSQL and uses Drizzle ORM for type-safe database operations.

## Schema Design Principles

- **Multi-tenancy**: Organization-based isolation
- **Scalability**: Optimized for high-volume feedback collection
- **Flexibility**: Extensible schema for future features
- **Performance**: Proper indexing and relationships
- **Data Integrity**: Foreign key constraints and validation

## Core Tables

### 1. Organizations

The root entity for multi-tenant architecture.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);
```

### 2. Users

User accounts with role-based access control.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 3. User Sessions

Manage user authentication sessions.

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### 4. Categories

Organize feedback into categories.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1', -- Hex color code
  icon VARCHAR(50), -- Icon name/identifier
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_categories_organization_id ON categories(organization_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
```

### 5. Feedback

Core feedback items submitted by users.

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'rejected', 'duplicate')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_organization_id ON feedback(organization_id);
CREATE INDEX idx_feedback_author_id ON feedback(author_id);
CREATE INDEX idx_feedback_category_id ON feedback(category_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_priority ON feedback(priority);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_vote_count ON feedback(vote_count DESC);
CREATE INDEX idx_feedback_tags ON feedback USING GIN(tags);
CREATE INDEX idx_feedback_is_public ON feedback(is_public);
CREATE INDEX idx_feedback_assignee_id ON feedback(assignee_id);
```

### 6. Votes

User votes on feedback items.

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('up', 'down')),
  ip_address INET, -- For anonymous voting
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feedback_id, user_id),
  UNIQUE(feedback_id, ip_address) -- Prevent duplicate anonymous votes
);

CREATE INDEX idx_votes_feedback_id ON votes(feedback_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_type ON votes(type);
CREATE INDEX idx_votes_created_at ON votes(created_at);
```

### 7. Comments

Threaded comments on feedback items.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_internal BOOLEAN DEFAULT false, -- Internal team comments
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_feedback_id ON comments(feedback_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_internal ON comments(is_internal);
```

### 8. Attachments

File attachments for feedback and comments.

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK ((feedback_id IS NOT NULL AND comment_id IS NULL) OR (feedback_id IS NULL AND comment_id IS NOT NULL))
);

CREATE INDEX idx_attachments_feedback_id ON attachments(feedback_id);
CREATE INDEX idx_attachments_comment_id ON attachments(comment_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
```

## Subscription & Billing Tables

### 9. Subscriptions

Manage organization subscriptions.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
```

### 10. Usage Metrics

Track usage for billing and analytics.

```sql
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'feedback_count', 'user_count', 'api_calls', etc.
  metric_value INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, metric_type, period_start)
);

CREATE INDEX idx_usage_metrics_organization_id ON usage_metrics(organization_id);
CREATE INDEX idx_usage_metrics_type ON usage_metrics(metric_type);
CREATE INDEX idx_usage_metrics_period ON usage_metrics(period_start, period_end);
```

## Integration Tables

### 11. Webhooks

Webhook configurations for external integrations.

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}', -- Array of event types
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhooks_organization_id ON webhooks(organization_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
```

### 12. Webhook Deliveries

Track webhook delivery attempts.

```sql
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
```

### 13. API Keys

Manage API access keys.

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL, -- Hashed API key
  key_prefix VARCHAR(10) NOT NULL, -- First few characters for identification
  permissions TEXT[] DEFAULT '{}', -- Array of permissions
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
```

## Analytics Tables

### 14. Activity Logs

Track user and system activities.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'feedback.created', 'user.login', etc.
  resource_type VARCHAR(50), -- 'feedback', 'user', 'comment', etc.
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## Triggers and Functions

### Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Update Vote Counts

```sql
CREATE OR REPLACE FUNCTION update_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback 
    SET vote_count = vote_count + CASE WHEN NEW.type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback 
    SET vote_count = vote_count - CASE WHEN OLD.type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.feedback_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE feedback 
    SET vote_count = vote_count + 
      CASE WHEN NEW.type = 'up' THEN 1 ELSE -1 END -
      CASE WHEN OLD.type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.feedback_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_feedback_vote_count();
```

### Update Comment Counts

```sql
CREATE OR REPLACE FUNCTION update_feedback_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback 
    SET comment_count = comment_count + 1
    WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback 
    SET comment_count = comment_count - 1
    WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_feedback_comment_count();
```

## Data Relationships Summary

```
organizations (1) ──── (n) users
organizations (1) ──── (n) categories
organizations (1) ──── (n) feedback
organizations (1) ──── (1) subscriptions
organizations (1) ──── (n) webhooks
organizations (1) ──── (n) api_keys
organizations (1) ──── (n) activity_logs

users (1) ──── (n) feedback (as author)
users (1) ──── (n) feedback (as assignee)
users (1) ──── (n) comments
users (1) ──── (n) votes
users (1) ──── (n) user_sessions

feedback (1) ──── (n) comments
feedback (1) ──── (n) votes
feedback (1) ──── (n) attachments
feedback (n) ──── (1) categories

comments (1) ──── (n) comments (self-referencing)
comments (1) ──── (n) attachments

webhooks (1) ──── (n) webhook_deliveries
```

## Performance Considerations

### Indexing Strategy
- Primary keys (UUID) are automatically indexed
- Foreign keys are indexed for join performance
- Frequently queried columns (status, created_at, etc.) are indexed
- Composite indexes for common query patterns
- GIN indexes for array and JSONB columns

### Partitioning (Future)
- Consider partitioning large tables by organization_id
- Time-based partitioning for activity_logs and webhook_deliveries
- Archive old data to separate tables/databases

### Query Optimization
- Use appropriate LIMIT and OFFSET for pagination
- Implement cursor-based pagination for large datasets
- Use materialized views for complex analytics queries
- Regular VACUUM and ANALYZE operations

This schema provides a solid foundation for the oreilla platform while maintaining flexibility for future enhancements and scalability requirements.