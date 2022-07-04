export interface Tag {
    id: number
    name: string
}

export interface Restaurant {
    id: number
    name: string
    description: string
    lat: number
    lng: number
    tags: Tag[]
}
