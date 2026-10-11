import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kjxoxalzgyqlyybjslye.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "proclamadelpacifico.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagenes2.eltiempo.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;