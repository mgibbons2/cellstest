import { GRID, NUM_COLORS, get3x3, getNeighbors } from './game'

// ── Helper: get 5×5 area ──────────────────────────────────────
export function get5x5(idx) {
  const row = Math.floor(idx / GRID)
  const col = idx % GRID
  const res = []
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = row + dr, c = col + dc
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) res.push(r * GRID + c)
    }
  }
  return res
}

// ── Helper: extended cross (cell + ortho 2 steps) ─────────────
export function getCross(idx) {
  const row = Math.floor(idx / GRID)
  const col = idx % GRID
  const res = new Set([idx])
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
  dirs.forEach(([dr, dc]) => {
    for (let step = 1; step <= 2; step++) {
      const r = row + dr * step, c = col + dc * step
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) res.add(r * GRID + c)
    }
  })
  return [...res]
}

// ── Helper: get full row indices ──────────────────────────────
export function getRow(idx) {
  const row = Math.floor(idx / GRID)
  return Array.from({ length: GRID }, (_, c) => row * GRID + c)
}

// ── Helper: get full column indices ──────────────────────────
export function getCol(idx) {
  const col = idx % GRID
  return Array.from({ length: GRID }, (_, r) => r * GRID + col)
}

// ── Helper: mirror index horizontally ────────────────────────
export function mirrorIdx(idx) {
  const row = Math.floor(idx / GRID)
  const col = idx % GRID
  return row * GRID + (GRID - 1 - col)
}

// ── Helper: color frequency map ──────────────────────────────
function colorFreqs(board) {
  const freq = Array(NUM_COLORS).fill(0)
  board.forEach(c => freq[c]++)
  return freq
}

// ─────────────────────────────────────────────────────────────
//  ABILITY EXECUTORS
//  Each function receives (board, params) and returns { newBoard, affected }
//  board is the current board array (will be copied internally)
// ─────────────────────────────────────────────────────────────

// VERA ────────────────────────────────────────────────────────

/** Jack In: advance every cell in picked row by +1 */
export function abilityJackIn(board, { rowIdx }) {
  const newBoard = [...board]
  const cells = getRow(rowIdx)
  cells.forEach(i => { newBoard[i] = (newBoard[i] + 1) % NUM_COLORS })
  return { newBoard, affected: cells }
}

/** Ghost Protocol: handled in hook — marks next click as free */
export function abilityGhostProtocol() {
  return { newBoard: null, affected: [] } // marker — logic in hook
}

/** Cascade: advance cell + ortho neighbors + their ortho neighbors */
export function abilityCascade(board, { cellIdx }) {
  const newBoard = [...board]
  const visited = new Set()

  function advance(idx) {
    if (visited.has(idx)) return
    visited.add(idx)
    newBoard[idx] = (newBoard[idx] + 1) % NUM_COLORS
  }

  // Wave 1: center + ortho neighbors
  const wave1 = [cellIdx, ...getNeighbors(cellIdx).filter(n => {
    const crow = Math.floor(cellIdx / GRID), ccol = cellIdx % GRID
    const nrow = Math.floor(n / GRID), ncol = n % GRID
    return Math.abs(crow - nrow) + Math.abs(ccol - ncol) === 1 // ortho only
  })]
  wave1.forEach(advance)

  // Wave 2: ortho neighbors of wave1 (excluding already visited)
  wave1.forEach(w1 => {
    const row = Math.floor(w1 / GRID), col = w1 % GRID
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
    dirs.forEach(([dr, dc]) => {
      const r = row + dr, c = col + dc
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) {
        advance(r * GRID + c)
      }
    })
  })

  return { newBoard, affected: [...visited] }
}

// LYRA ────────────────────────────────────────────────────────

/** Precision Strike: set one cell to chosen color */
export function abilityPrecisionStrike(board, { cellIdx, color }) {
  const newBoard = [...board]
  newBoard[cellIdx] = color
  return { newBoard, affected: [cellIdx] }
}

/** Mirror: flip board left↔right */
export function abilityMirror(board) {
  const newBoard = [...board]
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < Math.floor(GRID / 2); c++) {
      const a = r * GRID + c
      const b = r * GRID + (GRID - 1 - c)
      ;[newBoard[a], newBoard[b]] = [newBoard[b], newBoard[a]]
    }
  }
  return { newBoard, affected: newBoard.map((_, i) => i) }
}

/** Blackout: most-common color → least-common color */
export function abilityBlackout(board) {
  const freq = colorFreqs(board)
  const most = freq.reduce((a, _, i) => freq[i] > freq[a] ? i : a, 0)
  const nonzero = freq.map((f, i) => f > 0 ? i : -1).filter(i => i >= 0)
  const least = nonzero.reduce((a, b) => freq[a] < freq[b] ? a : b)
  if (most === least) return { newBoard: [...board], affected: [] }
  const newBoard = board.map(c => c === most ? least : c)
  const affected = board.map((c, i) => c === most ? i : -1).filter(i => i >= 0)
  return { newBoard, affected }
}

// NEON ────────────────────────────────────────────────────────

/** The Drop: advance every cell by +1 */
export function abilityDrop(board) {
  const newBoard = board.map(c => (c + 1) % NUM_COLORS)
  return { newBoard, affected: newBoard.map((_, i) => i) }
}

/** Frequency: advance every cell in picked column by +1 */
export function abilityFrequency(board, { colIdx }) {
  const newBoard = [...board]
  const cells = getCol(colIdx)
  cells.forEach(i => { newBoard[i] = (newBoard[i] + 1) % NUM_COLORS })
  return { newBoard, affected: cells }
}

/** Remix: swap two chosen color groups */
export function abilityRemix(board, { colorA, colorB }) {
  if (colorA === colorB) return { newBoard: [...board], affected: [] }
  const newBoard = board.map(c => {
    if (c === colorA) return colorB
    if (c === colorB) return colorA
    return c
  })
  const affected = board.map((c, i) => (c === colorA || c === colorB) ? i : -1).filter(i => i >= 0)
  return { newBoard, affected }
}

// BYTE ────────────────────────────────────────────────────────

/** Patch: set cross-shaped area to chosen color */
export function abilityPatch(board, { cellIdx, color }) {
  const newBoard = [...board]
  const cells = getCross(cellIdx)
  cells.forEach(i => { newBoard[i] = color })
  return { newBoard, affected: cells }
}

/** Overclock: handled in hook — marks next 3 clicks as 5×5 */
export function abilityOverclock() {
  return { newBoard: null, affected: [] } // marker — logic in hook
}

/** Flatline: least-common color → most-common color */
export function abilityFlatline(board) {
  const freq = colorFreqs(board)
  const most  = freq.indexOf(Math.max(...freq))
  const nonzero = freq.map((f, i) => f > 0 ? i : -1).filter(i => i >= 0)
  const least = nonzero.reduce((a, b) => freq[a] < freq[b] ? a : b)
  if (most === least) return { newBoard: [...board], affected: [] }
  const newBoard = board.map(c => c === least ? most : c)
  const affected = board.map((c, i) => c === least ? i : -1).filter(i => i >= 0)
  return { newBoard, affected }
}

// SILK ────────────────────────────────────────────────────────

/** Vanish: row + column all become the color of the intersection cell */
export function abilityVanish(board, { rowIdx, colIdx }) {
  const intersect = rowIdx * GRID + colIdx
  const color = board[intersect]
  const newBoard = [...board]
  const rowCells = getRow(intersect)
  const colCells = getCol(intersect)
  const affected = [...new Set([...rowCells, ...colCells])]
  affected.forEach(i => { newBoard[i] = color })
  return { newBoard, affected }
}

/** Phase Shift: swap two 3×3 regions (by their top-left corners) */
export function abilityPhaseShift(board, { cornerA, cornerB }) {
  const newBoard = [...board]

  function get3x3fromCorner(corner) {
    const row = Math.floor(corner / GRID)
    const col = corner % GRID
    const cells = []
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        const r = row + dr, c = col + dc
        if (r < GRID && c < GRID) cells.push(r * GRID + c)
      }
    }
    return cells
  }

  const cellsA = get3x3fromCorner(cornerA)
  const cellsB = get3x3fromCorner(cornerB)
  const len = Math.min(cellsA.length, cellsB.length)

  for (let i = 0; i < len; i++) {
    ;[newBoard[cellsA[i]], newBoard[cellsB[i]]] = [newBoard[cellsB[i]], newBoard[cellsA[i]]]
  }

  return { newBoard, affected: [...cellsA, ...cellsB] }
}

/** Trace: advance the bottom-right 3×3 quadrant by +1 */
export function abilityTrace(board) {
  const newBoard = [...board]
  // Bottom-right 3×3: rows 6-8, cols 6-8
  const cells = []
  for (let r = 6; r < GRID; r++) {
    for (let c = 6; c < GRID; c++) {
      cells.push(r * GRID + c)
    }
  }
  cells.forEach(i => { newBoard[i] = (newBoard[i] + 1) % NUM_COLORS })
  return { newBoard, affected: cells }
}

// KIRA ────────────────────────────────────────────────────────

/** Exploit: collect all powerups on board — handled in hook */
export function abilityExploit() {
  return { newBoard: null, affected: [] } // marker — logic in hook
}

/** Overwrite: paint 5×5 area with chosen color */
export function abilityOverwrite(board, { cellIdx, color }) {
  const newBoard = [...board]
  const cells = get5x5(cellIdx)
  cells.forEach(i => { newBoard[i] = color })
  return { newBoard, affected: cells }
}

/** Fork: repeat last click effect at its horizontal mirror position */
export function abilityFork(board, { lastClickIdx, lastClickType }) {
  // Mirror the index
  const mirIdx = mirrorIdx(lastClickIdx)
  if (lastClickType === '5x5') {
    const newBoard = [...board]
    const cells = get5x5(mirIdx)
    cells.forEach(i => { newBoard[i] = (newBoard[i] + 1) % NUM_COLORS })
    return { newBoard, affected: cells }
  }
  // Default: normal 3×3 advance
  const newBoard = [...board]
  const cells = get3x3(mirIdx)
  cells.forEach(i => { newBoard[i] = (newBoard[i] + 1) % NUM_COLORS })
  return { newBoard, affected: cells }
}

// ─────────────────────────────────────────────────────────────
//  DISPATCH TABLE  — maps ability id → executor function
// ─────────────────────────────────────────────────────────────
export const ABILITY_EXECUTORS = {
  jack_in:          abilityJackIn,
  ghost_protocol:   abilityGhostProtocol,
  cascade:          abilityCascade,
  precision_strike: abilityPrecisionStrike,
  mirror:           abilityMirror,
  blackout:         abilityBlackout,
  drop:             abilityDrop,
  frequency:        abilityFrequency,
  remix:            abilityRemix,
  patch:            abilityPatch,
  overclock:        abilityOverclock,
  flatline:         abilityFlatline,
  vanish:           abilityVanish,
  phase_shift:      abilityPhaseShift,
  trace:            abilityTrace,
  exploit:          abilityExploit,
  overwrite:        abilityOverwrite,
  fork:             abilityFork,
}
