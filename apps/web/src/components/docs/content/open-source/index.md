---
title: Open Source
description: Featul is open source software. View the code, contribute, or self-host.
---

## Open source commitment

Featul is open source under the MIT License. You can read the code, contribute, or run your own instance.

## Why open source?

- **Transparency** – Full visibility into how feedback and auth work
- **Trust** – No hidden product behavior
- **Community** – Improvements can be shared
- **Freedom** – Self-host and adapt the software
- **Longevity** – The code stays available even if the hosted service changes

## Source code

[View on GitHub](https://github.com/usefeatul/featul)

## Tech stack

- **Apps** – Next.js and React (product app and marketing/docs site)
- **API** – Type-safe RPC on Hono (jstack)
- **Database** – PostgreSQL with Drizzle ORM
- **Authentication** – Better Auth (email, Google, GitHub, passkeys, 2FA)
- **Monorepo** – Turborepo with shared packages
- **Editor** – Tiptap rich text editor
- **Runtime** – Bun

## License

MIT License permits:

- Commercial and personal use
- Modification and distribution
- Private and public deployment

## Self-hosting

### Requirements

- Node.js 20+ and Bun 1.2+
- PostgreSQL database
- Environment configuration for the app and web sites

### Quick start

1. Clone [usefeatul/featul](https://github.com/usefeatul/featul)
2. Install dependencies: `bun install`
3. Copy env examples: `cp apps/app/.env.example apps/app/.env.local` and `cp apps/web/.env.example apps/web/.env.local`
4. Configure environment variables
5. Run database migrations
6. Start development: `bun dev`

See the repository README for the full setup.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request

By contributing, you agree to license your work under the MIT License.
