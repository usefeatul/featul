# Feedgot Web Application

This is the main web application codebase for **Feedgot** - a modern landing page and web platform built with Next.js and React.

## 🚀 Project Overview

Feedgot is a comprehensive web platform that serves as both a marketing landing page and a functional web application. The codebase is designed with modern web development practices, featuring a clean architecture, responsive design, and integrated content management capabilities.

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (site)/            # Main site pages and content
│   │   │   ├── (legal)/       # Legal pages (privacy, terms, GDPR)
│   │   │   ├── alternatives/  # Alternative tools and comparisons
│   │   │   ├── blog/          # Blog posts (Marble CMS integration)
│   │   │   ├── definitions/   # Definition pages and glossary
│   │   │   ├── pricing/       # Pricing and plans page
│   │   │   └── tools/         # Business tools and calculators
│   │   ├── fonts.ts           # Font configuration
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── not-found.tsx      # 404 error page
│   │   ├── robots.ts          # SEO robots configuration
│   │   └── sitemap.ts         # SEO sitemap configuration
│   ├── components/            # Reusable React components
│   │   ├── alternatives/      # Alternative tools components
│   │   ├── blog/              # Blog-related components
│   │   ├── definitions/       # Definition page components
│   │   ├── global/          # Global/shared components
│   │   ├── home/            # Homepage components
│   │   ├── legal/             # Legal page components
│   │   ├── seo/               # SEO and structured data components
│   │   └── tools/               # Business tools and calculators
│   │       ├── customer/        # Customer metrics tools
│   │       ├── finance/         # Financial calculators
│   │       ├── performance/     # Performance analysis tools
│   │       ├── pricing/         # Pricing optimization tools
│   │       ├── product/         # Product analytics tools
│   │       └── revenue/         # Revenue tracking tools
│   ├── config/                # Configuration files
│   ├── content/               # Static content files
│   │   └── legal/             # Legal content (privacy.md, terms.md, gdpr.md)
│   ├── data/                  # Static data and FAQs
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and helpers
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
│   ├── image/                 # Image assets
│   ├── favicon files          # Browser icons and manifest
│   └── logo files             # Logo variations
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.mjs            # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
├── .eslintrc.json             # ESLint configuration
└── wrangler.jsonc             # Cloudflare Wrangler configuration
```

## ✨ Key Features

### 🏠 Landing Page
- **Modern Design**: Clean, professional design with smooth animations and transitions
- **Responsive Layout**: Fully responsive across desktop, tablet, and mobile devices
- **Performance Optimized**: Fast loading times with optimized images and assets
- **SEO Friendly**: Optimized meta tags, structured data, and semantic HTML

### 📰 Blog Integration (Marble CMS)
The blog system is powered by Marble CMS, providing a seamless content management experience.

**Features:**
- **Content Management**: Easy-to-use CMS for creating and managing blog posts
- **Dynamic Routing**: Automatic page generation for blog posts and categories
- **Rich Typography**: Beautiful typography with `@tailwindcss/typography` plugin
- **SEO Optimization**: Built-in SEO features for better search engine visibility

**Setup:**
1. Copy `.env.example` to `.env.local`
2. Set your `MARBLE_WORKSPACE_KEY` from your Marble CMS account
3. Optionally adjust `MARBLE_API_URL` and `MARBLE_WORKSPACE_ID`

**Available Pages:**
- `/blog` – Blog homepage listing all posts from Marble CMS
- `/blog/[slug]` – Individual blog post pages with rich typography rendering

### 🛠️ Business Tools & Calculators
A comprehensive suite of business calculation tools organized by category:

**Customer Metrics Tools:**
- Customer activation rate calculator
- Customer acquisition cost (CAC) calculator
- Churn rate calculator
- Customer lifetime value (CLTV) to CAC ratio
- Customer cohort analysis
- Net Promoter Score (NPS) calculator
- Customer retention rate calculator

**Financial Calculators:**
- Break-even analysis
- Burn rate calculator
- Cash flow analysis
- Gross margin calculator
- Net margin calculator
- Operating expense ratio
- Payback period calculator
- Revenue per employee
- Runway calculator

**Performance Analysis:**
- A/B test significance calculator
- Conversion rate calculator
- Cost per acquisition (CPA) calculator
- Engagement rate calculator
- Funnel conversion analysis
- ROI calculator
- Return on marketing investment (ROMI)

**Pricing Optimization:**
- Discount impact calculator
- Freemium conversion analysis
- Price elasticity calculator
- SaaS valuation tools
- Tier pricing optimizer
- Value-based pricing calculator
- Willingness to pay (WTP) survey tools

**Product Analytics:**
- Cohort analysis tools
- Feature adoption tracking
- Feature usage frequency analysis
- Product stickiness calculator
- Time to first value (TTFV) calculator

**Revenue Tracking:**
- Average revenue per user (ARPU)
- Annual recurring revenue (ARR)
- Growth rate calculations
- Lifetime value (LTV) analysis
- Monthly recurring revenue (MRR)

### 🔍 Alternative Tools Directory
Comprehensive directory of alternative tools and services:
- Tool comparisons and reviews
- Feature-by-feature analysis
- Pricing comparisons
- User reviews and ratings
- Alternative recommendations

### 📚 Definitions & Glossary
Educational content with definitions and explanations:
- Business terms and concepts
- Industry-specific terminology
- Technical definitions
- Structured data for SEO optimization

### ⚖️ Legal Pages
Comprehensive legal documentation with detailed content:
- **Privacy Policy**: Detailed privacy practices and data handling procedures
- **Terms of Service**: Comprehensive terms and conditions
- **GDPR Compliance**: EU data protection compliance information

### 🎨 Styling and Design
- **Tailwind CSS**: Modern utility-first CSS framework
- **Typography Plugin**: Enhanced text styling with `@tailwindcss/typography`
- **Custom Components**: Reusable UI components built with accessibility in mind
- **Design System**: Consistent design tokens and component library

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS v4**: Utility-first CSS framework

### Content Management
- **Marble CMS**: Headless CMS for blog content management
- **MDX**: Markdown with React component support for rich content

### Development Tools
- **ESLint**: Code linting for consistent code quality
- **Prettier**: Code formatting for consistent style
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing and optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
1. Clone the repository
2. Navigate to the web app directory:
   ```bash
   cd apps/web
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Configure your environment variables:
   ```bash
   # Required for blog functionality
   MARBLE_WORKSPACE_KEY=your_marble_workspace_key
   
   # Optional - defaults provided
   MARBLE_API_URL=https://api.marblecms.com
   MARBLE_WORKSPACE_ID=your_workspace_id
   ```

### Development
Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Building for Production
```bash
npm run build
# or
yarn build
```

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: Optimized for small screens with touch-friendly interfaces
- **Tablet**: Adaptive layouts for medium screen sizes
- **Desktop**: Full-featured experience with enhanced layouts
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support

## 🔒 Security Features

- **Secure Authentication**: Modern authentication patterns
- **Data Protection**: Privacy-focused design with GDPR compliance
- **Content Security Policy**: Protection against XSS and other attacks
- **HTTPS Only**: All communications encrypted in transit

## 📊 Performance

- **Code Splitting**: Automatic code splitting for optimal loading
- **Image Optimization**: Next.js Image component for optimized images
- **Caching**: Intelligent caching strategies for static and dynamic content
- **Bundle Analysis**: Tools for monitoring and optimizing bundle size

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information on how to get involved.

## 📝 License

This project is licensed under the terms specified in the main repository.

## 🆘 Support

For support and questions:
- Check our documentation
- Open an issue in the repository
- Contact us at support@feedgot.com

---

**Happy coding!** 🎉 Thank you for being part of the Feedgot development community. We're excited to see what you build with this codebase!