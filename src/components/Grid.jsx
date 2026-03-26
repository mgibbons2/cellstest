import Cell from './Cell'

export default function Grid({ board, puOnBoard, flipping, previewCells, isTargeting, onCellClick, onCellHover, onCellLeave }) {
  return (
    <div className={`grid-container${isTargeting ? ' targeting' : ''}`}>
      <div className="grid">
        {board.map((color, idx) => (
          <Cell
            key={idx}
            idx={idx}
            color={color}
            powerup={puOnBoard[idx] ?? null}
            isFlipping={flipping.has(idx)}
            isPreview={previewCells.has(idx)}
            isTargeting={isTargeting}
            onClick={() => onCellClick(idx)}
            onMouseEnter={() => onCellHover(idx)}
            onMouseLeave={onCellLeave}
          />
        ))}
      </div>
    </div>
  )
}
