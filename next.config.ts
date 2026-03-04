import withPWA from "@ducanh2912/next-pwa";

const nextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
})({
  turbopack: {}, // ← esto silencia el error
  images: {
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }],
  },
});

export default nextConfig;
