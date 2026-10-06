import { Ellipsis, FileBadge, Plus, Repeat2, Volleyball } from 'lucide-react'
import type { GridItemKind, LiveGridItem } from '../../data/liveGrid'

interface EventActionGridProps {
  items: LiveGridItem[]
  onSelect: (item: LiveGridItem) => void
}

function GridIcon({ kind }: { kind: GridItemKind }) {
  switch (kind) {
    case 'ball':
      return <Volleyball className="h-9 w-9 text-ink" />
    case 'yellow':
      return <span className="h-8 w-6 rounded-[3px] bg-card-yellow" />
    case 'red':
      return <span className="h-8 w-6 rounded-[3px] bg-pick" />
    case 'sub':
      return <Repeat2 className="h-9 w-9 text-ink" />
    case 'injury':
      return (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pick">
          <Plus className="h-6 w-6 text-white" />
        </span>
      )
    case 'incident':
      return <FileBadge className="h-9 w-9 text-ink" />
    case 'more':
      return <Ellipsis className="h-9 w-9 text-ink" />
  }
}

export function EventActionGrid({ items, onSelect }: EventActionGridProps) {
  return (
    <div data-live-grid className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <button
          key={item.kind}
          type="button"
          data-live-action={item.kind}
          onClick={() => onSelect(item)}
          className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-line bg-white px-2 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-transform active:scale-95"
        >
          <span className="flex h-11 items-center justify-center">
            <GridIcon kind={item.kind} />
          </span>
          <span className="text-center text-[13px] font-semibold leading-tight text-ink">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
