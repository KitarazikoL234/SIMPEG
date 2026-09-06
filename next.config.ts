import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '10.157.175.113', '10.157.175.113:3000',
    '192.168.1.5', '192.168.1.5:3000',
    'localhost:3000'
  ],
};

export default nextConfig;
