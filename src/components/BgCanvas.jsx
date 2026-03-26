import { useEffect, useRef } from 'react'

const PAL = ['#00ffe0', '#00bfff', '#b94fff', '#ff6b35', '#00ffb2']

class BgCell {
  constructor(w, h, init = true) {
    this.reset(w, h, init)
  }
  reset(w, h, init = false) {
    this.x = Math.random() * w
    this.y = init ? Math.random() * h : h + 60
    this.r = 6 + Math.random() * 20
    this.vx = (Math.random() - 0.5) * 0.35
    this.vy = -(0.15 + Math.random() * 0.35)
    this.color = PAL[Math.floor(Math.random() * PAL.length)]
    this.alpha = 0.06 + Math.random() * 0.14
    this.pulse = Math.random() * Math.PI * 2
    this.ps = 0.007 + Math.random() * 0.01
    const n = 10 + Math.floor(Math.random() * 5)
    this.pts = Array.from({ length: n }, (_, i) => ({
      a: (i / n) * Math.PI * 2,
      w: 1 + (Math.random() - 0.5) * 0.22,
    }))
  }
  draw(ctx) {
    const r = this.r * (1 + 0.06 * Math.sin(this.pulse))
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.globalAlpha = this.alpha
    ctx.strokeStyle = this.color
    ctx.lineWidth = 1.1
    ctx.beginPath()
    this.pts.forEach((p, i) => {
      const px = Math.cos(p.a) * r * p.w
      const py = Math.sin(p.a) * r * p.w
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
    })
    ctx.closePath()
    ctx.stroke()
    ctx.globalAlpha = this.alpha * 0.5
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }
  update(w, h) {
    this.x += this.vx
    this.y += this.vy
    this.pulse += this.ps
    if (this.y < -80) this.reset(w, h, false)
  }
}

export default function BgCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId
    let cells = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      resize()
      cells = Array.from({ length: 65 }, () => new BgCell(canvas.width, canvas.height, true))
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      cells.forEach(c => {
        c.update(canvas.width, canvas.height)
        c.draw(ctx)
      })
      rafId = requestAnimationFrame(loop)
    }

    init()
    loop()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="bg-canvas" />
}
