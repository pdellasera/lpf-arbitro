import { cn } from '@/lib/cn'

interface PlayerAvatarProps {
  src?: string
  name: string
  size: number
  className?: string
}

export function PlayerAvatar({ src, name, size, className }: PlayerAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      className={cn(
        'relative inline-block shrink-0 overflow-hidden rounded-full bg-[#1b2c44] ring-1 ring-white/15',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-bold text-white/80"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          {initials}
        </span>
      )}
    </span>
  )
}
