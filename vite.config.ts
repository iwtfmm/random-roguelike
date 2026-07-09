import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// GitHub Pages 子路径；本地 dev 与 file:// 打开仍可正常工作
const repoName = 'random-roguelike';
const isCI = process.env.GITHUB_ACTIONS === 'true';
const base = isCI ? `/${repoName}/` : './';

// https://vite.dev/config/
export default defineConfig({
  base,
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths()
  ],
  server: {
    // vite 启动后自动打开浏览器，避免 .bat 里脆弱的延时 start
    open: true,
    host: '127.0.0.1',
    port: 5173,
  },
})
