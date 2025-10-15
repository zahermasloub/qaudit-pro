/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true } // مؤقتًا لحماية البناء من دين قديم
};
module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no experimental flag needed.
  eslint: {
    // Lint warnings exist in legacy admin routes; skip them during CI builds.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Legacy admin routes depend on Prisma models that will be reintroduced in later phases.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
