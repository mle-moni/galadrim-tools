import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { availableRooms } from 'App/Controllers/Http/events/availableRooms'
import { destroyRoute } from './destroyEvent'
import { indexRoute } from './eventsIndex'
import { getAllEvents } from './getAllEvents'
import { showRoute } from './showEvent'
import { storeRoute } from './storeEvent'
import { updateRoute } from './updateEvent'

export default class EventsController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }

    public async store(params: HttpContextContract) {
        return storeRoute(params)
    }

    public async show(params: HttpContextContract) {
        return showRoute(params)
    }

    public async update(params: HttpContextContract) {
        return updateRoute(params)
    }

    public async destroy(params: HttpContextContract) {
        return destroyRoute(params)
    }

    public async all(params: HttpContextContract) {
        return getAllEvents(params)
    }

    public async availableRooms(params: HttpContextContract) {
        return availableRooms(params)
    }
}
