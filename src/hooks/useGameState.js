import { useState, useCallback, useRef } from 'react'
import {
  GRID, NUM_COLORS,
  get3x3, getNeighbors, isSolved, makeBoard, placePowerups,
  PU_DEFS, calcLiveMultiplier, PU_COLLECT_BONUS,
} from '../utils/game'
import { get5x5, getCross, getRow, getCol, ABILITY_EXECUTORS } from '../utils/abilities'

// ─────────────────────────────────────────────────────────────
//  useGameState
//
//  Strategy: ALL values that are read inside async flows or
//  stable callbacks are kept in refs so they're always current.
//  React state is used ONLY to trigger re-renders (tick) and for
//  the color-picker modal (cpOpen / cpTitle).
// ─────────────────────────────────────────────────────────────
export function useGameState({ character, onWin }) {
  // ── Re-render trigger ──────────────────────────────────────
  const [tick, setTick] = useState(0)
  const rerender = useCallback(() => setTick(t => t + 1), [])

  // ── Mutable game data ──────────────────────────────────────
  const G = useRef(makeInitialState())
  function g() { return G.current }

  // ── Ability / powerup targeting refs (always-current) ─────
  const pendingAbilityRef  = useRef(null)   // ability id being targeted
  const abilityFirstCellRef = useRef(null)  // first cell for 2-step abilities
  const activePowerupRef   = useRef(null)   // stored powerup being aimed

  // ── Color-picker (needs React state for modal open/close) ─
  const [cpOpen, setCpOpen]   = useState(false)
  const [cpTitle, setCpTitle] = useState('')
  const cpResolve             = useRef(null)

  // ── Character ref (stable, never changes mid-game) ────────
  const characterRef = useRef(character)
  characterRef.current = character

  // ── Helpers ───────────────────────────────────────────────
  function makeInitialAbilityState(char) {
    if (!char) return {}
    return Object.fromEntries(
      char.abilities.map(ab => [ab.id, { used: false, active: false, charges: null }])
    )
  }

  function makeInitialState() {
    return {
      board:        [],
      puOnBoard:    {},
      inventory:    [],
      clicks:       0,
      puCollected:  0,
      puUsed:       0,
      nextId:       0,
      flipping:     new Set(),
      hoveredIdx:   null,
      hint:         'Click cells to advance them and their neighbors',
      ghostActive:  false,      // VERA Ghost Protocol
      overclockLeft: 0,         // BYTE Overclock
      lastClickIdx:  null,      // KIRA Fork
      lastClickType: 'normal',  // KIRA Fork
      abilityState:  {},
    }
  }

  function triggerFlip(indices) {
    indices.forEach(i => g().flipping.add(i))
    rerender()
    setTimeout(() => {
      indices.forEach(i => g().flipping.delete(i))
      rerender()
    }, 260)
  }

  function checkAndCollectPowerups() {
    const { board, puOnBoard } = g()
    const toUnlock = Object.keys(puOnBoard)
      .map(Number)
      .filter(idx => {
        const nb = getNeighbors(idx)
        return nb.length && nb.every(n => board[n] === board[nb[0]])
      })
    toUnlock.forEach(idx => {
      const pu = puOnBoard[idx]
      g().inventory.push({ id: g().nextId++, type: pu.type, stampColor: pu.stampColor ?? null })
      g().puCollected++
      delete g().puOnBoard[idx]
      window.__cellsToast?.(`${PU_DEFS[pu.type].icon} ${PU_DEFS[pu.type].name} collected! +${PU_COLLECT_BONUS} pts`)
    })
  }

  function applyBoardMutation({ newBoard, affected }) {
    if (!newBoard) return
    g().board = newBoard
    triggerFlip(affected)
    checkAndCollectPowerups()
    if (isSolved(g().board)) {
      const snap = { clicks: g().clicks, puCollected: g().puCollected, puUsed: g().puUsed }
      setTimeout(() => onWin?.(snap), 300)
    }
  }

  // ── Init ──────────────────────────────────────────────────
  const initGame = useCallback((char) => {
    // Resolve any dangling picker promise
    if (cpResolve.current) { cpResolve.current(null); cpResolve.current = null }
    setCpOpen(false)

    // Clear all targeting refs
    pendingAbilityRef.current   = null
    abilityFirstCellRef.current = null
    activePowerupRef.current    = null

    G.current = {
      ...makeInitialState(),
      board:        makeBoard(),
      puOnBoard:    placePowerups(),
      abilityState: makeInitialAbilityState(char),
    }
    rerender()
  }, [rerender]) // eslint-disable-line

  // ── Color picker ──────────────────────────────────────────
  const pickColor = useCallback((title) => new Promise(resolve => {
    cpResolve.current = resolve
    setCpTitle(title)
    setCpOpen(true)
  }), [])

  const cpChoose = useCallback((color) => {
    setCpOpen(false)
    if (cpResolve.current) { cpResolve.current(color); cpResolve.current = null }
  }, [])

  const cpCancel = useCallback(() => {
    setCpOpen(false)
    if (cpResolve.current) { cpResolve.current(null); cpResolve.current = null }
  }, [])

  // ── Cell click ────────────────────────────────────────────
  const onCellClick = useCallback(async (idx) => {
    // Ability targeting mode
    if (pendingAbilityRef.current) {
      await handleAbilityTarget(idx)
      return
    }
    // Stored powerup targeting mode
    if (activePowerupRef.current) {
      await applyStoredPowerup(idx)
      return
    }
    // Normal click
    const isFree = g().ghostActive
    const is5x5  = g().overclockLeft > 0
    const area   = is5x5 ? get5x5(idx) : get3x3(idx)

    const newBoard = [...g().board]
    area.forEach(i => { newBoard[i] = (newBoard[i] + 1) % NUM_COLORS })

    if (!isFree) g().clicks++
    if (isFree)  g().ghostActive = false
    if (is5x5) {
      g().overclockLeft--
      // Update charges display
      const st = g().abilityState['overclock']
      if (st) st.charges = g().overclockLeft || null
    }

    g().lastClickIdx  = idx
    g().lastClickType = is5x5 ? '5x5' : 'normal'

    applyBoardMutation({ newBoard, affected: area })
  }, []) // eslint-disable-line — all reads go through refs/g()

  // ── Ability target handler ─────────────────────────────────
  async function handleAbilityTarget(idx) {
    const abilityId = pendingAbilityRef.current
    const char      = characterRef.current
    const ab        = char?.abilities.find(a => a.id === abilityId)
    if (!ab) return

    // Two-step: pick two separate cells
    if (ab.type === 'pick_two_cells') {
      if (abilityFirstCellRef.current === null) {
        abilityFirstCellRef.current = idx
        g().hint = 'Now click the second 3×3 region to swap with'
        rerender()
        return
      }
      const result = ABILITY_EXECUTORS[abilityId](g().board, {
        cornerA: abilityFirstCellRef.current, cornerB: idx,
      })
      finishAbility(abilityId, result)
      return
    }

    // Row + col combo (Vanish)
    if (ab.type === 'pick_row_col') {
      if (abilityFirstCellRef.current === null) {
        abilityFirstCellRef.current = idx
        g().hint = 'Now click a cell to choose the column'
        rerender()
        return
      }
      const rowIdx = Math.floor(abilityFirstCellRef.current / GRID)
      const colIdx = idx % GRID
      const result = ABILITY_EXECUTORS[abilityId](g().board, { rowIdx, colIdx })
      finishAbility(abilityId, result)
      return
    }

    // Cell + color picker
    if (ab.type === 'pick_cell_color') {
      const color = await pickColor(`Choose color for ${ab.name}`)
      if (color === null) { cancelAbility(); return }
      const result = ABILITY_EXECUTORS[abilityId](g().board, { cellIdx: idx, color })
      finishAbility(abilityId, result)
      return
    }

    // Row only
    if (ab.type === 'pick_row') {
      const result = ABILITY_EXECUTORS[abilityId](g().board, { rowIdx: Math.floor(idx / GRID) })
      finishAbility(abilityId, result)
      return
    }

    // Column only
    if (ab.type === 'pick_col') {
      const result = ABILITY_EXECUTORS[abilityId](g().board, { colIdx: idx % GRID })
      finishAbility(abilityId, result)
      return
    }

    // Single cell
    if (ab.type === 'pick_cell') {
      const result = ABILITY_EXECUTORS[abilityId](g().board, { cellIdx: idx })
      finishAbility(abilityId, result)
      return
    }
  }

  function finishAbility(abilityId, result) {
    g().abilityState = {
      ...g().abilityState,
      [abilityId]: { used: true, active: false, charges: null },
    }
    pendingAbilityRef.current   = null
    abilityFirstCellRef.current = null
    g().hint = 'Click cells to advance them and their neighbors'
    applyBoardMutation(result)
    rerender()
  }

  function cancelAbility() {
    const abilityId = pendingAbilityRef.current
    if (abilityId) {
      g().abilityState = {
        ...g().abilityState,
        [abilityId]: { ...g().abilityState[abilityId], active: false },
      }
    }
    pendingAbilityRef.current   = null
    abilityFirstCellRef.current = null
    g().hint = 'Click cells to advance them and their neighbors'
    rerender()
  }

  // ── Activate ability ───────────────────────────────────────
  const activateAbility = useCallback(async (abilityId) => {
    const char = characterRef.current
    const ab   = char?.abilities.find(a => a.id === abilityId)
    if (!ab || g().abilityState[abilityId]?.used) return

    // Toggle off
    if (pendingAbilityRef.current === abilityId) {
      cancelAbility()
      return
    }

    // Instant abilities
    if (ab.type === 'instant') {
      await handleInstantAbility(abilityId)
      return
    }

    // Two-color swap (Remix) — open picker twice before any grid targeting
    if (ab.type === 'pick_two_colors') {
      const colorA = await pickColor(`${ab.name}: Choose first color to swap`)
      if (colorA === null) return
      const colorB = await pickColor(`${ab.name}: Choose second color to swap with`)
      if (colorB === null) return
      const result = ABILITY_EXECUTORS[abilityId](g().board, { colorA, colorB })
      finishAbility(abilityId, result)
      return
    }

    // Enter grid-targeting mode
    g().abilityState = {
      ...g().abilityState,
      [abilityId]: { ...g().abilityState[abilityId], active: true },
    }
    pendingAbilityRef.current   = abilityId
    abilityFirstCellRef.current = null

    const hintMap = {
      pick_row:       `${ab.name}: Click any cell to choose its row`,
      pick_col:       `${ab.name}: Click any cell to choose its column`,
      pick_cell:      `${ab.name}: Click the target cell`,
      pick_cell_color:`${ab.name}: Click the target cell, then choose a color`,
      pick_two_cells: `${ab.name}: Click the first region`,
      pick_row_col:   `${ab.name}: Click a cell to pick its row`,
    }
    g().hint = '🎯 ' + (hintMap[ab.type] || `${ab.name}: Click a cell`)
    rerender()
  }, [pickColor]) // eslint-disable-line

  // ── Instant ability handler ────────────────────────────────
  async function handleInstantAbility(abilityId) {
    if (abilityId === 'ghost_protocol') {
      g().ghostActive = true
      g().abilityState = { ...g().abilityState, [abilityId]: { used: true, active: false, charges: null } }
      g().hint = '👻 Ghost Protocol — next click is FREE'
      window.__cellsToast?.('👻 Ghost Protocol active — next click is free!')
      rerender()
      return
    }

    if (abilityId === 'overclock') {
      g().overclockLeft = 3
      g().abilityState  = { ...g().abilityState, [abilityId]: { used: true, active: false, charges: 3 } }
      g().hint = '⚙️ Overclock active — next 3 clicks hit a 5×5 area!'
      window.__cellsToast?.('⚙️ Overclock active — 3 big clicks!')
      rerender()
      return
    }

    if (abilityId === 'exploit') {
      const allKeys = Object.keys(g().puOnBoard).map(Number)
      allKeys.forEach(idx => {
        const pu = g().puOnBoard[idx]
        g().inventory.push({ id: g().nextId++, type: pu.type, stampColor: pu.stampColor ?? null })
        g().puCollected++
        delete g().puOnBoard[idx]
      })
      g().abilityState = { ...g().abilityState, [abilityId]: { used: true, active: false, charges: null } }
      window.__cellsToast?.(`💥 Exploit! ${allKeys.length} powerup${allKeys.length !== 1 ? 's' : ''} collected!`)
      rerender()
      if (isSolved(g().board)) {
        const snap = { clicks: g().clicks, puCollected: g().puCollected, puUsed: g().puUsed }
        setTimeout(() => onWin?.(snap), 300)
      }
      return
    }

    if (abilityId === 'fork') {
      if (g().lastClickIdx === null) {
        window.__cellsToast?.('🍴 Fork needs a previous click to mirror!')
        return  // Don't mark as used — let player try again
      }
      const result = ABILITY_EXECUTORS.fork(g().board, {
        lastClickIdx:  g().lastClickIdx,
        lastClickType: g().lastClickType,
      })
      finishAbility(abilityId, result)
      return
    }

    // All other instant abilities (mirror, blackout, drop, flatline, trace)
    const result = ABILITY_EXECUTORS[abilityId](g().board)
    finishAbility(abilityId, result)
  }

  // ── Stored powerup system ─────────────────────────────────
  const toggleStoredPU = useCallback((id) => {
    if (activePowerupRef.current?.id === id) {
      activePowerupRef.current = null
    } else {
      const pu = g().inventory.find(p => p.id === id)
      activePowerupRef.current = pu ? { ...pu } : null
    }
    rerender()
  }, [rerender])

  const cancelStoredPU = useCallback(() => {
    activePowerupRef.current = null
    rerender()
  }, [rerender])

  async function applyStoredPowerup(idx) {
    const ap = activePowerupRef.current
    if (!ap) return
    const { id, type, stampColor } = ap

    let newBoard, area

    if (type === 'free_change') {
      const color = await pickColor('Choose fill color')
      if (color === null) return
      area = get3x3(idx)
      newBoard = [...g().board]
      area.forEach(i => { newBoard[i] = color })
    } else if (type === 'color_stamp') {
      area = get3x3(idx)
      newBoard = [...g().board]
      area.forEach(i => { newBoard[i] = stampColor })
    } else if (type === 'single_select') {
      const color = await pickColor('Choose cell color')
      if (color === null) return
      area = [idx]
      newBoard = [...g().board]
      newBoard[idx] = color
    } else {
      return
    }

    g().puUsed++
    g().inventory = g().inventory.filter(p => p.id !== id)
    activePowerupRef.current = null
    applyBoardMutation({ newBoard, affected: area })
    rerender()
  }

  // ── Hover / preview ───────────────────────────────────────
  const onCellHover = useCallback((idx) => { g().hoveredIdx = idx; rerender() }, [rerender])
  const onCellLeave = useCallback(() => { g().hoveredIdx = null; rerender() }, [rerender])

  // ── Derive preview cells for current render ────────────────
  const hIdx = g().hoveredIdx
  let previewCells = new Set()
  if (hIdx !== null) {
    const pending = pendingAbilityRef.current
    const stored  = activePowerupRef.current
    if (pending) {
      const ab = characterRef.current?.abilities.find(a => a.id === pending)
      if (ab) {
        if      (ab.type === 'pick_row')        previewCells = new Set(getRow(hIdx))
        else if (ab.type === 'pick_col')        previewCells = new Set(getCol(hIdx))
        else if (ab.type === 'pick_cell_color') {
          if      (pending === 'overwrite') previewCells = new Set(get5x5(hIdx))
          else if (pending === 'patch')     previewCells = new Set(getCross(hIdx))
          else                              previewCells = new Set([hIdx])
        }
        else previewCells = new Set([hIdx])
      }
    } else if (stored) {
      previewCells = new Set(stored.type === 'single_select' ? [hIdx] : get3x3(hIdx))
    } else {
      previewCells = new Set(g().overclockLeft > 0 ? get5x5(hIdx) : get3x3(hIdx))
    }
  }

  // ── Snapshot for render ───────────────────────────────────
  return {
    board:          g().board,
    puOnBoard:      g().puOnBoard,
    inventory:      g().inventory,
    clicks:         g().clicks,
    puCollected:    g().puCollected,
    puUsed:         g().puUsed,
    flipping:       g().flipping,
    previewCells,
    liveMultiplier: calcLiveMultiplier(g().clicks),
    hint:           g().hint,
    abilityState:   g().abilityState,
    // derived UI flags (from refs — current at render time)
    pendingAbility: pendingAbilityRef.current,
    activePowerup:  activePowerupRef.current,
    isTargeting:    !!(pendingAbilityRef.current || activePowerupRef.current),
    // color picker
    cpOpen, cpTitle, cpChoose, cpCancel,
    // actions
    initGame,
    onCellClick,
    onCellHover,
    onCellLeave,
    activateAbility,
    toggleStoredPU,
    cancelStoredPU,
  }
}
