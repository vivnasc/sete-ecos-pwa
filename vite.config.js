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
        name: 'SETE ECOS — Sistema de Transmutacao Feminina',
        short_name: 'Sete Ecos',
        description: 'Sete caminhos para despertar cada dimensao da tua essencia feminina. Plataforma holistica de bem-estar.',
        lang: 'pt',
        theme_color: '#4B0082',
        background_color: '#FCFCFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['health', 'lifestyle', 'wellness', 'fitness'],
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
        ],
        screenshots: [],
        shortcuts: [
          {
            name: 'Lumina — Diagnostico',
            short_name: 'Lumina',
            url: '/lumina',
            icons: [{ src: 'logos/lumina-logo_v2.png', sizes: '192x192' }]
          },
          {
            name: 'Vitalis — Nutricao',
            short_name: 'Vitalis',
            url: '/vitalis/dashboard',
            icons: [{ src: 'logos/VITALIS_LOGO_V3.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        globIgnores: ['logos/**/*'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Push notification handler
        importScripts: ['/push-sw.js'],
        // Offline fallback
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Cache de imagens
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
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
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
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
                maxAgeSeconds: 60 * 60 * 24
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor pesados para melhor caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  },
  server: { port: 3000 }
})
