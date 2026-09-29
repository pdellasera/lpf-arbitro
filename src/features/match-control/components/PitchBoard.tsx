import type { ReactNode } from 'react'
import crowdTop from '@/assets/live/crowd-top.webp'
import crowdSide from '@/assets/live/crowd-side.webp'
import { PitchMarkings } from './PitchMarkings'

export function PitchBoard({ children }: { children?: ReactNode }) {
  return (
    <div className="pitch-stage relative flex min-w-0 flex-1 items-center justify-center overflow-hidden">
      {/* estadio (rellena el letterbox que deja el campo al conservar su AR) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1a2c] via-[#0a1526] to-[#04121f]" />

      {/*
        Caja del campo con relación de aspecto FIJA 976:560 (césped 950x560 más la
        portería que sobresale 26px). Se dimensiona con el menor de:
        - el ancho disponible (92cqw)
        - el alto disponible convertido a ancho (90cqh * 976/560)
        Así el SVG de marcas se estira 1:1 y no se deforma en ningún viewport.
      */}
      <div
        className="pitch-box relative overflow-hidden rounded-lg"
        style={{ aspectRatio: '976 / 560', width: 'min(92cqw, calc(90cqh * 1.742857))' }}
      >
        {/* césped (base) */}
        <div className="absolute inset-0">
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
        </div>

        {/* graderío superior (sobre el césped, bajo las marcas) */}
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
          className="absolute -scale-x-100 left-0 top-[4%] h-[80%] w-[5%] object-cover opacity-60"
        />
        <img
          src={crowdSide}
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-[4%] h-[80%] w-[5%] object-cover opacity-60"
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
