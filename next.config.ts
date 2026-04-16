import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/user-attachments/assets/0183febc-de51-4b74-9be4-55929f857536",
      },
    ],
  },
};

export default nextConfig;
