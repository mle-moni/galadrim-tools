import { ITag } from '@galadrim-rooms/shared'
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material'
import { makeAutoObservable } from 'mobx'
import { SyntheticEvent } from 'react'
import { fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { notifyError, notifySuccess } from '../../utils/notification'

// TODO: add setTags

export class CreateRestaurantStore {
    public name = ''
    public description = ''
    public coordinates = ''
    public lat = 0
    public lng = 0
    public tags: ITag[] = []
    public image = ''

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

    setImage(image: string) {
        this.image = image
    }

    get canCreateRestaurant() {
        return (
            this.name !== '' &&
            this.description !== '' &&
            this.lat !== 0 &&
            !Number.isNaN(this.lat) &&
            this.lng !== 0 &&
            !Number.isNaN(this.lng)
        )
    }

    async createRestaurant() {

        const data = new FormData()
        data.append('name', this.name)
        data.append('description', this.description)
        data.append('lat', String(this.lat))
        data.append('lng', String(this.lng))
        this.tags.forEach((tag: ITag) => data.append('tags[]', tag.id.toString()))
        

        // data.append('tags', JSON.stringify(this.tags))
        // data.append('image', this.image)
        

        
        // const res = await fetchBackendJson('/restaurants', 'POST', {
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({
        //         name: this.name,
        //         description: this.description,
        //         lat: this.lat,
        //         lng: this.lng,
        //         tags: this.tags,
        //         image: this.image,
        //     }),
        // })

        const res = await fetchBackendJson('/restaurants', 'POST', {
            body: data,
        })
        if (res.ok) {
            notifySuccess(`Le restaurant ${this.name} a été créé !`)
            this.setName('')
            this.setDescription('')
            this.setCoordinates('')
            // this.setTags([])
            this.setImage('')
        } else {
            notifyError(getErrorMessage(res.json, `Impossible de créer le restaurant ${this.name}`))
        }
    }
}
