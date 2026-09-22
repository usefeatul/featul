---
title: Custom domains
description: Set up a workspace subdomain and an optional custom domain for your feedback portal.
---

## Default subdomain

Every workspace receives a free subdomain:

```
yourworkspace.featul.com
```

It is ready to use as soon as the workspace exists.

## Custom domain

Connect your own domain from **Settings → Domain**. Custom domains are available on Starter and Professional.

1. Go to **Settings → Domain**
2. Click **Add domain** and enter a host such as `feedback.yourdomain.com`
3. Add the DNS records Featul shows:

| Type | Name | Value |
|------|------|-------|
| CNAME | `feedback` (or the host you chose) | `origin.featul.com` |
| TXT | The `_acme-challenge` name shown in settings | The verification value shown in settings |

Copy the exact Name and Value from the Domain page. Featul verifies both records.

4. Click verify after DNS has propagated (a few minutes, sometimes longer)
5. Your portal is then available at the custom domain over HTTPS

## Routing

Both URLs serve the same public site:

- Workspace subdomain: `yourworkspace.featul.com`
- Custom domain: `feedback.yourdomain.com`

## Troubleshooting

**Verification still pending:**
- Confirm the CNAME target is `origin.featul.com` (not your Featul subdomain)
- Confirm the TXT record matches the value in settings
- Allow time for DNS to propagate
- Check for conflicting records on the same host

Remove the domain and add it again if you need a fresh verification challenge.
