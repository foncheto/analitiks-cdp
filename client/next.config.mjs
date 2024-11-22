/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pm-s3-images-crm.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: ["react-leaflet"],
};

export default nextConfig;
