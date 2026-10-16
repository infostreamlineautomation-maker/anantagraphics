import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");
const isDev = process.env.NODE_ENV !== "production";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Sent on every response. HSTS only matters over HTTPS (browsers ignore it on http://localhost).
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  cacheComponents: true,
  images: {
    // Media lives in backend/uploads and is served by the API host
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/uploads/**",
      },
    ],
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    // Next refuses to optimise images from private addresses. Allow it only when the API itself is local
    // (dev, or a production test on this machine); remotePatterns still limit it to <api>/uploads/**.
    dangerouslyAllowLocalIP: isDev || LOCAL_HOSTS.has(apiUrl.hostname),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
