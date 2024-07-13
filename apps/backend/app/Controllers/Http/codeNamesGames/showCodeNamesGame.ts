import { HttpContext } from '@adonisjs/core/http'
import CodeNamesGame from '#app/Models/CodeNamesGame'

export const showCodeNamesGame = async ({ params }: HttpContext) => {
    return CodeNamesGame.query().where('id', params.id).preload('rounds').firstOrFail()
}
