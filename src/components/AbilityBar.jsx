export default function AbilityBar({ character, abilityState, onUse }) {
  if (!character) return null

  return (
    <div className="ability-bar">
      <div className="ability-bar-header">
        <span className="ability-bar-char" style={{ color: character.color }}>
          {character.portrait} {character.name}
        </span>
        <span className="ability-bar-label">Abilities</span>
      </div>

      <div className="ability-chips">
        {character.abilities.map((ab) => {
          const state = abilityState[ab.id] || {}
          const isActive  = state.active
          const isUsed    = state.used
          const chargesLeft = state.charges ?? null

          return (
            <button
              key={ab.id}
              className={[
                'ability-chip',
                isActive ? 'active' : '',
                isUsed ? 'used' : '',
              ].filter(Boolean).join(' ')}
              style={{
                '--ab-color': character.color,
                '--ab-glow':  character.color + '99',
                borderColor: isUsed ? 'var(--dim)' : character.color,
              }}
              onClick={() => !isUsed && onUse(ab.id)}
              disabled={isUsed}
              title={ab.desc}
            >
              <span className="ab-icon">{ab.icon}</span>
              <span className="ab-name" style={{ color: isUsed ? 'var(--dim)' : character.color }}>
                {ab.name}
              </span>
              {chargesLeft !== null && (
                <span className="ab-charges" style={{ color: character.color }}>
                  ×{chargesLeft}
                </span>
              )}
              {isUsed && <span className="ab-used-label">Used</span>}
              {isActive && <span className="ab-active-ring" style={{ borderColor: character.color }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
