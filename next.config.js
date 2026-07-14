/** @type {import('next').NextConfig} */
const remotePatterns = [];

const publicStorageBaseUrl = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL;
if (publicStorageBaseUrl) {
  try {
    const storageUrl = new URL(publicStorageBaseUrl);
    remotePatterns.push({
      protocol: storageUrl.protocol.replace(':', ''),
      hostname: storageUrl.hostname,
      port: storageUrl.port,
      pathname: '/**',
    });
  } catch {
    console.warn('OBJECT_STORAGE_PUBLIC_BASE_URL is not a valid URL; external image optimization is disabled.');
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns,
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;
