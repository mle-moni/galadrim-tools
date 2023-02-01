import { schema, validator } from '@ioc:Adonis/Core/Validator'
import PlatformerResult from 'App/Models/PlatformerResult'
import Ws from 'App/Services/Ws'
import { Socket } from 'socket.io'
import { getSocketUser } from '../authRestrictedEvents'

const dtoSchema = schema.create({
    jumps: schema.number(),
    time: schema.number(),
    password: schema.string(),
})

const checkData = async (dto: unknown) => {
    try {
        const params = await validator.validate({
            schema: dtoSchema,
            data: dto,
        })
        return { isValid: true, params } as const
    } catch (error) {
        return { isValid: false } as const
    }
}

export const scoreTournois = async (socket: Socket, data: unknown, mapId: unknown) => {
    if (typeof mapId !== 'number' || mapId < 1 || mapId > 4) {
        return
    }
    const res = await checkData(data)

    if (!res.isValid) return

    const user = getSocketUser(socket)
    const { jumps, password, time } = res.params

    if (password === socket.id) {
        const score = Math.round((jumps + time) * 100)

        const result = await PlatformerResult.create({ userId: user.id, jumps, time, score, mapId })
        const scoresModels = await PlatformerResult.query()
            .where('mapId', mapId)
            .orderBy('score', 'asc')

        const scores = scoresModels.map((model) => model.toJSON())

        Ws.io.to('connectedSockets').emit('game.tournois.newResult', result.toJSON())
        Ws.io.to('connectedSockets').emit('ladderTournois', scores)
    }
}
