import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

export default function FotosProgresso() {
  const [loading, setLoading] = useState(true);
  const [fotos, setFotos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [novaFoto, setNovaFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tipoFoto, setTipoFoto] = useState('frente');
  const [notas, setNotas] = useState('');
  const [uploading, setUploading] = useState(false);
  const [comparando, setComparando] = useState(false);
  const [fotoComparacao1, setFotoComparacao1] = useState(null);
  const [fotoComparacao2, setFotoComparacao2] = useState(null);
  const fileInputRef = useRef(null);

  const TIPOS_FOTO = [
    { id: 'frente', nome: 'Frente', icone: '🧍' },
    { id: 'lado', nome: 'Lado', icone: '🚶' },
    { id: 'costas', nome: 'Costas', icone: '🚶‍♂️' },
  ];

  useEffect(() => {
    loadFotos();
  }, []);

  const loadFotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;
      setUserId(userData.id);

      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (clientData) setClient(clientData);

      // Carregar fotos do localStorage (em produção seria do Supabase Storage)
      const fotosSalvas = JSON.parse(localStorage.getItem(`vitalis-fotos-${userData.id}`) || '[]');
      setFotos(fotosSalvas.sort((a, b) => new Date(b.data) - new Date(a.data)));

    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter menos de 5MB');
        return;
      }

      setNovaFoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const guardarFoto = async () => {
    if (!previewUrl) return;
    setUploading(true);

    try {
      const novaEntrada = {
        id: Date.now(),
        data: new Date().toISOString(),
        tipo: tipoFoto,
        imageData: previewUrl,
        notas: notas,
        peso: client?.peso_actual || null
      };

      const fotosSalvas = JSON.parse(localStorage.getItem(`vitalis-fotos-${userId}`) || '[]');
      const novaLista = [novaEntrada, ...fotosSalvas];

      localStorage.setItem(`vitalis-fotos-${userId}`, JSON.stringify(novaLista));
      setFotos(novaLista);

      // Reset
      setMostrarUpload(false);
      setNovaFoto(null);
      setPreviewUrl(null);
      setNotas('');
      setTipoFoto('frente');

    } catch (error) {
      console.error('Erro ao guardar foto:', error);
      alert('Erro ao guardar foto');
    } finally {
      setUploading(false);
    }
  };

  const apagarFoto = (id) => {
    if (!confirm('Tens a certeza que queres apagar esta foto?')) return;

    const novaLista = fotos.filter(f => f.id !== id);
    localStorage.setItem(`vitalis-fotos-${userId}`, JSON.stringify(novaLista));
    setFotos(novaLista);
  };

  const iniciarComparacao = () => {
    if (fotos.length < 2) {
      alert('Precisas de pelo menos 2 fotos para comparar');
      return;
    }
    setComparando(true);
    setFotoComparacao1(fotos[fotos.length - 1]); // Mais antiga
    setFotoComparacao2(fotos[0]); // Mais recente
  };

  const formatarData = (dataStr) => {
    return new Date(dataStr).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Agrupar por mês
  const fotosPorMes = fotos.reduce((acc, foto) => {
    const mes = new Date(foto.data).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(foto);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">📸</div>
          <p className="text-[#6B5C4C]">A carregar fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>Fotos de Progresso</h1>
                <p className="text-white/70 text-sm">{fotos.length} fotos guardadas</p>
              </div>
            </div>
            {fotos.length >= 2 && (
              <button
                onClick={iniciarComparacao}
                className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              >
                🔄 Comparar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Botão Adicionar */}
        <button
          onClick={() => setMostrarUpload(true)}
          className="w-full py-4 bg-white rounded-2xl shadow-lg flex items-center justify-center gap-2 text-[#7C8B6F] font-semibold hover:shadow-xl transition-all"
        >
          <span className="text-2xl">📷</span>
          <span>Adicionar Nova Foto</span>
        </button>

        {/* Modal Upload */}
        {mostrarUpload && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Nova Foto</h2>
                <button onClick={() => { setMostrarUpload(false); setPreviewUrl(null); }} className="text-2xl text-gray-400">×</button>
              </div>

              {/* Preview ou Seletor */}
              {previewUrl ? (
                <div className="relative mb-4">
                  <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                  <button
                    onClick={() => { setPreviewUrl(null); setNovaFoto(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7C8B6F] transition-colors mb-4"
                >
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-gray-500">Toca para selecionar foto</p>
                  <p className="text-xs text-gray-400 mt-1">Máx. 5MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Tipo de foto */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Posição</label>
                <div className="flex gap-2">
                  {TIPOS_FOTO.map(tipo => (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoFoto(tipo.id)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        tipoFoto === tipo.id
                          ? 'bg-[#7C8B6F] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tipo.icone} {tipo.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Notas (opcional)</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ex: Início da semana 3, sinto-me mais leve..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Info peso atual */}
              {client?.peso_actual && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                  Peso atual: <strong>{client.peso_actual} kg</strong> (será guardado com a foto)
                </div>
              )}

              <button
                onClick={guardarFoto}
                disabled={!previewUrl || uploading}
                className="w-full py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold hover:bg-[#6B7A5D] transition-colors disabled:opacity-50"
              >
                {uploading ? 'A guardar...' : 'Guardar Foto'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Comparação */}
        {comparando && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
            <div className="p-4 flex items-center justify-between text-white">
              <h2 className="text-lg font-bold">Comparação</h2>
              <button onClick={() => setComparando(false)} className="text-2xl">×</button>
            </div>

            <div className="flex-1 flex">
              {/* Foto Antes */}
              <div className="flex-1 p-2">
                <div className="h-full bg-gray-800 rounded-xl overflow-hidden relative">
                  {fotoComparacao1 && (
                    <>
                      <img src={fotoComparacao1.imageData} alt="Antes" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white font-semibold">Antes</p>
                        <p className="text-white/70 text-sm">{formatarData(fotoComparacao1.data)}</p>
                        {fotoComparacao1.peso && <p className="text-white/70 text-sm">{fotoComparacao1.peso} kg</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Foto Depois */}
              <div className="flex-1 p-2">
                <div className="h-full bg-gray-800 rounded-xl overflow-hidden relative">
                  {fotoComparacao2 && (
                    <>
                      <img src={fotoComparacao2.imageData} alt="Depois" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white font-semibold">Depois</p>
                        <p className="text-white/70 text-sm">{formatarData(fotoComparacao2.data)}</p>
                        {fotoComparacao2.peso && <p className="text-white/70 text-sm">{fotoComparacao2.peso} kg</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Diferença de peso */}
            {fotoComparacao1?.peso && fotoComparacao2?.peso && (
              <div className="p-4 text-center">
                <p className="text-white text-lg">
                  Diferença: <strong className={fotoComparacao2.peso < fotoComparacao1.peso ? 'text-green-400' : 'text-red-400'}>
                    {(fotoComparacao2.peso - fotoComparacao1.peso).toFixed(1)} kg
                  </strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Fotos */}
        {fotos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-gray-500 mb-2">Ainda não tens fotos de progresso</p>
            <p className="text-gray-400 text-sm">Adiciona a tua primeira foto para acompanhar a evolução!</p>
          </div>
        ) : (
          Object.entries(fotosPorMes).map(([mes, fotosDoMes]) => (
            <div key={mes}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 capitalize">{mes}</h3>
              <div className="grid grid-cols-3 gap-2">
                {fotosDoMes.map(foto => (
                  <div key={foto.id} className="relative group">
                    <img
                      src={foto.imageData}
                      alt={foto.tipo}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center">
                      <p className="text-white text-xs">{formatarData(foto.data)}</p>
                      {foto.peso && <p className="text-white text-sm font-semibold">{foto.peso} kg</p>}
                      <button
                        onClick={() => apagarFoto(foto.id)}
                        className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
                      >
                        Apagar
                      </button>
                    </div>
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                      {TIPOS_FOTO.find(t => t.id === foto.tipo)?.icone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Dicas */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <h3 className="font-semibold text-purple-800 mb-2">📸 Dicas para Fotos</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Tira as fotos sempre no mesmo local e hora</li>
            <li>• Usa roupa justa ou desportiva</li>
            <li>• Mantém a mesma distância da câmara</li>
            <li>• Boa iluminação faz toda a diferença</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
