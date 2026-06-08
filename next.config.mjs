/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jbuqzxgtfvfuahmaoztw.supabase.co',
      },
    ],
  },
}

export default nextConfig
