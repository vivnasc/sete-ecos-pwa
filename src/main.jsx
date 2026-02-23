import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './styles/global.css'
import { captureUTM } from './utils/utm'
import { captureReferral } from './utils/referral'

// Capturar parametros de marketing da URL no carregamento
captureUTM()
captureReferral()

// Registar Service Worker com auto-update
// Verifica a cada hora se há nova versão e actualiza automaticamente
registerSW({
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000) // verificar a cada 1 hora
    }
  },
  onOfflineReady() {
    console.log('[SW] App pronta para uso offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
