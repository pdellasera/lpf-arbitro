interface DrawerFooterProps {
  onCancel: () => void
  onSubmit: () => void
  submitLabel?: string
}

export function DrawerFooter({ onCancel, onSubmit, submitLabel = 'Guardar' }: DrawerFooterProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 flex-1 rounded-xl bg-[#1a2e44] text-sm font-semibold text-white transition-colors hover:bg-[#22384f] short:h-10 short:text-[13px]"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="h-11 flex-1 rounded-xl bg-[#0060fd] text-sm font-semibold text-white transition-colors hover:bg-[#1a74ff] short:h-10 short:text-[13px]"
      >
        {submitLabel}
      </button>
    </div>
  )
}
