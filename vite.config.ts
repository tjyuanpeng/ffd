import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import manifest from './src/manifest'

export default defineConfig(() => {
  return {
    build: {
      cssCodeSplit: true,
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    plugins: [
      crx({ manifest }),
      Components({
        dts: './src/types/components.d.ts',
        resolvers: [
          AntDesignVueResolver({
            importStyle: 'less', // 推荐使用Less
            resolveIcons: true,
          }),
        ],
      }),
      vue(),
    ],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  }
})
