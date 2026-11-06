/**
 * Next.js config for LendLoop.
 *
 * Security headers are the main concern here: we lock down CSP, framing,
 * referrer policy, and add HSTS for production-grade defaults.
 *
 * @see docs/SECURITY.md
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Convex client is loaded from the deployment URL, not a bundled asset.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Lock down where scripts/styles can come from. Clerk + Convex are allowed.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.lendloop.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.clerk.accounts.dev https://*.convex.cloud wss://*.convex.cloud",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Prevent clickjacking — never allow this site in a frame.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Only send the origin, never the full URL or path.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS on supporting browsers.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Browsers shouldn't sniff content type.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Disable unnecessary browser features.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
