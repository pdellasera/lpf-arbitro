import type { Match, MatchDay, RefereeAssignment } from '../types'
import cai from '@/assets/crests/cai.webp'
import plaza from '@/assets/crests/plaza-amador.webp'
import tauro from '@/assets/crests/tauro.webp'
import sanFrancisco from '@/assets/crests/san-francisco.webp'
import herrera from '@/assets/crests/herrera.webp'
import umecit from '@/assets/crests/umecit.webp'
import cdu from '@/assets/crests/cdu.webp'
import sporting from '@/assets/crests/sporting.webp'
import veraguas from '@/assets/crests/veraguas.webp'
import arabeUnido from '@/assets/crests/arabe-unido.webp'

// Fecha "hoy" fija para que textos y horas coincidan exactamente con el mockup.
export const TODAY = '2025-09-28'

const LEAGUE = 'Liga Panameña'

export const MATCH_DAYS: MatchDay[] = [
  { date: '2025-09-28', label: 'Hoy', sublabel: '28 sep' },
  { date: '2025-09-29', label: 'Mañana', sublabel: '29 sep' },
  { date: '2025-10-03', label: 'Vie', sublabel: '3 oct' },
]

export const MATCHES_BY_DAY: Record<string, Match[]> = {
  '2025-09-28': [
    {
      id: 'm1',
      status: 'upcoming',
      badge: 'PRÓXIMO A INICIAR',
      league: LEAGUE,
      jornada: 12,
      venue: 'Estadio Rommel Fernández',
      featured: true,
      home: { name: 'CAI', country: 'Panamá', crest: cai },
      away: { name: 'Plaza Amador', country: 'Panamá', crest: plaza },
      score: null,
      trailing: '19:00',
    },
    {
      id: 'm2',
      status: 'finished',
      badge: 'Finalizado',
      league: LEAGUE,
      jornada: 12,
      venue: 'Estadio Agustín Muquita Sánchez',
      home: { name: 'Tauro FC', country: 'Panamá', crest: tauro },
      away: { name: 'San Francisco', country: 'Panamá', crest: sanFrancisco },
      score: null,
      trailing: '16:00',
    },
    {
      id: 'm3',
      status: 'finished',
      badge: 'Reportado',
      league: LEAGUE,
      jornada: 12,
      venue: 'Estadio Maracaná de Colón',
      home: { name: 'CD Universitario', country: 'Panamá', crest: cdu },
      away: { name: 'UMECIT FC', country: 'Panamá', crest: umecit },
      score: null,
      trailing: '14:00',
    },
    {
      id: 'm4',
      status: 'upcoming',
      badge: 'Programado',
      league: LEAGUE,
      jornada: 12,
      venue: 'Estadio Los Milagros',
      home: { name: 'Herrera FC', country: 'Panamá', crest: herrera },
      away: { name: 'Veraguas United', country: 'Panamá', crest: veraguas },
      score: null,
      trailing: '11:00',
    },
  ],
  '2025-09-29': [
    {
      id: 'm5',
      status: 'upcoming',
      badge: 'Programado',
      league: LEAGUE,
      jornada: 13,
      venue: 'Estadio Rommel Fernández',
      home: { name: 'CD Universitario', country: 'Panamá', crest: cdu },
      away: { name: 'Sporting SM', country: 'Panamá', crest: sporting },
      score: null,
      trailing: '15:30',
    },
    {
      id: 'm6',
      status: 'upcoming',
      badge: 'Programado',
      league: LEAGUE,
      jornada: 13,
      venue: 'Estadio Maracaná de Colón',
      home: { name: 'Veraguas United', country: 'Panamá', crest: veraguas },
      away: { name: 'Árabe Unido', country: 'Panamá', crest: arabeUnido },
      score: null,
      trailing: '19:00',
    },
  ],
  '2025-10-03': [
    {
      id: 'm7',
      status: 'upcoming',
      badge: 'Programado',
      league: LEAGUE,
      jornada: 13,
      venue: 'Estadio Javier Cruz',
      home: { name: 'Sporting SM', country: 'Panamá', crest: sporting },
      away: { name: 'Veraguas United', country: 'Panamá', crest: veraguas },
      score: null,
      trailing: '16:00',
    },
    {
      id: 'm8',
      status: 'upcoming',
      badge: 'Programado',
      league: LEAGUE,
      jornada: 13,
      venue: 'Estadio Los Milagros',
      home: { name: 'Árabe Unido', country: 'Panamá', crest: arabeUnido },
      away: { name: 'CD Universitario', country: 'Panamá', crest: cdu },
      score: null,
      trailing: '20:00',
    },
  ],
}

// Equipo arbitral de demostración (mismo para todos los partidos del mock).
export const DEFAULT_REFEREES: RefereeAssignment[] = [
  { role: 'Árbitro central', name: 'Carlos Méndez' },
  { role: 'Asistente 1', name: 'Luis Gómez' },
  { role: 'Asistente 2', name: 'Andrés Ríos' },
  { role: 'Cuarto árbitro', name: 'Daniel Vargas' },
]

// Ciudad del estadio por partido (para la fila de sede del detalle).
export const MATCH_DETAILS: Record<string, { city: string }> = {
  m1: { city: 'Panamá' },
  m2: { city: 'La Chorrera' },
  m3: { city: 'Colón' },
  m4: { city: 'Chitré' },
  m5: { city: 'Panamá' },
  m6: { city: 'Colón' },
  m7: { city: 'Panamá' },
  m8: { city: 'Chitré' },
}

