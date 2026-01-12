import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
// /user/* 또는 /api/* (또는 /api/v1/*) 요청시 백엔드 서버로 프록시함
// 프록시를 해야 CORS 문제 해결
// 환경 변수 VITE_API_URL로 백엔드 주소 설정 가능 (기본값: http://192.168.50.218:8080)
// 예: .env 파일에 VITE_API_URL=http://192.168.50.218:8080 설정
export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), "");
  const API_BASE_URL = env.VITE_API_URL || "http://localhost:8080";

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
    },
    server: {
      proxy: {
        "/user": {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        "/api": {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          // /api/v1/* 경로도 포함하여 프록시
        },
        "/uploads": {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          // 정적 리소스 (프로필 이미지 등) 프록시
        },
      },
    },
  };
});
