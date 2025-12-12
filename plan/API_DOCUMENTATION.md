# oreilla API Documentation

## Overview

The oreilla API is a RESTful API that allows you to integrate feedback management into your applications. It provides endpoints for managing feedback, users, organizations, and more.

**Base URL**: `https://api.oreilla.com/v1`

**API Version**: v1

## Authentication

### API Key Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key

1. Log in to your oreilla dashboard
2. Navigate to Settings → API Keys
3. Click "Generate New API Key"
4. Copy and securely store your API key

### Rate Limiting

| Plan | Rate Limit |
|------|------------|
| Free | 1,000 requests/month |
| Pro | 10,000 requests/month |
| Enterprise | Unlimited |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Endpoints

### Authentication

#### Verify API Key

```http
GET /auth/verify
```

Verify that your API key is valid and get organization information.

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_123",
      "name": "Acme Corp",
      "plan": "pro"
    },
    "permissions": ["feedback:read", "feedback:write"]
  }
}
```

### Organizations

#### Get Organization

```http
GET /organizations/{organization_id}
```

Get details about your organization.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org_123",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "pro",
    "settings": {
      "allow_anonymous_feedback": true,
      "require_approval": false
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Organization

```http
PATCH /organizations/{organization_id}
```

**Request Body:**
```json
{
  "name": "New Company Name",
  "settings": {
    "allow_anonymous_feedback": false
  }
}
```

### Feedback

#### List Feedback

```http
GET /feedback
```

Retrieve a list of feedback items.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (`open`, `in_progress`, `completed`, `rejected`)
- `category_id` (string): Filter by category ID
- `author_id` (string): Filter by author ID
- `sort` (string): Sort field (`created_at`, `updated_at`, `vote_count`, `title`)
- `order` (string): Sort order (`asc`, `desc`)
- `search` (string): Search in title and description

**Example Request:**
```http
GET /feedback?status=open&sort=vote_count&order=desc&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "fb_123",
      "title": "Add dark mode support",
      "description": "It would be great to have a dark mode option...",
      "status": "open",
      "priority": "medium",
      "vote_count": 15,
      "comment_count": 3,
      "category": {
        "id": "cat_123",
        "name": "Feature Request",
        "color": "#3b82f6"
      },
      "author": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "tags": ["ui", "accessibility"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### Get Feedback

```http
GET /feedback/{feedback_id}
```

Retrieve a specific feedback item.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "fb_123",
    "title": "Add dark mode support",
    "description": "It would be great to have a dark mode option for users who prefer darker interfaces. This would help reduce eye strain during nighttime usage.",
    "status": "open",
    "priority": "medium",
    "vote_count": 15,
    "comment_count": 3,
    "view_count": 45,
    "category": {
      "id": "cat_123",
      "name": "Feature Request",
      "color": "#3b82f6"
    },
    "author": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "assignee": {
      "id": "user_456",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "tags": ["ui", "accessibility"],
    "attachments": [
      {
        "id": "att_123",
        "filename": "mockup.png",
        "file_size": 1024000,
        "file_url": "https://cdn.oreilla.com/files/mockup.png"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Feedback

```http
POST /feedback
```

**Request Body:**
```json
{
  "title": "Add dark mode support",
  "description": "It would be great to have a dark mode option...",
  "category_id": "cat_123",
  "priority": "medium",
  "tags": ["ui", "accessibility"],
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "fb_124",
    "title": "Add dark mode support",
    "status": "open",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Feedback

```http
PATCH /feedback/{feedback_id}
```

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "assignee_id": "user_456",
  "tags": ["ui", "accessibility", "priority"]
}
```

#### Delete Feedback

```http
DELETE /feedback/{feedback_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

### Votes

#### Vote on Feedback

```http
POST /feedback/{feedback_id}/vote
```

**Request Body:**
```json
{
  "type": "up", // "up" or "down"
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vote_id": "vote_123",
    "type": "up",
    "feedback_vote_count": 16
  }
}
```

#### Remove Vote

```http
DELETE /feedback/{feedback_id}/vote
```

**Query Parameters:**
- `user_email` (string): Email of the user whose vote to remove

### Comments

#### List Comments

```http
GET /feedback/{feedback_id}/comments
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)
- `sort` (string): Sort field (`created_at`)
- `order` (string): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment_123",
      "content": "This is a great idea! I would definitely use this feature.",
      "author": {
        "id": "user_789",
        "name": "Alice Johnson",
        "email": "alice@example.com"
      },
      "parent_id": null,
      "replies": [
        {
          "id": "comment_124",
          "content": "I agree! This would be very helpful.",
          "author": {
            "id": "user_456",
            "name": "Bob Wilson",
            "email": "bob@example.com"
          },
          "parent_id": "comment_123",
          "created_at": "2024-01-01T01:00:00Z"
        }
      ],
      "created_at": "2024-01-01T00:30:00Z",
      "updated_at": "2024-01-01T00:30:00Z"
    }
  ]
}
```

#### Create Comment

```http
POST /feedback/{feedback_id}/comments
```

**Request Body:**
```json
{
  "content": "This is a great suggestion!",
  "parent_id": "comment_123", // Optional, for replies
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Update Comment

```http
PATCH /comments/{comment_id}
```

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### Delete Comment

```http
DELETE /comments/{comment_id}
```

### Categories

#### List Categories

```http
GET /categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Feature Request",
      "description": "New feature suggestions",
      "color": "#3b82f6",
      "icon": "lightbulb",
      "feedback_count": 25,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Category

```http
POST /categories
```

**Request Body:**
```json
{
  "name": "Bug Report",
  "description": "Report bugs and issues",
  "color": "#ef4444",
  "icon": "bug"
}
```

#### Update Category

```http
PATCH /categories/{category_id}
```

#### Delete Category

```http
DELETE /categories/{category_id}
```

### Users

#### List Users

```http
GET /users
```

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `role` (string): Filter by role (`admin`, `moderator`, `user`)
- `search` (string): Search by name or email

#### Get User

```http
GET /users/{user_id}
```

#### Create User

```http
POST /users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

#### Update User

```http
PATCH /users/{user_id}
```

### Analytics

#### Get Feedback Analytics

```http
GET /analytics/feedback
```

**Query Parameters:**
- `period` (string): Time period (`7d`, `30d`, `90d`, `1y`)
- `category_id` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "total_feedback": 150,
    "feedback_by_status": {
      "open": 75,
      "in_progress": 30,
      "completed": 40,
      "rejected": 5
    },
    "feedback_by_category": [
      {
        "category_id": "cat_123",
        "category_name": "Feature Request",
        "count": 80
      }
    ],
    "feedback_over_time": [
      {
        "date": "2024-01-01",
        "count": 5
      }
    ],
    "top_voted_feedback": [
      {
        "id": "fb_123",
        "title": "Add dark mode",
        "vote_count": 25
      }
    ]
  }
}
```

### Webhooks

#### List Webhooks

```http
GET /webhooks
```

#### Create Webhook

```http
POST /webhooks
```

**Request Body:**
```json
{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/services/...",
  "events": ["feedback.created", "feedback.updated"],
  "secret": "webhook_secret_key"
}
```

**Webhook Events:**
- `feedback.created`
- `feedback.updated`
- `feedback.deleted`
- `comment.created`
- `vote.created`
- `user.created`

#### Test Webhook

```http
POST /webhooks/{webhook_id}/test
```

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @oreilla/js-sdk
```

```javascript
import { oreilla } from '@oreilla/js-sdk';

const oreilla = new oreilla({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.oreilla.com/v1'
});

// Create feedback
const feedback = await oreilla.feedback.create({
  title: 'New feature request',
  description: 'Description here',
  author: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// List feedback
const feedbackList = await oreilla.feedback.list({
  status: 'open',
  limit: 10
});
```

### Python

```bash
pip install oreilla-python
```

```python
from oreilla import oreilla

client = oreilla(api_key='your_api_key')

# Create feedback
feedback = client.feedback.create(
    title='New feature request',
    description='Description here',
    author={
        'name': 'John Doe',
        'email': 'john@example.com'
    }
)

# List feedback
feedback_list = client.feedback.list(
    status='open',
    limit=10
)
```

### PHP

```bash
composer require oreilla/php-sdk
```

```php
use oreilla\Client;

$client = new Client('your_api_key');

// Create feedback
$feedback = $client->feedback()->create([
    'title' => 'New feature request',
    'description' => 'Description here',
    'author' => [
        'name' => 'John Doe',
        'email' => 'john@example.com'
    ]
]);
```

## Embeddable Widget

### Basic Implementation

```html
<!-- Add to your HTML head -->
<script src="https://widget.oreilla.com/widget.js"></script>

<!-- Initialize the widget -->
<script>
  oreilla.init({
    organizationId: 'your_org_id',
    apiKey: 'your_public_api_key',
    position: 'bottom-right', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
    theme: 'light', // 'light', 'dark', 'auto'
    primaryColor: '#3b82f6'
  });
</script>
```

### Advanced Configuration

```javascript
oreilla.init({
  organizationId: 'your_org_id',
  apiKey: 'your_public_api_key',
  
  // Appearance
  theme: 'auto',
  primaryColor: '#3b82f6',
  position: 'bottom-right',
  
  // Behavior
  showOnLoad: true,
  allowAnonymous: true,
  requireEmail: true,
  
  // Categories
  defaultCategory: 'feature-request',
  categories: ['bug', 'feature-request', 'improvement'],
  
  // User identification
  user: {
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  
  // Callbacks
  onFeedbackSubmit: (feedback) => {
    console.log('Feedback submitted:', feedback);
  },
  
  onWidgetOpen: () => {
    console.log('Widget opened');
  }
});
```

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_API_KEY` | API key is invalid or expired | Check your API key |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry, or upgrade plan |
| `VALIDATION_ERROR` | Request data is invalid | Check request format |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist | Verify resource ID |
| `INSUFFICIENT_PERMISSIONS` | API key lacks required permissions | Check API key permissions |
| `ORGANIZATION_LIMIT_EXCEEDED` | Usage limit exceeded | Upgrade your plan |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "description": "Description must be at least 10 characters"
    }
  }
}
```

## Best Practices

### API Usage
1. **Cache responses** when possible to reduce API calls
2. **Use pagination** for large datasets
3. **Handle rate limits** gracefully with exponential backoff
4. **Validate data** before sending requests
5. **Use webhooks** for real-time updates instead of polling

### Security
1. **Keep API keys secure** - never expose them in client-side code
2. **Use HTTPS** for all API requests
3. **Validate webhook signatures** to ensure authenticity
4. **Rotate API keys** regularly
5. **Use least privilege** - only grant necessary permissions

### Performance
1. **Use appropriate page sizes** (20-50 items per page)
2. **Filter and sort** on the server side
3. **Use ETags** for caching when available
4. **Batch operations** when possible
5. **Monitor API usage** to optimize performance

This API documentation provides comprehensive coverage of all oreilla API endpoints and features, enabling developers to integrate feedback management seamlessly into their applications.