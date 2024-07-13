import { HttpContext } from '@adonisjs/core/http'
import CodeNamesGame from '#app/Models/CodeNamesGame'

export const codeNamesGamesIndex = async ({}: HttpContext) => {
    const games = CodeNamesGame.query().preload('rounds')

    return games
}
