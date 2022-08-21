import { INotes, IRestaurant, NotesOption, NOTES_VALUES } from '@galadrim-tools/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../../api/fetch'
import { AppStore } from '../../../globalStores/AppStore'
import { notifyError } from '../../../utils/notification'

export type Ratio = {
    id: NotesOption
    value: number
    label: string
    count: number
    userIds: number[]
}

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

    get ratios() {
        const ratingsNumber = this.restaurant.notes.length

        const notesCountMap = new Map<NotesOption, { count: number; userIds: number[] }>()

        this.restaurant.notes.forEach((note) => {
            const noteCount = notesCountMap.get(note.note)
            if (noteCount) {
                notesCountMap.set(note.note, {
                    count: noteCount.count + 1,
                    userIds: [...noteCount.userIds, note.userId],
                })
            } else {
                notesCountMap.set(note.note, { count: 1, userIds: [note.userId] })
            }
        })

        return Object.entries(NOTES_VALUES)
            .reverse()
            .map(([key, value]) => {
                const noteCount = notesCountMap.get(key as NotesOption)

                const count = noteCount?.count ?? 0

                return {
                    id: key as NotesOption,
                    label: value,
                    value: (100 * count) / ratingsNumber,
                    count,
                    userIds: noteCount?.userIds ?? [],
                }
            })
    }
}
