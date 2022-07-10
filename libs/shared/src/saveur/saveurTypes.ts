export interface ITag {
    id: number
    name: string
}

export interface IRestaurant {
    id: number
    name: string
    description: string
    lat: number
    lng: number
    tags: ITag[]
    image: string
}
