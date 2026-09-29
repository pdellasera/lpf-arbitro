/**
 * Escala del lienzo de diseño (1524x820 px del mockup) a px CSS reales.
 * El contenedor raíz define --u = min(100vw/1524, 100dvh/820).
 */
export const u = (px: number) => `calc(${px}px * var(--u))`

export const DESIGN_W = 1524
export const DESIGN_H = 820
