# oreilla Web Platform

A modern business tools platform built with Next.js, featuring calculators, blog integration, and comprehensive business resources.

## 🚀 Quick Start

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

## 📁 Structure

- `src/app/(site)/` - Main pages (blog, tools, legal, pricing)
- `src/components/tools/` - Business calculators (customer, finance, performance, pricing, product, revenue)
- `src/content/legal/` - Legal documents (privacy, terms, GDPR)
- `public/` - Static assets and logos

## ✨ Features

**Business Tools**: 30+ calculators for metrics, finance, pricing, and analytics
**Blog**: Marble CMS integration with dynamic routing
**Alternatives**: Tool comparison directory
**Definitions**: Business glossary with SEO optimization
**Legal**: Comprehensive privacy, terms, and GDPR compliance

## 🛠️ Tech Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS with typography plugin
- Marble CMS for blog content
- SEO optimized with structured data

## 🔧 Setup

1. **Environment**: Copy `.env.example` → `.env.local`
2. **Blog Setup**: Add `MARBLE_WORKSPACE_KEY` to enable blog
3. **Development**: `npm run dev` → `localhost:3000`

## 📱 Pages

- `/` - Landing page with tools showcase
- `/blog` - Blog posts from Marble CMS
- `/tools/*` - Business calculators by category
- `/alternatives/*` - Tool comparisons
- `/definitions/*` - Business glossary
- `/pricing` - Pricing information
- `/privacy`, `/terms`, `/gdpr` - Legal pages

---

**oreilla** - Built for modern business teams 🚀