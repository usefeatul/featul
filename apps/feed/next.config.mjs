/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
          { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
          { protocol: 'https', hostname: 'github.com', pathname: '/**' },
          { protocol: 'https', hostname: 'githubusercontent.com', pathname: '/**' },
          { protocol: 'https', hostname: 'gravatar.com', pathname: '/**' },
          { protocol: 'https', hostname: 'www.google.com', pathname: '/**' },
          { protocol: 'https', hostname: 'pub-e058408694e44c9e829046a8a6d5d1a5.r2.dev', pathname: '/**' },
        ],
      },
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
  eslint: {
    ignoreDuringBuilds: true,
  }
}

export default nextConfig
