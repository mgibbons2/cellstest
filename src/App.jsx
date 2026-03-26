import { useState } from 'react'
import BgCanvas from './components/BgCanvas'
import HomePage from './components/HomePage'
import CharacterSelect from './components/CharacterSelect'
import EasyGame from './components/EasyGame'
import Leaderboard from './components/Leaderboard'

// pages: 'home' | 'char_select' | 'easy' | 'normal'
export default function App() {
  const [page, setPage]           = useState('home')
  const [pendingMode, setPendingMode] = useState(null)   // 'easy' | 'normal'
  const [character, setCharacter] = useState(null)
  const [homeLbOpen, setHomeLbOpen] = useState(false)

  function handlePlayMode(mode) {
    setPendingMode(mode)
    setPage('char_select')
  }

  function handleCharacterSelect(char) {
    setCharacter(char)
    setPage(pendingMode || 'easy')
  }

  return (
    <>
      <BgCanvas />

      {/* Home */}
      <HomePage
        active={page === 'home'}
        onPlay={handlePlayMode}
        onLeaderboard={() => setHomeLbOpen(true)}
      />

      {/* Character Select */}
      {page === 'char_select' && (
        <div className="page">
          <CharacterSelect
            onSelect={handleCharacterSelect}
            onBack={() => setPage('home')}
          />
        </div>
      )}

      {/* Easy game */}
      <EasyGame
        active={page === 'easy'}
        character={character}
        onBack={() => setPage('home')}
      />

      {/* Normal placeholder */}
      <div className={`page${page === 'normal' ? '' : ' hidden'}`}>
        <div className="game-wrap">
          <div className="game-topbar">
            <button className="back-btn" onClick={() => setPage('home')}>← Back</button>
            <span className="game-title">Normal Mode</span>
            <div />
          </div>
          <div style={{ color:'var(--dim)', letterSpacing:'.25em', textTransform:'uppercase', fontSize:'.8rem', marginTop:'70px' }}>
            Coming Soon
          </div>
        </div>
      </div>

      {/* Home leaderboard */}
      <Leaderboard show={homeLbOpen} showNamePrompt={false} onClose={() => setHomeLbOpen(false)} />

      <p className="footer">Click cells to advance them and their neighbors</p>
    </>
  )
}
