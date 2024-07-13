import type { HttpContext } from '@adonisjs/core/http'
import { addCodeNamesGameRound } from './addCodeNamesGameRound.js'
import { codeNamesGamesIndex } from './codeNamesGamesIndex.js'
import { destroyCodeNamesGame } from './destroyCodeNamesGame.js'
import { showCodeNamesGame } from './showCodeNamesGame.js'
import { storeCodeNamesGame } from './storeCodeNamesGame.js'

export default class CodeNamesGamesController {
  public async index(ctx: HttpContext) {
    return codeNamesGamesIndex(ctx)
  }

  public async store(ctx: HttpContext) {
    return storeCodeNamesGame(ctx)
  }

  public async show(ctx: HttpContext) {
    return showCodeNamesGame(ctx)
  }

  public async update({ response }: HttpContext) {
    return response.notImplemented({ error: 'Not implemented yet' })
  }

  public async destroy(ctx: HttpContext) {
    return destroyCodeNamesGame(ctx)
  }

  public async addRound(ctx: HttpContext) {
    return addCodeNamesGameRound(ctx)
  }
}
