import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 빌드 시 타입 체크를 건너뛰도록 설정 (선택사항)
    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
