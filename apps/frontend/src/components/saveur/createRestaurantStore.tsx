import { ITag } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { notifyError, notifySuccess } from '../../utils/notification'

export class CreateRestaurantStore {
    public name = ''
    public description = ''
    public coordinates = ''
    public lat = 0
    public lng = 0
    public tags: ITag[] = []
    public image: File | null = null

    constructor() {
        makeAutoObservable(this)
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

    async createRestaurant() {
        const data = new FormData()
        data.append('name', this.name)
        data.append('description', this.description)
        data.append('lat', String(this.lat))
        data.append('lng', String(this.lng))
        this.tags.forEach((tag: ITag) => data.append('tags[]', tag.id.toString()))

        if (this.image) {
            data.append('image', this.image)
        }

        const res = await fetchBackendJson('/restaurants', 'POST', {
            body: data,
        })

        if (res.ok) {
            notifySuccess(`Le restaurant ${this.name} a été créé !`)
            this.setName('')
            this.setDescription('')
            this.setCoordinates('')
            this.setTags([])
            this.setImage(null)
        } else {
            notifyError(getErrorMessage(res.json, `Impossible de créer le restaurant ${this.name}`))
        }
    }
}
