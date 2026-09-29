import type { ReactNode } from 'react'
import crowdTop from '@/assets/live/crowd-top.webp'
import crowdSide from '@/assets/live/crowd-side.webp'
import { PitchMarkings } from './PitchMarkings'

export function PitchBoard({ children }: { children?: ReactNode }) {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      {/* estadio */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1a2c] via-[#0a1526] to-[#04121f]" />

      {/* graderío superior */}
      <img
        src={crowdTop}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-[11%] w-[70%] -translate-x-1/2 object-cover opacity-60"
      />

      {/* graderíos laterales */}
      <img
        src={crowdSide}
        alt=""
        aria-hidden="true"
        className="absolute -scale-x-100 left-0 top-[5%] h-[78%] w-[7%] object-cover opacity-60"
      />
      <img
        src={crowdSide}
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-[5%] h-[78%] w-[7%] object-cover opacity-60"
      />

      {/* césped */}
      <div className="absolute overflow-hidden rounded-lg" style={{ left: '5%', right: '5%', top: '9%', bottom: '8%' }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(90deg, #3d6e11 0, #3d6e11 35px, #56872a 35px, #56872a 71px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 45%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.28) 100%)',
          }}
        />
        <PitchMarkings />
        {/* jugadores */}
        <div className="absolute inset-0">{children}</div>
      </div>

      {/* vallas publicitarias */}
      <div className="absolute rounded-md" style={{ left: '5%', right: '5%', bottom: '2.5%', height: '3.5%' }}>
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
  )
}
