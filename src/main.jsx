import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import { captureUTM } from './utils/utm'
import { captureReferral } from './utils/referral'

// Capturar parametros de marketing da URL no carregamento
captureUTM()
captureReferral()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
