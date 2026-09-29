import type { InstallPlatform } from '../types'
import { MoreVertical, PlusSquare, Share } from 'lucide-react'

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="mt-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-left">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/70">
            {i + 1}
          </span>
          <span className="text-[13px] leading-relaxed text-[#8ca0b5]">{item}</span>
        </li>
      ))}
    </ol>
  )
}

export function InstallInstructions({ platform }: { platform: InstallPlatform }) {
  if (platform === 'ios') {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <Share className="h-4 w-4 text-[#6fa6ff]" /> Cómo instalar en iPhone/iPad
        </p>
        <Steps
          items={[
            'Pulsa el botón Compartir (cuadrado con flecha) en Safari.',
            'Elige “Añadir a pantalla de inicio”.',
            'Toca “Añadir” y abre la app desde su icono.',
          ]}
        />
      </div>
    )
  }

  if (platform === 'android') {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <MoreVertical className="h-4 w-4 text-[#6fa6ff]" /> Cómo instalar en Android
        </p>
        <Steps
          items={[
            'Pulsa el menú ⋮ de Chrome.',
            'Elige “Instalar aplicación” o “Añadir a pantalla de inicio”.',
            'Confirma y abre la app desde su icono.',
          ]}
        />
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
        <PlusSquare className="h-4 w-4 text-[#6fa6ff]" /> Cómo instalar
      </p>
      <Steps
        items={[
          'Busca el icono de instalar (⊕ o descargar) en la barra de direcciones.',
          'Pulsa “Instalar” en el diálogo del navegador.',
          'Abre la app desde su icono en pantalla.',
        ]}
      />
    </div>
  )
}
