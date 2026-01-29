import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './pages/Home'
import Lumina from './pages/Lumina'
import Navigation from './components/Navigation'
// Vitalis (novo)
import VitalisAuth from './components/vitalis/Auth'
import VitalisIntakeComplete from './components/vitalis/VitalisIntakeComplete'
import DashboardVitalis from './components/vitalis/DashboardVitalis'
import CheckinDiario from './components/vitalis/CheckinDiario'
import ReceitasBrowse from './components/vitalis/ReceitasBrowse'
import EspacoRetorno from './components/vitalis/EspacoRetorno'
import PlanoAlimentar from './components/vitalis/PlanoAlimentar'  // ← NOVO

function App() {
  // ... resto igual ...

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Rotas Lumina */}
          <Route path="/lumina" element={session ? <Lumina /> : <Auth />} />
          
          {/* Rotas Vitalis PÚBLICAS */}
          <Route path="/vitalis/login" element={<VitalisAuth />} />
          
          {/* Rotas Vitalis PROTEGIDAS */}
          <Route path="/vitalis/intake" element={session ? <VitalisIntakeComplete /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/dashboard" element={session ? <DashboardVitalis /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/checkin" element={session ? <CheckinDiario /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/receitas" element={session ? <ReceitasBrowse /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/espaco-retorno" element={session ? <EspacoRetorno /> : <Navigate to="/vitalis/login" />} />
          <Route path="/vitalis/plano" element={session ? <PlanoAlimentar /> : <Navigate to="/vitalis/login" />} />  {/* ← NOVO */}
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}
export default App
