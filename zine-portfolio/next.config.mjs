/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
};

export default nextConfig;
