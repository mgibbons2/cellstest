import Cell from './Cell'

const GRID = 9

// Chebyshev distance (max of row/col diff) — gives the "ring" number
// ring 0 = clicked cell, ring 1 = immediate neighbors, ring 2 = outer neighbors
function chebyshevDist(idxA, idxB) {
  const rA = Math.floor(idxA / GRID), cA = idxA % GRID
  const rB = Math.floor(idxB / GRID), cB = idxB % GRID
  return Math.max(Math.abs(rA - rB), Math.abs(cA - cB))
}

export default function Grid({
  board, puOnBoard, flipping, previewCells,
  isTargeting, lastClickIdx,
  onCellClick, onCellHover, onCellLeave,
}) {
  return (
    <div className={`grid-container${isTargeting ? ' targeting' : ''}`}>
      <div className="grid">
        {board.map((color, idx) => {
          const isFlipping = flipping.has(idx)
          const delay = (isFlipping && lastClickIdx != null)
            ? chebyshevDist(idx, lastClickIdx)
            : 0

          return (
            <Cell
              key={idx}
              idx={idx}
              color={color}
              powerup={puOnBoard[idx] ?? null}
              isFlipping={isFlipping}
              flipDelay={delay}
              isPreview={previewCells.has(idx)}
              isTargeting={isTargeting}
              onClick={() => onCellClick(idx)}
              onMouseEnter={() => onCellHover(idx)}
              onMouseLeave={onCellLeave}
            />
          )
        })}
      </div>
    </div>
  )
}
