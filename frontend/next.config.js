import("./src/env.js");

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.brandfetch.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "skzqkbzsakzybrclflnm.supabase.co",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;

