/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Stray lockfiles exist up the directory tree; pin the tracing root so
  // Next stops guessing the workspace root.
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
};

export default nextConfig;
