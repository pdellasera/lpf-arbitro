import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react'

export interface SignaturePadHandle {
  clear: () => void
  isEmpty: () => boolean
  toDataURL: () => string | null
}

interface SignaturePadProps {
  /** Recibe `true` al quedar vacía y `false` al recibir el primer trazo. */
  onChange?: (empty: boolean) => void
  ref?: Ref<SignaturePadHandle>
}

/**
 * Lienzo de firma propio (sin librerías): trazos con pointer events,
 * nítido en pantallas retina (devicePixelRatio) y exportable a dataURL.
 */
export function SignaturePad({ onChange, ref }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasInkRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [empty, setEmpty] = useState(true)

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      hasInkRef.current = false
      setEmpty(true)
      onChangeRef.current?.(true)
    },
    isEmpty: () => !hasInkRef.current,
    toDataURL: () => (hasInkRef.current ? (canvasRef.current?.toDataURL('image/png') ?? null) : null),
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f172a'
    ctx.fillStyle = '#0f172a'
  }, [])

  function getPos(e: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function markInk() {
    if (hasInkRef.current) return
    hasInkRef.current = true
    setEmpty(false)
    onChangeRef.current?.(false)
  }

  function handleDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const pos = getPos(e)
    lastRef.current = pos
    const ctx = e.currentTarget.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    markInk()
  }

  function handleMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const pos = getPos(e)
    const prev = lastRef.current
    const ctx = e.currentTarget.getContext('2d')
    if (ctx && prev) {
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
    lastRef.current = pos
  }

  function handleUp() {
    drawingRef.current = false
    lastRef.current = null
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        data-signature
        className="block h-[170px] w-full touch-none rounded-xl border border-line bg-white"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      />
      {empty && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-ink-mute">
          Firma aquí…
        </span>
      )}
    </div>
  )
}
