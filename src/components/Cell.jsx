import { PU_DEFS } from '../utils/game'

export default function Cell({ idx, color, powerup, isFlipping, isPreview, isTargeting, onClick, onMouseEnter, onMouseLeave }) {
  const classes = [
    'cell',
    powerup ? 'has-powerup' : '',
    isFlipping ? 'flip' : '',
    isPreview ? 'preview-target' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      data-color={color}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {powerup && (
        <span className="pu-badge">{PU_DEFS[powerup.type].icon}</span>
      )}
    </div>
  )
}
