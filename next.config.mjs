const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Persistent dev cache repeatedly failed with checksum corruption locally.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
