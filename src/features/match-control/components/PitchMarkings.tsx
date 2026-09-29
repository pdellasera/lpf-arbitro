/**
 * Líneas de la cancha (SVG) sobre el césped. Coordenadas relativas al rect
 * de césped 950x560 (lienzo x 144..1094, y 111..671), medidas del mockup.
 * viewBox ampliado a la izquierda para dibujar la portería.
 */
export function PitchMarkings() {
  const stroke = '#eaf7e8'
  return (
    <svg
      viewBox="-26 0 976 560"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" stroke={stroke} strokeWidth={2.6} opacity={0.9} strokeLinecap="round">
        {/* rectángulo de campo: goal lines x=20..920, touchlines y=17..509 */}
        <rect x={20} y={17} width={900} height={492} rx={2} />
        {/* línea de medio campo */}
        <line x1={470} y1={17} x2={470} y2={509} />
        {/* círculo central (r≈74) y punto */}
        <circle cx={470} cy={263} r={74} />
        <circle cx={470} cy={263} r={3.2} fill={stroke} stroke="none" />
        {/* áreas grandes */}
        <rect x={20} y={107} width={148} height={308} />
        <rect x={785} y={107} width={135} height={308} />
        {/* áreas chicas */}
        <rect x={20} y={197} width={49} height={132} />
        <rect x={871} y={197} width={49} height={132} />
        {/* puntos de penal */}
        <circle cx={109} cy={263} r={3.2} fill={stroke} stroke="none" />
        <circle cx={831} cy={263} r={3.2} fill={stroke} stroke="none" />
        {/* arcos de esquina */}
        <path d="M 20 29 A 12 12 0 0 1 32 17" />
        <path d="M 920 29 A 12 12 0 0 0 908 17" />
        <path d="M 20 497 A 12 12 0 0 0 32 509" />
        <path d="M 920 497 A 12 12 0 0 1 908 509" />
      </g>
      {/* porterías */}
      <g fill="none" stroke={stroke} strokeWidth={3} opacity={0.95}>
        <path d="M -22 203 L 20 203 L 20 323" />
        <path d="M -22 323 L 20 323" />
        <path d="M 920 203 L 942 203 L 942 323 L 920 323" />
      </g>
    </svg>
  )
}
