import { defineConfig } from "vite";
import { viteMockServe } from 'vite-plugin-mock'
import vue from "@vitejs/plugin-vue";
import cesium from "vite-plugin-cesium";
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cesium(),
    viteMockServe({
      supportTs: false,
      logger: false,
      mockPath: "./mock/"   // 注意：此时的 mockPath 地址是真正安装的 mock 文件夹的地址;
    })],
  // 为 ./src 提供别名 @
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
});
