import type { ReactNode } from 'react'
import crowdTop from '@/assets/live/crowd-top.webp'
import crowdSide from '@/assets/live/crowd-side.webp'
import { PitchMarkings } from './PitchMarkings'

export function PitchBoard({ children }: { children?: ReactNode }) {
  return (
    <div className="pitch-stage absolute inset-0 overflow-hidden">
      {/* césped a sangre: cubre los 4 bordes del viewport (sin bandas oscuras) */}
      <div
        data-grass
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(90deg, var(--color-grass-a) 0, var(--color-grass-a) 35px, var(--color-grass-b) 35px, var(--color-grass-b) 71px)',
        }}
      />

      {/* tribunas: ocupan exactamente el letterbox que deja el campo al conservar su AR */}
      <img
        src={crowdTop}
        alt=""
        aria-hidden="true"
        className="absolute left-0 top-0 w-full object-cover"
        style={{
          height: 'max(var(--band-y), 5cqh)',
          opacity: 0.7,
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      />
      <img
        src={crowdSide}
        alt=""
        aria-hidden="true"
        className="absolute left-0 top-0 h-full -scale-x-100 object-cover"
        style={{ width: 'var(--band-x)', opacity: 0.7 }}
      />
      <img
        src={crowdSide}
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-0 h-full object-cover"
        style={{ width: 'var(--band-x)', opacity: 0.7 }}
      />

      {/* campo: AR fija 976:560 (sin distorsión), centrado; la UI flota encima */}
      <div className="pitch-box absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        {/* luz/viñeta del césped dentro del campo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 45%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.28) 100%)',
          }}
        />

        <PitchMarkings />

        {/* jugadores */}
        <div className="absolute inset-0">{children}</div>

        {/* vallas publicitarias */}
        <div className="absolute rounded-md" style={{ left: '5%', right: '5%', bottom: '3.5%', height: '3.5%' }}>
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(90deg,#e9eaf0 0%,#c8ccd6 18%,#eef0f5 42%,#c4c9d4 68%,#e6e8ee 100%)',
            }}
          />
        </div>

        {/* viñeta general */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(130% 110% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      </div>
    </div>
  )
}
