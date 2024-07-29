import RestaurantChoice from '#models/restaurant_choice'
import { NANTES_COORDINATES_VALUES, PARIS_COORDINATES_VALUES } from '@galadrim-tools/shared'

const toRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180
}

const distanceBetweenCoordinates = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3 // meters
  const phi1 = toRadians(lat1)
  const phi2 = toRadians(lat2)
  const deltaPhi = toRadians(lat2 - lat1)
  const deltaLambda = toRadians(lng2 - lng1)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const getDistanceTravelled = (choices: RestaurantChoice[]) => {
  const totalDistance = Math.round(
    choices.reduce((acc, choice) => {
      const [lat, lng] = [choice.$extras.lat, choice.$extras.lng]
      const distanceParis = distanceBetweenCoordinates(...PARIS_COORDINATES_VALUES, lat, lng)
      if (distanceParis > 10000) {
        return acc + distanceBetweenCoordinates(...NANTES_COORDINATES_VALUES, lat, lng)
      }
      return acc + distanceParis
    }, 0)
  )
  return 2 * totalDistance // aller-retour
}
