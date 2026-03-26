// ── Grid helpers ──────────────────────────────────────────────
export const GRID = 9
export const NUM_COLORS = 3
export const NUM_POWERUPS = 10

export function get3x3(idx) {
  const row = Math.floor(idx / GRID)
  const col = idx % GRID
  const res = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr, c = col + dc
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) res.push(r * GRID + c)
    }
  }
  return res
}

export function getNeighbors(idx) {
  const row = Math.floor(idx / GRID)
  const col = idx % GRID
  const res = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue
      const r = row + dr, c = col + dc
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) res.push(r * GRID + c)
    }
  }
  return res
}

export function isSolved(board) {
  return board.every(c => c === board[0])
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function makeBoard() {
  let board
  do {
    board = Array.from({ length: GRID * GRID }, () => Math.floor(Math.random() * NUM_COLORS))
  } while (isSolved(board))
  return board
}

export function placePowerups() {
  const allIdx = shuffle(Array.from({ length: GRID * GRID }, (_, i) => i)).slice(0, NUM_POWERUPS)
  const puOnBoard = {}
  allIdx.forEach(idx => {
    const type = PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)]
    const stampColor = type === 'color_stamp' ? Math.floor(Math.random() * NUM_COLORS) : null
    puOnBoard[idx] = { type, stampColor }
  })
  return puOnBoard
}

// ── Powerup definitions ───────────────────────────────────────
export const PU_TYPES = ['free_change', 'color_stamp', 'single_select']

export const PU_DEFS = {
  free_change:   { icon: '🎨', name: 'Free Change',   color: '#a0e4ff', glow: 'rgba(160,228,255,.6)' },
  color_stamp:   { icon: '🖌️', name: 'Color Stamp',   color: '#ffdd88', glow: 'rgba(255,220,100,.6)' },
  single_select: { icon: '✦',  name: 'Single Select', color: '#c8a0ff', glow: 'rgba(200,160,255,.6)' },
}

export const STAMP_COLORS = ['#00ffe0', '#b94fff', '#ff6b35']

// ── Scoring constants ─────────────────────────────────────────
export const SCORE_BASE         = 10000
export const SCORE_PAR          = 30
export const SCORE_MIN_MULT     = 0.2
export const PU_COLLECT_BONUS   = 800
export const PU_USE_COST        = 300

export function calcScore({ clicks, puCollected, puUsed }) {
  const mult       = Math.max(SCORE_MIN_MULT, SCORE_PAR / clicks)
  const clickScore = Math.round(SCORE_BASE * mult)
  const puBonus    = puCollected * PU_COLLECT_BONUS
  const puPenalty  = puUsed * PU_USE_COST
  const total      = Math.max(0, clickScore + puBonus - puPenalty)
  return { mult, clickScore, puBonus, puPenalty, total, clicks, puCollected, puUsed }
}

export function calcLiveMultiplier(clicks) {
  if (clicks === 0) return SCORE_PAR
  return Math.max(SCORE_MIN_MULT, SCORE_PAR / clicks)
}

// ── Leaderboard (localStorage) ────────────────────────────────
const LB_KEY = 'cells_easy_lb'
const LB_MAX = 10

export function loadLB() {
  try { return JSON.parse(localStorage.getItem(LB_KEY)) || [] } catch { return [] }
}
export function saveLB(data) {
  try { localStorage.setItem(LB_KEY, JSON.stringify(data)) } catch {}
}

export function isNewBest(total) {
  const lb = loadLB()
  return lb.length === 0 || total > lb[0].total
}

export function saveScore(scoreObj, name) {
  const lb = loadLB()
  const entry = {
    total: scoreObj.total,
    clicks: scoreObj.clicks,
    puCollected: scoreObj.puCollected,
    puUsed: scoreObj.puUsed,
    mult: scoreObj.mult,
    name: name || '',
    date: Date.now(),
    isNew: true,
  }
  lb.push(entry)
  lb.sort((a, b) => b.total - a.total)
  lb.forEach((e, i) => { if (i > 0) e.isNew = false })
  const trimmed = lb.slice(0, LB_MAX)
  saveLB(trimmed)
  return trimmed
}

export function clearLB() {
  saveLB([])
}
