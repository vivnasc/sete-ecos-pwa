import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Lumina (já existe)
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import LuminaCheckin from './components/LuminaCheckin';
import LuminaLeitura from './components/LuminaLeitura';
import Lumina from './pages/Lumina';
import Home from './pages/Home';

// Vitalis (novo)
import VitalisAuth from './components/vitalis/Auth';
import VitalisIntakeComplete from './components/vitalis/VitalisIntakeComplete';
import DashboardVitalis from './components/vitalis/DashboardVitalis';
import CheckinDiario from './components/vitalis/CheckinDiario';
import ReceitasBrowse from './components/vitalis/ReceitasBrowse';
import EspacoRetorno from './components/vitalis/EspacoRetorno';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-gray-600">A carregar Sete Ecos...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Home */}
        <Route path="/" element={<Home />} />

        {/* Rotas Lumina (existentes) */}
        <Route path="/lumina" element={user ? <Lumina /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/lumina" />} />

        {/* Rotas Vitalis (novas) */}
        <Route path="/vitalis/login" element={!user ? <VitalisAuth /> : <Navigate to="/vitalis/dashboard" />} />
        <Route path="/vitalis/intake" element={user ? <VitalisIntakeComplete /> : <Navigate to="/vitalis/login" />} />
        <Route path="/vitalis/dashboard" element={user ? <DashboardVitalis /> : <Navigate to="/vitalis/login" />} />
        <Route path="/vitalis/checkin" element={user ? <CheckinDiario /> : <Navigate to="/vitalis/login" />} />
        <Route path="/vitalis/receitas" element={user ? <ReceitasBrowse /> : <Navigate to="/vitalis/login" />} />
        <Route path="/vitalis/espaco-retorno" element={user ? <EspacoRetorno /> : <Navigate to="/vitalis/login" />} />

        {/* Redirect padrão */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
