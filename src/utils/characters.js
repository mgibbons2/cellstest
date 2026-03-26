// ─────────────────────────────────────────────────────────────
//  CHARACTER DEFINITIONS
//  Each character has:
//    id, name, title, pronouns, color (hex accent), gradient (CSS),
//    tagline, lore (short flavour), portrait (emoji placeholder),
//    abilities[3]: { id, name, icon, desc, type }
//
//  Ability types:
//    'instant'   — fires immediately, no targeting needed
//    'pick_cell' — player clicks one cell after activating
//    'pick_row'  — player clicks any cell to select its row
//    'pick_col'  — player clicks any cell to select its column
//    'pick_color'— opens color picker, then applies
//    'pick_cell_color' — player picks a cell, then a color
//    'pick_two_cells'  — player picks two cells sequentially
//    'pick_row_col'    — picks a row then a column
// ─────────────────────────────────────────────────────────────

export const CHARACTERS = [
  {
    id: 'vera',
    name: 'VΞRA',
    title: 'Street Hacker',
    pronouns: 'she/her',
    color: '#00ffe0',
    gradient: 'linear-gradient(135deg, #00ffe0 0%, #0099bb 100%)',
    tagline: '"The grid bends for those who speak its language."',
    lore: 'Ex-Arasaka netrunner. Jacks into systems others can\'t even see. Runs the Undercity\'s black-market data bazaar between heists.',
    portrait: '🤖',
    accentBg: 'rgba(0,255,224,0.08)',
    abilities: [
      {
        id: 'jack_in',
        name: 'Jack In',
        icon: '⚡',
        desc: 'Advance every cell in a chosen row by one color.',
        type: 'pick_row',
        cooldown: 0,
      },
      {
        id: 'ghost_protocol',
        name: 'Ghost Protocol',
        icon: '👻',
        desc: 'Your next click is free — it doesn\'t add to your click count.',
        type: 'instant',
        cooldown: 0,
      },
      {
        id: 'cascade',
        name: 'Cascade',
        icon: '🌊',
        desc: 'Advance a chosen cell and all orthogonal neighbors, then advance each of those cells\' orthogonal neighbors too (2-step chain, no diagonals).',
        type: 'pick_cell',
        cooldown: 0,
      },
    ],
  },

  {
    id: 'lyra',
    name: 'LYRA-7',
    title: 'Corpo Assassin',
    pronouns: 'she/they',
    color: '#ff4da6',
    gradient: 'linear-gradient(135deg, #ff4da6 0%, #8b0057 100%)',
    tagline: '"Clean work. No witnesses. No loose cells."',
    lore: 'Bioengineered for precision. Her neural implants process board states 40× faster than baseline human. Works for whoever pays in hard crypto.',
    portrait: '🗡️',
    accentBg: 'rgba(255,77,166,0.08)',
    abilities: [
      {
        id: 'precision_strike',
        name: 'Precision Strike',
        icon: '🎯',
        desc: 'Change any single cell to any color of your choice.',
        type: 'pick_cell_color',
        cooldown: 0,
      },
      {
        id: 'mirror',
        name: 'Mirror',
        icon: '🪞',
        desc: 'Flip the entire board horizontally — left column swaps with right.',
        type: 'instant',
        cooldown: 0,
      },
      {
        id: 'blackout',
        name: 'Blackout',
        icon: '🌑',
        desc: 'Convert all cells matching the most common color to the least common color.',
        type: 'instant',
        cooldown: 0,
      },
    ],
  },

  {
    id: 'neon',
    name: 'NΞON',
    title: 'Frequency DJ',
    pronouns: 'they/them',
    color: '#b94fff',
    gradient: 'linear-gradient(135deg, #d97aff 0%, #7b1fcc 100%)',
    tagline: '"Every board has a beat. I just find the drop."',
    lore: 'Plays underground raves in the sub-basement districts. Their music is illegal in 6 corporate sectors. The crowd is always worth it.',
    portrait: '🎵',
    accentBg: 'rgba(185,79,255,0.08)',
    abilities: [
      {
        id: 'drop',
        name: 'The Drop',
        icon: '🔊',
        desc: 'Advance every cell on the entire board by one color simultaneously.',
        type: 'instant',
        cooldown: 0,
      },
      {
        id: 'frequency',
        name: 'Frequency',
        icon: '📡',
        desc: 'Advance every cell in a chosen column by one color.',
        type: 'pick_col',
        cooldown: 0,
      },
      {
        id: 'remix',
        name: 'Remix',
        icon: '🔄',
        desc: 'Swap two color groups: all cells of color A become color B, and vice versa. You choose both colors.',
        type: 'pick_two_colors',
        cooldown: 0,
      },
    ],
  },

  {
    id: 'byte',
    name: 'BYTΞ',
    title: 'Street Surgeon',
    pronouns: 'he/him',
    color: '#ff6b35',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #8b2200 100%)',
    tagline: '"I don\'t fix problems. I cut them out."',
    lore: 'Field medic turned fixer. Carries a full surgical suite in a courier bag. Patches up runners between jobs — and buries those who cross him.',
    portrait: '🔬',
    accentBg: 'rgba(255,107,53,0.08)',
    abilities: [
      {
        id: 'patch',
        name: 'Patch',
        icon: '➕',
        desc: 'Change a cross-shaped area (chosen cell + 4 orthogonal cells extending 2 steps) to any color.',
        type: 'pick_cell_color',
        cooldown: 0,
      },
      {
        id: 'overclock',
        name: 'Overclock',
        icon: '⚙️',
        desc: 'Your next 3 clicks each affect a 5×5 area instead of the usual 3×3.',
        type: 'instant',
        cooldown: 0,
      },
      {
        id: 'flatline',
        name: 'Flatline',
        icon: '📉',
        desc: 'Convert all cells of the least common color to the most common color.',
        type: 'instant',
        cooldown: 0,
      },
    ],
  },

  {
    id: 'silk',
    name: 'SILK',
    title: 'Ghost Courier',
    pronouns: 'she/her',
    color: '#88ffcc',
    gradient: 'linear-gradient(135deg, #88ffcc 0%, #009966 100%)',
    tagline: '"You never see me coming. That\'s the point."',
    lore: 'Delivers anything, anywhere, no questions asked. Her stealth mods are military grade. She\'s been declared dead three times.',
    portrait: '🌿',
    accentBg: 'rgba(136,255,204,0.08)',
    abilities: [
      {
        id: 'vanish',
        name: 'Vanish',
        icon: '💨',
        desc: 'Choose a row and a column — all cells in both the row AND the column become the same color (the color of the chosen intersection cell).',
        type: 'pick_row_col',
        cooldown: 0,
      },
      {
        id: 'phase_shift',
        name: 'Phase Shift',
        icon: '🔀',
        desc: 'Swap the contents of two 3×3 quadrant regions. Choose the top-left corner of each.',
        type: 'pick_two_cells',
        cooldown: 0,
      },
      {
        id: 'trace',
        name: 'Trace',
        icon: '🔍',
        desc: 'Advance the entire bottom-right 3×3 quadrant by one color (a useful structural nudge).',
        type: 'instant',
        cooldown: 0,
      },
    ],
  },

  {
    id: 'kira',
    name: 'KIRA',
    title: 'Netrunner',
    pronouns: 'any',
    color: '#ffd700',
    gradient: 'linear-gradient(135deg, #ffd700 0%, #cc8800 100%)',
    tagline: '"I don\'t hack the system. I am the system."',
    lore: 'Legendary netrunner. Has her own constellation of daemons orbiting the city\'s ICE. Accepts payment in favors — always collects.',
    portrait: '⚡',
    accentBg: 'rgba(255,215,0,0.08)',
    abilities: [
      {
        id: 'exploit',
        name: 'Exploit',
        icon: '💥',
        desc: 'Immediately unlock and collect all powerups currently on the board.',
        type: 'instant',
        cooldown: 0,
      },
      {
        id: 'overwrite',
        name: 'Overwrite',
        icon: '🖥️',
        desc: 'Paint a 5×5 area centered on any chosen cell with any color.',
        type: 'pick_cell_color',
        cooldown: 0,
      },
      {
        id: 'fork',
        name: 'Fork',
        icon: '🍴',
        desc: 'Repeat the effect of your last click at its mirror position (horizontally reflected).',
        type: 'instant',
        cooldown: 0,
      },
    ],
  },
]

export const CHARACTER_MAP = Object.fromEntries(CHARACTERS.map(c => [c.id, c]))
