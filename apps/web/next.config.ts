/** @type {import('next').NextConfig} */

const acceptMarkdown = {
  type: 'header',
  key: 'accept',
  value: '(.*)text/markdown(.*)',
}

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
    ignoreBuildErrors: true,
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
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/docs/llms.txt',
          destination: '/md/docs/llms.txt',
        },
        {
          source: '/index.md',
          destination: '/md',
        },
        {
          source: '/:path*.md',
          destination: '/md/:path*',
        },
        {
          source: '/',
          has: [acceptMarkdown],
          destination: '/md',
        },
        {
          source: '/pricing',
          has: [acceptMarkdown],
          destination: '/md/pricing',
        },
        {
          source: '/docs/:path*',
          has: [acceptMarkdown],
          destination: '/md/docs/:path*',
        },
      ],
    }
  },
  async headers() {
    const varyAccept = { key: 'Vary', value: 'Accept' }
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.marblecms.com https://news.google.com",
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
    return [
      {
        source: '/',
        headers: [
          varyAccept,
          {
            key: 'Link',
            value:
              '</index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"',
          },
          ...securityHeaders,
        ],
      },
      {
        source: '/pricing',
        headers: [
          varyAccept,
          {
            key: 'Link',
            value:
              '</pricing.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"',
          },
          ...securityHeaders,
        ],
      },
      {
        source: '/docs/:path*',
        headers: [
          varyAccept,
          {
            key: 'Link',
            value: '</docs/llms.txt>; rel="describedby"',
          },
          ...securityHeaders,
        ],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
