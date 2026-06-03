import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // PTP-02: Restrictive CSP for prototype share pages
        source: '/prototypes/:name*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'none'",
              "script-src 'unsafe-inline'",
              "style-src 'unsafe-inline'",
              "img-src data: blob:",
              "connect-src 'none'",
              "form-action 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
