import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//---ABI---
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    //---ABI---
    // vueDevTools(),
    {
      name: 'same-origin-proxy',
      configureServer(server) {
        server.middlewares.use('/proxy', async (req, res, next) => {
          const requestUrl = new URL(req.url || '/', 'http://localhost')
          const targetUrl = requestUrl.searchParams.get('url')

          if (!targetUrl) {
            res.statusCode = 400
            res.end('Missing url query parameter')
            return
          }

          try {
            const upstreamResponse = await fetch(targetUrl)
            const contentType = upstreamResponse.headers.get('content-type') || 'application/octet-stream'

            res.statusCode = upstreamResponse.status
            res.setHeader('Content-Type', contentType)
            res.setHeader('Cache-Control', 'public, max-age=3600')

            for (const [key, value] of upstreamResponse.headers.entries()) {
              if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                res.setHeader(key, value)
              }
            }

            const body = Buffer.from(await upstreamResponse.arrayBuffer())
            res.end(body)
          } catch (error) {
            res.statusCode = 502
            res.end('Proxy fetch failed')
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    global: 'window'
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
