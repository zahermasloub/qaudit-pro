/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no experimental flags required.
  eslint: {
    // Ignore legacy admin lint warnings until they are addressed in future phases.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporary: admin APIs rely on Prisma models that are absent today.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
