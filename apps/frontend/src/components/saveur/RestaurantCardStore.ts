import { INotes, IRestaurant, NotesOption } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'
import { AppStore } from '../../stores/AppStore'
import { notifyError } from '../../utils/notification'

export class RestaurantCardStore {
    public isRatingDevelopped = false
    public rating: NotesOption | null

    constructor(private restaurant: IRestaurant) {
        makeAutoObservable(this)

        const itemFound = restaurant.notes.find(
            (item) => item.userId === AppStore.authStore.user.id
        )
        this.rating = itemFound?.note ?? null
    }

    toggleIsRatingDevelopped() {
        this.isRatingDevelopped = !this.isRatingDevelopped
    }

    setRating(rating: NotesOption | null) {
        this.rating = rating
    }

    async saveRating(rating: NotesOption) {
        const data = new FormData()
        data.append('restaurant_id', this.restaurant.id.toString())
        data.append('note', rating)

        const req = await fetchBackendJson<INotes, unknown>(`/notes`, 'POST', {
            body: data,
        })
        if (req.ok) {
            this.setRating(rating)
            return
        }
        notifyError('Impossible de sauvegarder la note')
    }
}
