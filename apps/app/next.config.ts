import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            { source: '/auth/sign-in', destination: '/auth/signin', permanent: true },
            { source: '/auth/sign-up', destination: '/auth/signup', permanent: true },
            { source: '/auth/forgot-password', destination: '/auth/forgot', permanent: true },
            { source: '/auth/set-password', destination: '/auth/setpassword', permanent: true },
            { source: '/auth/two-factor', destination: '/auth/twofactor', permanent: true },
            { source: '/api/changelog/ai-stream', destination: '/api/changelog/stream', permanent: true },
        ];
    },
    async headers() {
        const nosniff = { key: 'X-Content-Type-Options', value: 'nosniff' }
        const referrer = { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        const appCsp = {
            key: 'Content-Security-Policy',
            value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.posthog.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self' https: wss:",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
            ].join('; '),
        }
        const widgetCsp = {
            key: 'Content-Security-Policy',
            value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self' https: wss:",
                "frame-ancestors *",
                "base-uri 'self'",
                "object-src 'none'",
            ].join('; '),
        }
        return [
            {
                source: '/widget',
                headers: [nosniff, referrer, widgetCsp],
            },
            {
                source: '/widget/:path*',
                headers: [nosniff, referrer, widgetCsp],
            },
            {
                source: '/((?!widget(?:/|$)).*)',
                headers: [
                    nosniff,
                    referrer,
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    appCsp,
                ],
            },
        ]
    },
    images: {
        remotePatterns: [
          { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
          { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
          { protocol: 'https', hostname: 'github.com', pathname: '/**' },
          { protocol: 'https', hostname: 'githubusercontent.com', pathname: '/**' },
          { protocol: 'https', hostname: 'gravatar.com', pathname: '/**' },
          { protocol: 'https', hostname: 'www.google.com', pathname: '/**' },
          { protocol: 'https', hostname: 't1.gstatic.com', pathname: '/**' },
          { protocol: 'https', hostname: 'pub-e058408694e44c9e829046a8a6d5d1a5.r2.dev', pathname: '/**' },
        ],
      },
  typescript: {
    ignoreBuildErrors: true,
  },

  
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "featul",

  project: "featul",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
