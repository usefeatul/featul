---
title: Identify users
description: Link feedback to user accounts for better context and follow-up.
---

## User Identification

Connect feedback to specific user accounts for enhanced relationship management and data analysis. Identified feedback enables follow-up, segmentation, and personalized responses.

## Widget identification

Call `featul.identify` with an HMAC-signed user from your backend:

```js
featul.identify({
  id: "user_12345",
  email: "customer@example.com",
  name: "Jane Doe",
  avatar: "https://example.com/jane.jpg",
  expiresAt: 1770000300,
  signature: "SERVER_GENERATED_HMAC",
});
```

The signature covers the workspace, ID, normalized email, name, avatar, and expiration. It is
encoded as hexadecimal and expires after five minutes. Never generate it in browser code or expose
the Widget secret.

Call `featul.identify(null)` when the user logs out. Missing or invalid signatures are treated as anonymous guests.

See [Embed the widget](/docs/getting-started/widget) for the complete server and browser setup.

## Benefits of Identification

### Enhanced Follow-up

- Notify users when requested features ship
- Contact for clarification or user research
- Close loops on resolved requests

### Advanced Segmentation

- Filter feedback by customer tier
- Analyze patterns by user segment
- Identify power user requests

### Relationship Management

- Track customer feedback history
- Identify most engaged users
- Personalize responses based on account context

## Privacy Considerations

When identifying users:

- Follow applicable privacy regulations (GDPR, CCPA)
- Comply with your privacy policy terms
- Collect only necessary user data
- Use identity masking for public board privacy

See [Mask identities](/docs/getting-started/mask-identities) to hide user information publicly while preserving internal access.
