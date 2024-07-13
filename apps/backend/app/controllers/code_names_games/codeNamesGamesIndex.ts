import CodeNamesGame from '#models/code_names_game'
import { HttpContext } from '@adonisjs/core/http'

export const codeNamesGamesIndex = async ({}: HttpContext) => {
  const games = CodeNamesGame.query().preload('rounds')

  return games
}
