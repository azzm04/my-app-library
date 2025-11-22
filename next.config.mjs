// next.config.mjs
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  // ❌ Jangan pakai disable di sini, Vercel sering salah deteksi
  // ❌ Jangan pakai runtimeCaching custom dulu (bikin conflict App Router)
  fallbacks: {
    document: '/offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD: Date.now(), // fix untuk SW caching update
  },
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default withPWA(nextConfig);
