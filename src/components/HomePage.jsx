export default function HomePage({ active, onPlay, onLeaderboard }) {
  return (
    <div className={`page${active ? '' : ' hidden'}`}>
      <div className="home-wrap">
        <div>
          <p className="home-subtitle">A cellular strategy game</p>
          <h1 className="home-title">Cells</h1>
        </div>

        <div className="divider" />

        <div className="home-buttons">
          <button className="mode-btn easy" onClick={() => onPlay('easy')}>
            <div className="mode-btn-border" />
            <div className="mode-btn-glow" />
            <div className="mode-btn-inner">
              <span className="mode-btn-label">Easy</span>
              <span className="mode-btn-desc">Relaxed pace</span>
            </div>
          </button>

          <button className="mode-btn normal" onClick={() => onPlay('normal')}>
            <div className="mode-btn-border" />
            <div className="mode-btn-glow" />
            <div className="mode-btn-inner">
              <span className="mode-btn-label">Normal</span>
              <span className="mode-btn-desc">Full challenge</span>
            </div>
          </button>
        </div>

        <button className="home-lb-btn" onClick={onLeaderboard}>
          🏆 Leaderboard
        </button>
      </div>
    </div>
  )
}
