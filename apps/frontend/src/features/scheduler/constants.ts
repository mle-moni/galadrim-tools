import type { Room } from './types'

export const ROOMS: Room[] = [
  { id: 'salle-serveur', name: 'Salle Serveur' },
  { id: 'salle-lovelace', name: 'Salle Lovelace' },
  { id: 'salle-turing', name: 'Salle Turing' },
  { id: 'salle-smash-bros', name: 'Salle Smash-Bros' },
  { id: 'phone-box-2', name: 'Phone Box 2ème' },
  { id: 'la-jungle', name: 'La Jungle' },
  { id: 'salle-vador', name: 'Salle Vador' },
  { id: 'la-foret', name: 'La Forêt' },
  { id: 'canopee', name: 'Canopée' },
  { id: 'manguier', name: 'Manguier' },
  { id: 'massif', name: 'Massif' },
  { id: 'mulak', name: 'Mulak' },
  { id: 'amesh', name: 'Amesh' },
  { id: 'olympe', name: "L'Olympe" },
  { id: 'mediterranee', name: 'Salle Méditerranée' },
  { id: 'tresor', name: 'Salle du Trésor' },
  { id: 'super-mega-phone', name: 'Super Méga Phone Box' },
  { id: 'phone-box-cafe', name: 'Phone Box Café' },
  { id: 'butin', name: 'Salle du Butin' },
  { id: 'titude', name: 'Titude' },
  { id: 'salle-1', name: 'Salle 1' },
  { id: 'salle-2', name: 'Salle 2' },
]

export const START_HOUR = 9
export const END_HOUR = 19
export const HOURS_COUNT = END_HOUR - START_HOUR
export const TIME_COLUMN_WIDTH = 60

// Match the reference UI colors
// - Background: #dbe6fe
// - Border: #1e3ad7
// - Text: #171e54
export const THEME_ME = 'bg-[#dbe6fe]/70 border-[#1e3ad7] text-[#171e54]'

export const THEME_OTHER = 'bg-muted border-border text-muted-foreground'
