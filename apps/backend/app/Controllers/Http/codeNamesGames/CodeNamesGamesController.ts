import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { addCodeNamesGameRound } from '#app/Controllers/Http/codeNamesGames/addCodeNamesGameRound'
import { codeNamesGamesIndex } from '#app/Controllers/Http/codeNamesGames/codeNamesGamesIndex'
import { destroyCodeNamesGame } from '#app/Controllers/Http/codeNamesGames/destroyCodeNamesGame'
import { showCodeNamesGame } from '#app/Controllers/Http/codeNamesGames/showCodeNamesGame'
import { storeCodeNamesGame } from '#app/Controllers/Http/codeNamesGames/storeCodeNamesGame'

export default class CodeNamesGamesController {
    public async index(ctx: HttpContextContract) {
        return codeNamesGamesIndex(ctx)
    }

    public async store(ctx: HttpContextContract) {
        return storeCodeNamesGame(ctx)
    }

    public async show(ctx: HttpContextContract) {
        return showCodeNamesGame(ctx)
    }

    public async update({ response }: HttpContextContract) {
        return response.notImplemented({ error: 'Not implemented yet' })
    }

    public async destroy(ctx: HttpContextContract) {
        return destroyCodeNamesGame(ctx)
    }

    public async addRound(ctx: HttpContextContract) {
        return addCodeNamesGameRound(ctx)
    }
}
