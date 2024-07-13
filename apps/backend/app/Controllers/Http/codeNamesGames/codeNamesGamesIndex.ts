import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CodeNamesGame from '#app/Models/CodeNamesGame'

export const codeNamesGamesIndex = async ({}: HttpContextContract) => {
    const games = CodeNamesGame.query().preload('rounds')

    return games
}
