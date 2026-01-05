---
title: Custom Domain
description: Connect your own domain to create a branded feedback portal URL.
---

# Custom Domain

Use your own domain to host your feedback portal instead of the default `yourworkspace.featul.com` URL.

## Adding a Custom Domain

1. Navigate to **Settings → Domain** in your workspace
2. Click **Add domain**
3. Enter your custom domain (e.g., `feedback.yourcompany.com`)
4. Save the domain

## DNS Configuration

After adding your domain, you'll need to configure DNS records with your domain provider.

### Required Records

Add the following DNS records to your domain:

| Type  | Name              | Value                  |
|-------|-------------------|------------------------|
| CNAME | feedback (or @)   | cname.featul.com       |

### Verification

Once DNS records are configured:

1. Return to **Settings → Domain**
2. Click **Verify** to check your DNS configuration
3. Verification may take up to 48 hours for DNS propagation

## Removing a Domain

To remove a custom domain and revert to the default URL:

1. Go to **Settings → Domain**
2. Click the delete option next to your domain
3. Confirm the removal

Your workspace will return to using `yourworkspace.featul.com`.

---

> **Note:** Custom domains are available on Starter and Professional plans.

