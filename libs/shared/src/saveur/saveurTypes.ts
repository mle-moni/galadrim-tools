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
    tags: ITag[]
    image: IImage | null
}
