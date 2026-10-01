import type { Match, MatchDay } from '../types'
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
export const TODAY = '2026-09-28'

export const MATCH_DAYS: MatchDay[] = [
  { date: '2026-09-28', label: 'Hoy', sublabel: '28 sep' },
  { date: '2026-09-29', label: 'Mañana', sublabel: '29 sep' },
  { date: '2026-09-30', label: 'Mar, 30', sublabel: '30 sep' },
  { date: '2026-10-01', label: 'Mié, 1', sublabel: '1 oct' },
  { date: '2026-10-02', label: 'Jue, 2', sublabel: '2 oct' },
]

export const MATCHES_BY_DAY: Record<string, Match[]> = {
  '2026-09-28': [
    {
      id: 'm1',
      status: 'upcoming',
      badge: 'PRÓXIMO A INICIAR',
      league: 'Liga Panameña de Fútbol',
      jornada: 12,
      home: { name: 'CAI', country: 'Panamá', crest: cai },
      away: { name: 'Plaza Amador', country: 'Panamá', crest: plaza },
      score: null,
      trailing: '19:00',
      meta: [
        { icon: 'castle', label: 'Estadio Rommel Fernández' },
        { icon: 'whistle', label: 'Árbitro central' },
        { icon: 'file', label: 'Informe digital' },
      ],
    },
  ],
  '2026-09-29': [
    {
      id: 'm4',
      status: 'upcoming',
      badge: 'PRÓXIMO A INICIAR',
      league: 'Liga Panameña de Fútbol',
      jornada: 13,
      home: { name: 'CD Universitario', country: 'Panamá', crest: cdu },
      away: { name: 'Sporting SM', country: 'Panamá', crest: sporting },
      score: null,
      trailing: '15:30',
      meta: [
        { icon: 'castle', label: 'Estadio Rommel Fernández' },
        { icon: 'whistle', label: 'Árbitro central' },
        { icon: 'file', label: 'Informe digital' },
      ],
    },
    {
      id: 'm5',
      status: 'upcoming',
      badge: 'PRÓXIMO A INICIAR',
      league: 'Liga Panameña de Fútbol',
      jornada: 13,
      home: { name: 'Veraguas United', country: 'Panamá', crest: veraguas },
      away: { name: 'Árabe Unido', country: 'Panamá', crest: arabeUnido },
      score: null,
      trailing: '19:00',
      meta: [
        { icon: 'castle', label: 'Estadio Maracaná de Colón' },
        { icon: 'whistle', label: 'Árbitro central' },
        { icon: 'file', label: 'Informe digital' },
      ],
    },
  ],
  '2026-09-30': [
    {
      id: 'm2',
      status: 'live',
      badge: 'EN CURSO',
      league: 'Liga Panameña de Fútbol',
      jornada: 12,
      home: { name: 'Tauro FC', country: 'Panamá', crest: tauro },
      away: { name: 'San Francisco', country: 'Panamá', crest: sanFrancisco },
      score: { home: 2, away: 1 },
      trailing: "Min. 67'",
      meta: [
        { icon: 'castle', label: 'Estadio Rommel Fernández' },
        { icon: 'whistle', label: 'Cuarto árbitro' },
        { icon: 'file', label: 'En vivo', tone: 'green' },
      ],
    },
  ],
  '2026-10-01': [
    {
      id: 'm3',
      status: 'finished',
      badge: 'FINALIZADO',
      league: 'Liga Panameña de Fútbol',
      jornada: 11,
      home: { name: 'Herrera FC', country: 'Panamá', crest: herrera },
      away: { name: 'UMECIT FC', country: 'Panamá', crest: umecit },
      score: { home: 0, away: 0 },
      trailing: '17:00',
      meta: [
        { icon: 'castle', label: 'Estadio Los Milagros' },
        { icon: 'whistle', label: 'Árbitro central' },
        { icon: 'check', label: 'Informe enviado', tone: 'green' },
      ],
    },
  ],
  '2026-10-02': [
    {
      id: 'm6',
      status: 'upcoming',
      badge: 'PRÓXIMO A INICIAR',
      league: 'Liga Panameña de Fútbol',
      jornada: 13,
      home: { name: 'Sporting SM', country: 'Panamá', crest: sporting },
      away: { name: 'Veraguas United', country: 'Panamá', crest: veraguas },
      score: null,
      trailing: '16:00',
      meta: [
        { icon: 'castle', label: 'Estadio Javier Cruz' },
        { icon: 'whistle', label: 'Árbitro central' },
        { icon: 'file', label: 'Informe digital' },
      ],
    },
    {
      id: 'm7',
      status: 'upcoming',
      badge: 'PRÓXIMO A INICIAR',
      league: 'Liga Panameña de Fútbol',
      jornada: 13,
      home: { name: 'Árabe Unido', country: 'Panamá', crest: arabeUnido },
      away: { name: 'CD Universitario', country: 'Panamá', crest: cdu },
      score: null,
      trailing: '20:00',
      meta: [
        { icon: 'castle', label: 'Estadio Los Milagros' },
        { icon: 'whistle', label: 'Árbitro central' },
        { icon: 'file', label: 'Informe digital' },
      ],
    },
  ],
}
