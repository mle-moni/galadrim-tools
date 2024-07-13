import { HttpContext } from '@adonisjs/core/http'
import { availableRooms } from '#app/Controllers/Http/events/availableRooms'
import { destroyRoute } from './destroyEvent'
import { indexRoute } from './eventsIndex'
import { getAllEvents } from './getAllEvents'
import { showRoute } from './showEvent'
import { storeRoute } from './storeEvent'
import { updateRoute } from './updateEvent'

export default class EventsController {
    public async index(params: HttpContext) {
        return indexRoute(params)
    }

    public async store(params: HttpContext) {
        return storeRoute(params)
    }

    public async show(params: HttpContext) {
        return showRoute(params)
    }

    public async update(params: HttpContext) {
        return updateRoute(params)
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params)
    }

    public async all(params: HttpContext) {
        return getAllEvents(params)
    }

    public async availableRooms(params: HttpContext) {
        return availableRooms(params)
    }
}
