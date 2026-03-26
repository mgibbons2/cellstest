import { PU_DEFS } from '../utils/game'

export default function Cell({
  color, powerup, isFlipping, flipDelay = 0,
  isPreview, onClick, onMouseEnter, onMouseLeave,
}) {
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
      data-flip-delay={isFlipping ? Math.min(flipDelay, 3) : 0}
      style={isFlipping ? { animationDelay: `${flipDelay * 35}ms` } : undefined}
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
