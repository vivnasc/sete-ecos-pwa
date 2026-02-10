// src/components/vitalis/GeradorPDFPlano.jsx
// Versão Print-to-PDF com LOGO REAL

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

export default function GeradorPDFPlano({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [planoId, setPlanoId] = useState(null);

  useEffect(() => { carregarDados(); }, [userId]);

  const carregarDados = async () => {
    try {
      const { data: cliente } = await supabase.from('vitalis_clients').select('*').eq('user_id', userId).single();
      let plano = null;

      // Try vitalis_plano view first
      if (cliente?.id) {
        const { data: planoView } = await supabase.from('vitalis_plano').select('*').eq('client_id', cliente.id).maybeSingle();
        plano = planoView;
      }

      // Fallback: query vitalis_meal_plans directly
      if (!plano) {
        const { data: mealPlan } = await supabase
          .from('vitalis_meal_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'activo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mealPlan) {
          plano = {
            ...mealPlan,
            peso_actual: cliente?.peso_actual,
            peso_meta: cliente?.peso_meta
          };
        }
      }

      const { data: intake } = await supabase.from('vitalis_intake').select('nome').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();

      setPlanoId(plano?.id);
      setDados({
        nome: intake?.nome || 'Cliente',
        peso_actual: plano?.peso_actual || cliente?.peso_actual || 70,
        peso_meta: plano?.peso_meta || cliente?.peso_meta || 60,
        fase: plano?.fase || 'inducao',
      });
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const abrirParaImprimir = () => {
    if (!planoId) {
      setErro('Plano não encontrado');
      return;
    }
    const url = `/vitalis/plano-pdf?id=${planoId}`;
    window.open(url, '_blank');
    onClose();
  };

  if (loading) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'20px',padding:'40px',textAlign:'center'}}>
          <div style={{width:'50px',height:'50px',border:'4px solid #f3f3f3',borderTop:'4px solid #7C8B6F',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div>
          <p style={{marginTop:'20px',color:'#6B5C4C',fontSize:'15px'}}>A preparar...</p>
          <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'20px'}}>
      <div style={{background:'white',borderRadius:'24px',maxWidth:'480px',width:'100%',overflow:'hidden',boxShadow:'0 25px 80px rgba(0,0,0,0.3)'}}>
        
        {/* Header com Logo V3 */}
        <div style={{background:'linear-gradient(135deg, #7C8B6F 0%, #8B9A7A 50%, #6B7A5D 100%)',padding:'35px',textAlign:'center',color:'white'}}>
          <img
            src="/logos/VITALIS_LOGO_V3.png"
            alt="Vitalis"
            style={{width:'100px',height:'100px',objectFit:'contain',marginBottom:'15px',filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'}}
          />
          <h2 style={{fontSize:'24px',fontWeight:'600',margin:'0 0 8px',fontFamily:'Cormorant Garamond, serif'}}>Plano Alimentar</h2>
          <p style={{fontSize:'15px',opacity:0.9,margin:0}}>{dados?.nome}</p>
        </div>

        {/* Content */}
        <div style={{padding:'35px'}}>
          <div style={{background:'linear-gradient(135deg, #F5F2ED, #E8E4DC)',borderRadius:'16px',padding:'22px',marginBottom:'25px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'15px'}}>
              <span style={{color:'#6B5C4C',fontSize:'14px'}}>📄 Formato</span>
              <span style={{color:'#4A4035',fontWeight:'600'}}>PDF Alta Qualidade</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'15px'}}>
              <span style={{color:'#6B5C4C',fontSize:'14px'}}>📑 Páginas</span>
              <span style={{color:'#4A4035',fontWeight:'600'}}>10</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#6B5C4C',fontSize:'14px'}}>🌿 Fase</span>
              <span style={{color:'#4A4035',fontWeight:'600',textTransform:'capitalize'}}>{dados?.fase?.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Instruções */}
          <div style={{background:'#E8F5E9',border:'1px solid #A5D6A7',borderRadius:'12px',padding:'18px',marginBottom:'25px'}}>
            <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'10px',fontSize:'14px'}}>💡 Como guardar o PDF:</div>
            <ol style={{margin:0,paddingLeft:'20px',color:'#1B5E20',fontSize:'13px',lineHeight:'1.8'}}>
              <li>Clica em "Abrir Plano"</li>
              <li>Prima <strong>Ctrl+P</strong> (ou ⌘+P no Mac)</li>
              <li>Escolhe "Guardar como PDF"</li>
              <li>Clica em Guardar</li>
            </ol>
          </div>

          {erro && (
            <div style={{background:'#FFEBEE',border:'1px solid #E57373',borderRadius:'12px',padding:'15px',marginBottom:'20px',color:'#C62828',fontSize:'14px',textAlign:'center'}}>
              {erro}
            </div>
          )}

          <div style={{display:'flex',gap:'15px'}}>
            <button 
              onClick={onClose} 
              style={{flex:1,padding:'16px',background:'#f5f5f5',color:'#666',border:'none',borderRadius:'14px',fontSize:'15px',fontWeight:'500',cursor:'pointer',transition:'all 0.2s'}}
            >
              Cancelar
            </button>
            <button
              onClick={abrirParaImprimir}
              style={{flex:2,padding:'16px',background:'linear-gradient(135deg, #7C8B6F, #6B7A5D)',color:'white',border:'none',borderRadius:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',transition:'all 0.2s',boxShadow:'0 4px 15px rgba(124,139,111,0.4)'}}
            >
              📄 Abrir Plano
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
