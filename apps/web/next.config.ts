/** @type {import('next').NextConfig} */

const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    agentUpgrade: 'security',
  },
  images: {
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.marblecms.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.marblecms.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    // Preserve the terms link used by the existing Google OAuth consent screen.
    return [{ source: '/term', destination: '/terms', permanent: true }]
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} https://*.marblecms.com https://news.google.com https://cdn.seline.com`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
          "frame-src 'self' https://news.google.com https://www.google.com https://accounts.google.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
        ].join('; '),
      },
    ]
    // Markdown twin `Link` and `Vary: Accept` headers are set in src/proxy.ts.
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
