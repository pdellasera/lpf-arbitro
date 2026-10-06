import { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import type { Match, Team } from '@/features/matches/types'

interface LoadLineupScreenProps {
  match: Match
  onBack: () => void
  onNext: () => void
}

type Side = 'home' | 'away'
type Section = 'starters' | 'bench'
type PlayerField = 'number' | 'name' | 'position'

interface PlayerEntry {
  id: string
  number: string
  name: string
  position: string
}

const STARTERS_LIMIT = 11
const BENCH_LIMIT = 7

let entrySeq = 0
function createEntry(): PlayerEntry {
  entrySeq += 1
  return { id: `entry-${entrySeq}-${Date.now()}`, number: '', name: '', position: '' }
}

function PlayerEntryRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: PlayerEntry
  onChange: (field: PlayerField, value: string) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-t border-line px-3 py-2">
      <input
        value={entry.number}
        onChange={(e) => onChange('number', e.target.value)}
        placeholder="Dorsal"
        inputMode="numeric"
        className="h-11 w-16 shrink-0 rounded-xl border border-line bg-white px-2 text-center text-[15px] font-bold tabular-nums text-ink outline-none placeholder:text-ink-mute focus:border-brand"
      />
      <input
        value={entry.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="Nombre"
        className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-[15px] text-ink outline-none placeholder:text-ink-mute focus:border-brand"
      />
      <input
        value={entry.position}
        onChange={(e) => onChange('position', e.target.value)}
        placeholder="Posición"
        className="h-11 w-24 shrink-0 rounded-xl border border-line bg-white px-2 text-[14px] text-ink outline-none placeholder:text-ink-mute focus:border-brand"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar jugador"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-mute transition-colors hover:text-pick"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function AddPlayerButton({ dataAdd, disabled, onClick }: { dataAdd: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-lineup-add={dataAdd}
      onClick={onClick}
      disabled={disabled}
      className={
        disabled
          ? 'mx-3 my-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-badge-gray text-[14px] font-bold text-ink-mute'
          : 'mx-3 my-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-tint-line bg-tint text-[14px] font-bold text-brand transition-colors hover:bg-tint/60 active:scale-[0.99]'
      }
    >
      <Plus className="h-4 w-4" />
      {disabled ? 'Completo' : 'Agregar jugador'}
    </button>
  )
}

function TeamLineupCard({
  team,
  side,
  entries,
  onAdd,
  onChange,
  onRemove,
}: {
  team: Team
  side: Side
  entries: { starters: PlayerEntry[]; bench: PlayerEntry[] }
  onAdd: (section: Section) => void
  onChange: (section: Section, id: string, field: PlayerField, value: string) => void
  onRemove: (section: Section, id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-badge-gray px-4 py-3">
        <img src={team.crest} alt={team.name} className="h-6 w-6 shrink-0 object-contain" />
        <span className="text-[15px] font-bold text-ink">{team.name}</span>
      </div>

      <p className="px-4 pt-3 text-[12px] font-bold uppercase tracking-wide text-ink-mute">
        Titulares ({entries.starters.length}/{STARTERS_LIMIT})
      </p>
      <div className="flex flex-col">
        {entries.starters.map((entry) => (
          <PlayerEntryRow
            key={entry.id}
            entry={entry}
            onChange={(field, value) => onChange('starters', entry.id, field, value)}
            onRemove={() => onRemove('starters', entry.id)}
          />
        ))}
        <AddPlayerButton
          dataAdd={`${side}-starters`}
          disabled={entries.starters.length >= STARTERS_LIMIT}
          onClick={() => onAdd('starters')}
        />
      </div>

      <p className="border-t border-line px-4 pt-3 text-[12px] font-bold uppercase tracking-wide text-ink-mute">
        Suplentes ({entries.bench.length}/{BENCH_LIMIT})
      </p>
      <div className="flex flex-col pb-2">
        {entries.bench.map((entry) => (
          <PlayerEntryRow
            key={entry.id}
            entry={entry}
            onChange={(field, value) => onChange('bench', entry.id, field, value)}
            onRemove={() => onRemove('bench', entry.id)}
          />
        ))}
        <AddPlayerButton
          dataAdd={`${side}-bench`}
          disabled={entries.bench.length >= BENCH_LIMIT}
          onClick={() => onAdd('bench')}
        />
      </div>
    </div>
  )
}

/** Pantalla del Árbitro para cargar titulares y suplentes (inputs Dorsal/Nombre/Posición). */
export function LoadLineupScreen({ match, onBack, onNext }: LoadLineupScreenProps) {
  const [lineups, setLineups] = useState<Record<Side, { starters: PlayerEntry[]; bench: PlayerEntry[] }>>({
    home: { starters: [], bench: [] },
    away: { starters: [], bench: [] },
  })

  function addPlayer(side: Side, section: Section) {
    const limit = section === 'starters' ? STARTERS_LIMIT : BENCH_LIMIT
    setLineups((prev) => {
      if (prev[side][section].length >= limit) return prev
      return {
        ...prev,
        [side]: { ...prev[side], [section]: [...prev[side][section], createEntry()] },
      }
    })
  }

  function changePlayer(side: Side, section: Section, id: string, field: PlayerField, value: string) {
    setLineups((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [section]: prev[side][section].map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      },
    }))
  }

  function removePlayer(side: Side, section: Section, id: string) {
    setLineups((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [section]: prev[side][section].filter((e) => e.id !== id),
      },
    }))
  }

  return (
    <div data-lineup className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <header className="sticky top-0 z-30 shrink-0 bg-gradient-to-b from-header-top to-header-bottom">
        <div className="relative flex items-center justify-center px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-[17px] font-bold leading-none tracking-tight text-white">Cargar alineaciones</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-page">
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <h2 className="text-[24px] font-extrabold leading-none tracking-tight text-ink">Cargar alineaciones</h2>
          <p className="mt-2 text-[14px] leading-snug text-ink-soft">
            Cargá los titulares y suplentes de ambos equipos antes de iniciar.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <TeamLineupCard
              team={match.home}
              side="home"
              entries={lineups.home}
              onAdd={(section) => addPlayer('home', section)}
              onChange={(section, id, field, value) => changePlayer('home', section, id, field, value)}
              onRemove={(section, id) => removePlayer('home', section, id)}
            />
            <TeamLineupCard
              team={match.away}
              side="away"
              entries={lineups.away}
              onAdd={(section) => addPlayer('away', section)}
              onChange={(section, id, field, value) => changePlayer('away', section, id, field, value)}
              onRemove={(section, id) => removePlayer('away', section, id)}
            />
          </div>
          <div className="h-4" />
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex gap-3">
            <button
              type="button"
              data-lineup-back
              onClick={onBack}
              className="flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-badge-gray px-6 text-[16px] font-bold text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
            <button
              type="button"
              data-lineup-next
              onClick={onNext}
              className="flex h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(0,98,253,0.32)] transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Siguiente
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
