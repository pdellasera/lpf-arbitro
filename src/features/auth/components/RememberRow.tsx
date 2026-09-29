import { Toggle } from '@/components/ui/Toggle'

interface RememberRowProps {
  checked: boolean
  onChange: (value: boolean) => void
  onForgot: () => void
}

export function RememberRow({ checked, onChange, onForgot }: RememberRowProps) {
  return (
    <div className="flex items-center justify-between">
      <Toggle checked={checked} onChange={onChange} label="Recordarme" />
      <button
        type="button"
        onClick={onForgot}
        className="text-[13px] font-medium text-[#6fa6ff] transition-colors hover:text-white"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  )
}
