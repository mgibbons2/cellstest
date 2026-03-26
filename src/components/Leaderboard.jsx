import { useState, useEffect } from 'react'
import { loadLB, saveLB, clearLB } from '../utils/game'

const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ show, showNamePrompt, onClose }) {
  const [entries, setEntries] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    if (show) setEntries(loadLB())
  }, [show])

  function handleSubmitName() {
    const val = name.trim()
    if (!val) return
    const lb = loadLB()
    const entry = lb.find(e => e.isNew)
    if (entry) { entry.name = val; saveLB(lb) }
    setName('')
    setEntries(loadLB())
  }

  function handleClear() {
    if (!window.confirm('Clear all scores?')) return
    clearLB()
    setEntries([])
  }

  function handleClose() {
    // Clear isNew flags on close
    const lb = loadLB()
    lb.forEach(e => { e.isNew = false })
    saveLB(lb)
    setEntries(lb)
    onClose()
  }

  const latestNew = entries.find(e => e.isNew)
  const shouldShowPrompt = showNamePrompt && latestNew && !latestNew.name

  return (
    <div className={`lb-overlay${show ? ' show' : ''}`}>
      <div className="lb-box">
        <div className="lb-title">🏆 Leaderboard</div>
        <div className="lb-subtitle">Easy Mode · Top 10</div>

        {shouldShowPrompt && (
          <div className="name-prompt">
            <input
              className="name-input"
              placeholder="Enter your name…"
              maxLength={16}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmitName()}
              autoFocus
            />
            <button className="name-submit" onClick={handleSubmitName}>Save</button>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="lb-empty">No scores yet — play a game!</div>
        ) : (
          <div>
            {entries.map((e, i) => {
              const rankLabel = i < 3 ? RANK_ICONS[i] : `#${i + 1}`
              const rankClass = i < 3 ? `r${i + 1}` : 'rn'
              const nameStr   = e.name || 'Anonymous'
              const nameClass = e.name ? '' : 'anon'
              const dateStr   = new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

              return (
                <div key={i} className={`lb-row${e.isNew ? ' new-entry' : ''}`}>
                  <span className={`lb-rank ${rankClass}`}>{rankLabel}</span>
                  <span className={`lb-name ${nameClass}`}>
                    {nameStr}
                    <span className="lb-date">{dateStr}</span>
                  </span>
                  <span className="lb-score">{e.total.toLocaleString()}</span>
                  <span className="lb-clicks">{e.clicks} clicks</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="lb-footer">
          <button className="lb-clear" onClick={handleClear}>Clear All</button>
          <button className="lb-close" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
