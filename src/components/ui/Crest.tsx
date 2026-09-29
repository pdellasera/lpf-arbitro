import { cn } from '@/lib/cn'

interface CrestProps {
  src: string
  alt: string
  className?: string
}

export function Crest({ src, alt, className }: CrestProps) {
  return <img src={src} alt={alt} draggable={false} className={cn('h-11 w-11 shrink-0 object-contain', className)} />
}
