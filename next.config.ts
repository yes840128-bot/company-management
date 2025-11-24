import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 개발 인디케이터 위치 설정 (CSS로 숨기기)
  devIndicators: {
    position: 'bottom-right',
  },
  // Vercel 배포를 위한 설정
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
