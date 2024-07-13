import { HttpContext } from '@adonisjs/core/http'
import { rules, schema } from '@adonisjs/validator'
import CodeNamesGame from '#app/Models/CodeNamesGame'
import CodeNamesGameRound from '#app/Models/CodeNamesGameRound'

const roundSchema = schema.create({
    spyMasterId: schema.number([rules.exists({ column: 'id', table: 'users' })]),
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

    const game = await CodeNamesGame.findOrFail(params.id)
    const round = await CodeNamesGameRound.create({ ...roundDto, gameId: game.id })

    return { message: 'Round créé', round }
}
