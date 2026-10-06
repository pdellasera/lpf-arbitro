interface MatchInfoProps {
  venue: string
  jornada: number
}

export function MatchInfo({ venue, jornada }: MatchInfoProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <p className="text-[13.5px] leading-tight text-ink-soft">{venue}</p>
      <p className="text-[13px] leading-tight text-ink-mute">Jornada {jornada}</p>
    </div>
  )
}