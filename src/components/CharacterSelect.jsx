import { useState } from 'react'
import { CHARACTERS } from '../utils/characters'

export default function CharacterSelect({ onSelect, onBack }) {
  const [active, setActive] = useState(CHARACTERS[0])
  const [chosen, setChosen] = useState(null)

  // On touch devices (coarse pointer = finger), hover preview is disabled.
  // We only use click/tap to both preview AND select.
  const isTouch = window.matchMedia('(pointer: coarse)').matches

  function handleCardInteract(char) {
    // On touch: first tap previews, second tap on same char confirms
    // On mouse: click always selects
    if (isTouch) {
      if (active?.id === char.id) {
        // Already previewing this one — confirm it
        setChosen(char)
      } else {
        // First tap — just preview
        setActive(char)
      }
    } else {
      setActive(char)
      setChosen(char)
    }
  }

  function handleMouseEnter(char) {
    if (isTouch) return
    setActive(char)
  }

  function handleMouseLeave() {
    if (isTouch) return
    setActive(chosen ?? CHARACTERS[0])
  }

  function handleConfirm() {
    if (chosen) onSelect(chosen)
  }

  const display = active

  return (
    <div className="cs-root">

      {/* ── Mobile top bar ── */}
      <div className="cs-topbar">
        <button className="cs-back" onClick={onBack}>← Back</button>
        <span className="cs-roster-label">Select Operative</span>
      </div>

      {/* ── Mobile: horizontal chip strip ── */}
      <div className="cs-chips-wrap">
        <div className="cs-chips">
          {CHARACTERS.map(char => (
            <button
              key={char.id}
              className={[
                'cs-chip',
                active?.id === char.id ? 'active' : '',
                chosen?.id === char.id ? 'chosen-chip' : '',
              ].filter(Boolean).join(' ')}
              style={{ '--char-color': char.color, '--char-bg': char.accentBg }}
              onClick={() => handleCardInteract(char)}
            >
              <span className="cs-chip-portrait">{char.portrait}</span>
              <span className="cs-chip-name" style={{ color: char.color }}>{char.name}</span>
              {chosen?.id === char.id && (
                <span className="cs-chip-check" style={{ color: char.color }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop: sidebar roster ── */}
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
              onMouseEnter={() => handleMouseEnter(char)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCardInteract(char)}
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

      {/* ── Detail panel ── */}
      <div
        className="cs-detail"
        style={{ '--char-color': display.color, '--char-bg': display.accentBg }}
      >
        <div className="cs-glow-blob" style={{ background: display.color }} />

        <div className="cs-detail-inner">

          <div className="cs-portrait-wrap">
            <div className="cs-portrait-ring" style={{ borderColor: display.color }}>
              <span className="cs-portrait-emoji">{display.portrait}</span>
            </div>
          </div>

          <div className="cs-detail-name" style={{ color: display.color }}>{display.name}</div>
          <div className="cs-detail-title">{display.title}</div>
          <div className="cs-detail-pronouns">{display.pronouns}</div>

          <div className="cs-tagline">
            <span className="cs-tagline-quote">{display.tagline}</span>
          </div>

          <p className="cs-lore">{display.lore}</p>

          <div className="cs-ability-divider"><span>ABILITIES</span></div>

          <div className="cs-abilities">
            {display.abilities.map((ab, i) => (
              <div key={ab.id} className="cs-ability">
                <div className="cs-ability-header">
                  <span className="cs-ability-num" style={{ color: display.color }}>0{i + 1}</span>
                  <span className="cs-ability-icon">{ab.icon}</span>
                  <span className="cs-ability-name" style={{ color: display.color }}>{ab.name}</span>
                </div>
                <p className="cs-ability-desc">{ab.desc}</p>
              </div>
            ))}
          </div>

          {/* On touch: show tap hint if previewing but not yet confirmed */}
          {isTouch && active && !chosen && (
            <p className="cs-tap-hint" style={{ color: display.color }}>
              Tap again to select {display.name}
            </p>
          )}
          {isTouch && active && chosen?.id !== active.id && (
            <p className="cs-tap-hint" style={{ color: display.color }}>
              Tap again to select {display.name}
            </p>
          )}

          <button
            className={`cs-confirm ${chosen ? 'ready' : ''}`}
            style={chosen ? { borderColor: display.color, color: display.color } : {}}
            onClick={handleConfirm}
            disabled={!chosen}
          >
            {chosen ? `Deploy ${chosen.name} →` : 'Tap a character to preview'}
          </button>

        </div>
      </div>

    </div>
  )
}
