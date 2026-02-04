import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Vitalis - Adaptação Metabólica',
        short_name: 'Vitalis',
        description: 'A tua app de acompanhamento nutricional personalizado',
        theme_color: '#7C8B6F',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/vitalis/dashboard',
        icons: [
          {
            src: 'logos/sete-ecos-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logos/sete-ecos-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logos/sete-ecos-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache de páginas e recursos
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        // Excluir logos grandes da pasta logos/
        globIgnores: ['logos/**/*'],
        // Aumentar limite para ficheiros maiores
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        // Runtime caching para API
        runtimeCaching: [
          {
            // Cache de imagens
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          },
          {
            // Cache de fontes
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              }
            }
          },
          {
            // Network first para API do Supabase
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Cache first para CDNs
            urlPattern: /^https:\/\/cdn\..*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // Permitir testar em desenvolvimento
      }
    })
  ],
  server: { port: 3000 }
})
