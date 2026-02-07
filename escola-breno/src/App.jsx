import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EscolaBreno from './components/EscolaBreno'
import MundoLinguagem from './components/MundoLinguagem'
import AtividadeLetras from './components/linguagem/AtividadeLetras'
import AtividadeNome from './components/linguagem/AtividadeNome'
import AtividadeSilabas from './components/linguagem/AtividadeSilabas'
import AtividadePalavras from './components/linguagem/AtividadePalavras'
import AtividadeFrases from './components/linguagem/AtividadeFrases'
import DominioEmBreve from './components/DominioEmBreve'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Hub principal */}
        <Route path="/" element={<EscolaBreno />} />

        {/* Mundo da Linguagem */}
        <Route path="/linguagem" element={<MundoLinguagem />} />
        <Route path="/linguagem/letras" element={<AtividadeLetras />} />
        <Route path="/linguagem/nome" element={<AtividadeNome />} />
        <Route path="/linguagem/silabas" element={<AtividadeSilabas />} />
        <Route path="/linguagem/palavras" element={<AtividadePalavras />} />
        <Route path="/linguagem/frases" element={<AtividadeFrases />} />

        {/* Dominios futuros */}
        <Route path="/matematica" element={<DominioEmBreve dominioId="matematica" />} />
        <Route path="/tempo" element={<DominioEmBreve dominioId="tempo" />} />
        <Route path="/vida" element={<DominioEmBreve dominioId="vida" />} />
        <Route path="/emocoes" element={<DominioEmBreve dominioId="emocoes" />} />

        {/* Fallback */}
        <Route path="*" element={<EscolaBreno />} />
      </Routes>
    </BrowserRouter>
  )
}
