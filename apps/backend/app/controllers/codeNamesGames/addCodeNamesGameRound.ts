import CodeNamesGame from '#models/code_names_game'
import CodeNamesGameRound from '#models/code_names_game_round'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/validator'

const roundSchema = schema.create({
  spyMasterId: schema.number(),
  announce: schema.string.optional(),
  clueWord: schema.string(),
  clueNumber: schema.number(),
  red: schema.number(),
  blue: schema.number(),
  white: schema.number(),
  black: schema.number(),
})

export const addCodeNamesGameRound = async ({ params, request }: HttpContext) => {
  const roundDto = await request.validate({ schema: roundSchema })
  await User.findOrFail(roundDto.spyMasterId)

  const game = await CodeNamesGame.findOrFail(params.id)
  const round = await CodeNamesGameRound.create({ ...roundDto, gameId: game.id })

  return { message: 'Round créé', round }
}
