import { useState } from 'react'
import { CHARACTERS } from '../utils/characters'

export default function CharacterSelect({ onSelect, onBack }) {
  const [hovered, setHovered] = useState(null)
  const [chosen, setChosen]   = useState(null)

  const active = hovered ?? chosen ?? CHARACTERS[0]

  function handleConfirm() {
    if (chosen) onSelect(chosen)
  }

  return (
    <div className="cs-root">
      {/* ── Left panel: character roster ── */}
      <div className="cs-roster">
        <div className="cs-roster-header">
          <button className="cs-back" onClick={onBack}>← Back</button>
          <span className="cs-roster-label">Select Operative</span>
        </div>

        <div className="cs-cards">
          {CHARACTERS.map(char => (
            <button
              key={char.id}
              className={`cs-card ${chosen?.id === char.id ? 'chosen' : ''}`}
              style={{ '--char-color': char.color, '--char-bg': char.accentBg }}
              onMouseEnter={() => setHovered(char)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setChosen(char)}
            >
              <span className="cs-card-portrait">{char.portrait}</span>
              <div className="cs-card-info">
                <span className="cs-card-name" style={{ color: char.color }}>{char.name}</span>
                <span className="cs-card-title">{char.title}</span>
              </div>
              {chosen?.id === char.id && <span className="cs-card-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right panel: character detail ── */}
      <div className="cs-detail" style={{ '--char-color': active.color, '--char-bg': active.accentBg }}>
        {/* Decorative glow blob */}
        <div className="cs-glow-blob" style={{ background: active.color }} />

        <div className="cs-detail-inner">
          {/* Portrait + name */}
          <div className="cs-portrait-wrap">
            <div className="cs-portrait-ring" style={{ borderColor: active.color }}>
              <span className="cs-portrait-emoji">{active.portrait}</span>
            </div>
          </div>

          <div className="cs-detail-name" style={{ color: active.color }}>{active.name}</div>
          <div className="cs-detail-title">{active.title}</div>
          <div className="cs-detail-pronouns">{active.pronouns}</div>

          <div className="cs-tagline">
            <span className="cs-tagline-quote">{active.tagline}</span>
          </div>

          <p className="cs-lore">{active.lore}</p>

          {/* Divider */}
          <div className="cs-ability-divider">
            <span>ABILITIES</span>
          </div>

          {/* Abilities */}
          <div className="cs-abilities">
            {active.abilities.map((ab, i) => (
              <div key={ab.id} className="cs-ability">
                <div className="cs-ability-header">
                  <span className="cs-ability-num" style={{ color: active.color }}>0{i + 1}</span>
                  <span className="cs-ability-icon">{ab.icon}</span>
                  <span className="cs-ability-name" style={{ color: active.color }}>{ab.name}</span>
                </div>
                <p className="cs-ability-desc">{ab.desc}</p>
              </div>
            ))}
          </div>

          {/* Confirm button */}
          <button
            className={`cs-confirm ${chosen ? 'ready' : ''}`}
            style={chosen ? { borderColor: active.color, color: active.color } : {}}
            onClick={handleConfirm}
            disabled={!chosen}
          >
            {chosen
              ? `Deploy ${chosen.name} →`
              : 'Choose an Operative'}
          </button>
        </div>
      </div>
    </div>
  )
}
