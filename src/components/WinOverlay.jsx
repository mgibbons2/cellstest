import { SCORE_PAR, PU_COLLECT_BONUS, PU_USE_COST } from '../utils/game'

export default function WinOverlay({ show, score, isNewBest, onRestart, onLeaderboard, onHome }) {
  if (!score) return null

  return (
    <div className={`win-overlay${show ? ' show' : ''}`}>
      <div className="win-title">Board Solved!</div>

      <div className={`new-best-badge${isNewBest ? ' show' : ''}`}>
        ★ New High Score ★
      </div>

      <div className="score-card">
        <div className="score-row">
          <span className="score-row-label">Base Score</span>
          <span className="score-row-val pos">{score.clickScore.toLocaleString()}</span>
        </div>
        <div className="score-row">
          <span className="score-row-label">Click Multiplier</span>
          <span className="score-row-val mult">
            ×{score.mult.toFixed(2)}{' '}
            <small>(par {SCORE_PAR} clicks · you used {score.clicks})</small>
          </span>
        </div>
        <div className="score-row">
          <span className="score-row-label">Powerups Collected</span>
          <span className="score-row-val pos">
            +{score.puBonus.toLocaleString()}{' '}
            <small>({score.puCollected} × {PU_COLLECT_BONUS})</small>
          </span>
        </div>
        <div className="score-row">
          <span className="score-row-label">Powerups Used</span>
          <span className={`score-row-val ${score.puPenalty ? 'neg' : 'pos'}`}>
            {score.puPenalty ? `−${score.puPenalty.toLocaleString()}` : '0'}{' '}
            <small>({score.puUsed} × {PU_USE_COST})</small>
          </span>
        </div>
        <div className="score-divider" />
        <div className="score-row">
          <span className="score-row-label" style={{ color: 'var(--text)', fontSize: '0.75rem', letterSpacing: '0.2em' }}>
            Final Score
          </span>
          <span className="score-row-val big">{score.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="win-btns">
        <button className="win-btn primary" onClick={onRestart}>Play Again</button>
        <button className="win-btn lb-btn" onClick={onLeaderboard}>🏆 Scores</button>
        <button className="win-btn secondary" onClick={onHome}>Home</button>
      </div>
    </div>
  )
}
