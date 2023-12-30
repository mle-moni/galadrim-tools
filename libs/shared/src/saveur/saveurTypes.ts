import { NotesOption } from './notes'

export interface ITag {
    id: number
    name: string
}

export interface IImage {
    url: string
    name: string
    extname: 'png' | 'jpg' | 'jpeg'
    size: number
    mimeType: 'image/png' | 'image/jpeg'
}

export interface IRestaurant {
    id: number
    name: string
    description: string
    lat: number
    lng: number
    websiteLink: string | null
    tags: ITag[]
    notes: INotes[]
    image: IImage | null
    createdAt: string // parsable date
    averagePrice: number | null
    userId: number
    choices: IChoice['userId'][]
    reviews: IReview[]
}

export interface IReview {
    id: number
    restaurantId: number
    userId: number
    comment: string
    image: IImage | null
    createdAt: string
    updatedAt: string
}

export interface INotes {
    id: number
    restaurantId: number
    userId: number
    note: NotesOption
    updatedAt: string
}

export interface IChoice {
    id: number
    restaurantId: number
    userId: number
    createdAt: Date
}

const REWIND_ANIMALS = ['GAZELLE', 'BLAIREAU', 'PARESSEUX', 'MICROBE'] as const
export type RewindAnimal = typeof REWIND_ANIMALS[number]

const REWIND_ADJECTIVES = ['RICHE', 'MOYEN', 'PAUVRE', 'INSIGNIFIANT'] as const
export type RewindAdjective = typeof REWIND_ADJECTIVES[number]

export interface IRewind {
    id: number
    userId: number
    favoriteRestaurantId: number | null
    favoriteRestaurantCount: number | null
    dailyChoiceCount: number | null
    restaurantPerTag: Record<string, number>
    restaurantAverageScore: number | null
    totalDistanceTravelled: number | null
    averageDistanceTravelled: number | null
    totalPrice: number | null
    averagePrice: number | null
    userRank: number | null
    wealthRank: number | null
    distanceRank: number | null
    maxRank: number
    personality: [RewindAnimal, RewindAdjective] | null
    createdAt: string
    updatedAt: string
}
