import { useEffect, useState, useRef } from 'react'
import Grid from './Grid'
import PowerupBar from './PowerupBar'
import AbilityBar from './AbilityBar'
import ColorPicker from './ColorPicker'
import WinOverlay from './WinOverlay'
import Leaderboard from './Leaderboard'
import { useGameState } from '../hooks/useGameState'
import { useToast } from '../hooks/useToast'
import { calcScore, isNewBest, saveScore } from '../utils/game'

export default function EasyGame({ active, character, onBack }) {
  const [winScore, setWinScore]   = useState(null)
  const [winShow, setWinShow]     = useState(false)
  const [newBest, setNewBest]     = useState(false)
  const [lbOpen, setLbOpen]       = useState(false)
  const [lbFromWin, setLbFromWin] = useState(false)

  const { message: toastMsg, visible: toastVisible, showToast } = useToast()
  const scoreSnapshotRef = useRef(null)

  useEffect(() => {
    window.__cellsToast = showToast
    return () => { delete window.__cellsToast }
  }, [showToast])

  const handleWin = (snapshot) => {
    scoreSnapshotRef.current = snapshot
    setWinShow(true)
  }

  const game = useGameState({ character, onWin: handleWin })

  useEffect(() => {
    if (!winShow || !scoreSnapshotRef.current) return
    const s = calcScore(scoreSnapshotRef.current)
    setWinScore(s)
    setNewBest(isNewBest(s.total))
    saveScore(s, null)
  }, [winShow])

  useEffect(() => {
    if (active) {
      setWinShow(false)
      setWinScore(null)
      setLbOpen(false)
      game.initGame(character)
    }
  }, [active]) // eslint-disable-line

  function handleRestart() {
    setWinShow(false)
    setWinScore(null)
    game.initGame(character)
  }

  const isTargeting = game.isTargeting

  return (
    <>
      <div className={`page${active ? '' : ' hidden'}`}>
        <div className="game-wrap">

          {/* Top bar */}
          <div className="game-topbar">
            <button className="back-btn" onClick={onBack}>← Back</button>
            <span className="game-title" style={character ? { color: character.color } : {}}>
              {character ? `${character.name} · Easy` : 'Easy Mode'}
            </span>
            <div className="live-score-wrap">
              <div className="click-counter">
                <strong>{game.clicks}</strong> clicks
              </div>
              <div className="live-mult">
                ×{game.liveMultiplier.toFixed(2)} multiplier
              </div>
            </div>
          </div>

          {/* Grid */}
          {game.board.length > 0 && (
            <Grid
              board={game.board}
              puOnBoard={game.puOnBoard}
              flipping={game.flipping}
              previewCells={game.previewCells}
              isTargeting={isTargeting}
              onCellClick={game.onCellClick}
              onCellHover={game.onCellHover}
              onCellLeave={game.onCellLeave}
            />
          )}

          {/* Character ability bar */}
          {character && (
            <AbilityBar
              character={character}
              abilityState={game.abilityState}
              onUse={game.activateAbility}
            />
          )}

          {/* Powerup bar */}
          <PowerupBar
            inventory={game.inventory}
            activePU={game.activePowerup}
            hint={game.hint}
            onToggle={game.toggleStoredPU}
            onCancel={game.cancelStoredPU}
          />

          {/* Legend */}
          <div className="legend">
            {[['c0','Color 1'],['c1','Color 2'],['c2','Color 3']].map(([cls, label]) => (
              <div className="legend-item" key={cls}>
                <div className={`legend-dot ${cls}`} />{label}
              </div>
            ))}
          </div>

        </div>
      </div>

      <ColorPicker open={game.cpOpen} title={game.cpTitle} onChoose={game.cpChoose} onCancel={game.cpCancel} />

      <WinOverlay
        show={winShow} score={winScore} isNewBest={newBest}
        onRestart={handleRestart}
        onLeaderboard={() => { setLbFromWin(true); setLbOpen(true) }}
        onHome={() => { setWinShow(false); onBack() }}
      />

      <Leaderboard show={lbOpen} showNamePrompt={lbFromWin} onClose={() => setLbOpen(false)} />

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>
    </>
  )
}
