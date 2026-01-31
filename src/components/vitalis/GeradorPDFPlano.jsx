// src/components/vitalis/GeradorPDFPlano.jsx
// Componente que chama a API para gerar PDF profissional

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

export default function GeradorPDFPlano({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [planoId, setPlanoId] = useState(null);

  useEffect(() => { carregarDados(); }, [userId]);

  const carregarDados = async () => {
    try {
      const { data: cliente } = await supabase.from('vitalis_clients').select('*').eq('user_id', userId).single();
      const { data: plano } = await supabase.from('vitalis_plano').select('*').eq('client_id', cliente?.id).single();
      const { data: intake } = await supabase.from('vitalis_intake').select('nome').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
      
      setPlanoId(plano?.id);
      setDados({
        nome: intake?.nome || 'Cliente',
        peso_actual: plano?.peso_actual || 70,
        peso_meta: plano?.peso_meta || 60,
        fase: plano?.fase || 'inducao',
      });
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = async () => {
    if (!planoId) {
      setErro('Plano não encontrado');
      return;
    }
    
    setGerando(true);
    setErro(null);
    
    try {
      const baseUrl = window.location.origin;
      
      const response = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoId, baseUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar PDF');
      }

      // Descarregar o PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setTimeout(onClose, 500);
    } catch (err) {
      console.error('Erro PDF:', err);
      setErro(err.message || 'Erro ao gerar PDF. Tenta novamente.');
    } finally {
      setGerando(false);
    }
  };

  if (loading) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'20px',padding:'40px',textAlign:'center'}}>
          <div style={{width:'50px',height:'50px',border:'4px solid #f3f3f3',borderTop:'4px solid #C1634A',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div>
          <p style={{marginTop:'20px',color:'#666',fontSize:'15px'}}>A preparar...</p>
          <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'20px'}}>
      <div style={{background:'white',borderRadius:'24px',maxWidth:'480px',width:'100%',overflow:'hidden',boxShadow:'0 25px 80px rgba(0,0,0,0.3)'}}>
        
        {/* Header */}
        <div style={{background:'linear-gradient(135deg, #C1634A 0%, #8B4513 100%)',padding:'35px',textAlign:'center',color:'white'}}>
          <div style={{width:'80px',height:'80px',background:'rgba(255,255,255,0.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',backdropFilter:'blur(10px)'}}>
            <span style={{fontSize:'42px',fontWeight:'bold'}}>V</span>
          </div>
          <h2 style={{fontSize:'24px',fontWeight:'600',margin:'0 0 8px'}}>Plano Alimentar</h2>
          <p style={{fontSize:'15px',opacity:0.9,margin:0}}>{dados?.nome}</p>
        </div>

        {/* Content */}
        <div style={{padding:'35px'}}>
          <div style={{background:'#F5F0E8',borderRadius:'16px',padding:'22px',marginBottom:'25px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'15px'}}>
              <span style={{color:'#8B4513',fontSize:'14px'}}>Formato</span>
              <span style={{color:'#6B4423',fontWeight:'600'}}>PDF Profissional</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'15px'}}>
              <span style={{color:'#8B4513',fontSize:'14px'}}>Páginas</span>
              <span style={{color:'#6B4423',fontWeight:'600'}}>10</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#8B4513',fontSize:'14px'}}>Fase</span>
              <span style={{color:'#6B4423',fontWeight:'600',textTransform:'capitalize'}}>{dados?.fase?.replace('_', ' ')}</span>
            </div>
          </div>

          {erro && (
            <div style={{background:'#FFEBEE',border:'1px solid #E57373',borderRadius:'12px',padding:'15px',marginBottom:'20px',color:'#C62828',fontSize:'14px',textAlign:'center'}}>
              {erro}
            </div>
          )}

          <div style={{display:'flex',gap:'15px'}}>
            <button 
              onClick={onClose} 
              style={{flex:1,padding:'16px',background:'#f5f5f5',color:'#666',border:'none',borderRadius:'14px',fontSize:'15px',fontWeight:'500',cursor:'pointer'}}
            >
              Cancelar
            </button>
            <button 
              onClick={gerarPDF} 
              disabled={gerando}
              style={{flex:2,padding:'16px',background:gerando?'#ccc':'linear-gradient(135deg, #C1634A, #8B4513)',color:'white',border:'none',borderRadius:'14px',fontSize:'15px',fontWeight:'600',cursor:gerando?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}
            >
              {gerando ? (
                <>
                  <div style={{width:'20px',height:'20px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
                  A gerar...
                </>
              ) : (
                <>📥 Descarregar PDF</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
