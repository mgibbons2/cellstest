import { PU_DEFS, STAMP_COLORS } from '../utils/game'

export default function PowerupBar({ inventory, activePU, hint, onToggle, onCancel }) {
  return (
    <div className="powerup-section">
      <div className="pu-section-header">
        <span className="pu-section-label">⚡ Powerups</span>
        <span className="pu-hint-text">{hint}</span>
      </div>

      <div className="powerup-bar">
        {inventory.length === 0 ? (
          <span className="pb-empty">None collected yet</span>
        ) : (
          <>
            {inventory.map(pu => {
              const def = PU_DEFS[pu.type]
              const isActive = activePU?.id === pu.id
              return (
                <div
                  key={pu.id}
                  className={`pu-chip${isActive ? ' active' : ''}`}
                  style={{
                    borderColor: def.color,
                    '--pu-glow': def.glow,
                  }}
                  onClick={() => onToggle(pu.id)}
                >
                  <span className="pu-icon">{def.icon}</span>
                  <span className="pu-name" style={{ color: def.color }}>
                    {def.name}
                  </span>
                  {pu.type === 'color_stamp' && (
                    <div
                      className="pu-swatch"
                      style={{ background: STAMP_COLORS[pu.stampColor] }}
                    />
                  )}
                </div>
              )
            })}

            {activePU && (
              <button className="pu-cancel-btn" onClick={onCancel}>
                ✕ Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
