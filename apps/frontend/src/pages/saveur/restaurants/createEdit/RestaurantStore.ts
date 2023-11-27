import { IRestaurant, ITag, _assert } from '@galadrim-tools/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../../../api/fetch'
import { notifyError, notifySuccess } from '../../../../utils/notification'

export class RestaurantStore {
    public name = ''
    public description = ''
    public coordinates = ''
    public websiteLink = ''
    public lat = 0
    public lng = 0
    public tags: ITag[] = []
    public image: File | null = null

    // used when editing restaurant
    public imageSrc: string | null = null
    public averagePriceText = ''

    constructor(private restaurant?: IRestaurant) {
        if (restaurant) {
            this.name = restaurant.name
            this.description = restaurant.description
            this.coordinates = `${restaurant.lat}, ${restaurant.lng}`
            this.lat = restaurant.lat
            this.lng = restaurant.lng
            this.websiteLink = restaurant.websiteLink ?? ''
            this.tags = restaurant.tags
            this.imageSrc = restaurant.image?.url ?? null
            const avgPriceText = restaurant.averagePrice ?? ''
            this.averagePriceText = avgPriceText.toString()
        }
        makeAutoObservable(this)
    }

    setAveragePrice(state: string) {
        this.averagePriceText = state
    }

    setName(name: string) {
        this.name = name
    }

    setDescription(description: string) {
        this.description = description
    }

    setCoordinates(coord: string) {
        this.lat = Number(coord.split(',')[0])
        this.lng = Number(coord.split(',')[1])
        this.coordinates = coord
    }

    setWebsiteLink(link: string) {
        this.websiteLink = link
    }

    setTags(tags: ITag[]) {
        this.tags = tags
    }

    setUploadedImage(input: HTMLInputElement) {
        const image: File | null = input.files && input.files.length >= 1 ? input.files[0] : null
        this.setImage(image)
    }

    setImage(image: File | null) {
        this.image = image
    }

    get canCreateRestaurant() {
        console.log('name', this.name)
        console.log('description', this.description)
        console.log('lat', this.lat)
        console.log('lng', this.lng)
        console.log('tags', this.tags.length)

        return (
            this.name !== '' &&
            this.description !== '' &&
            this.lat !== 0 &&
            !Number.isNaN(this.lat) &&
            this.lng !== 0 &&
            !Number.isNaN(this.lng) &&
            this.tags.length
        )
    }

    get averagePriceError() {
        return this.averagePriceText.length !== 0 && this.averagePrice === null
    }

    get averagePrice() {
        const price = parseFloat(this.averagePriceText)
        if (this.averagePriceText === '' || isNaN(price)) {
            return null
        }
        return price
    }

    getPayload() {
        const data = new FormData()

        data.append('name', this.name)
        data.append('description', this.description)
        data.append('lat', String(this.lat))
        data.append('lng', String(this.lng))
        data.append('websiteLink', this.websiteLink)
        if (this.averagePrice !== null) {
            data.append('averagePrice', String(this.averagePrice))
        }
        this.tags.forEach((tag: ITag) => data.append('tags[]', tag.id.toString()))

        if (this.image) {
            data.append('image', this.image)
        }

        return data
    }

    async createRestaurant() {
        const data = this.getPayload()

        const res = await fetchBackendJson<IRestaurant, unknown>('/restaurants', 'POST', {
            body: data,
        })

        if (res.ok) {
            notifySuccess(`Le restaurant ${this.name} a été créé !`)
            this.reset()
        } else {
            notifyError(
                getErrorMessage(res.json, `Impossible de créer le restaurant ${this.name}, bizarre`)
            )
        }
    }

    async editRestaurant() {
        const data = this.getPayload()

        _assert(
            this.restaurant?.id,
            'this function should only be called if a restaurant was passed onto the constructor'
        )

        const res = await fetchBackendJson<IRestaurant, unknown>(
            `/restaurants/${this.restaurant.id}`,
            'PUT',
            {
                body: data,
            }
        )

        if (res.ok) {
            notifySuccess(`Le restaurant ${this.name} a été modifié !`)
        } else {
            notifyError(
                getErrorMessage(
                    res.json,
                    `Impossible de modifier le restaurant ${this.name}, bizarre`
                )
            )
        }
    }

    reset() {
        this.setName('')
        this.setDescription('')
        this.setCoordinates('')
        this.setWebsiteLink('')
        this.setTags([])
        this.setImage(null)
        this.setAveragePrice('')
    }
}
