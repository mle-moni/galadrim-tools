import PlatformerResult from "#models/platformer_result";
import { Ws } from "#services/ws";
import { schema, validator } from "@adonisjs/validator";
import type { Socket } from "socket.io";
import { getSocketUser } from "../auth_restricted_events.js";
import { CONNECTED_SOCKETS } from "../socket_constants.js";

const dtoSchema = schema.create({
    jumps: schema.number(),
    time: schema.number(),
    password: schema.string(),
});

const checkData = async (dto: unknown) => {
    try {
        const params = await validator.validate({
            schema: dtoSchema,
            data: dto,
        });
        return { isValid: true, params } as const;
    } catch (error) {
        return { isValid: false } as const;
    }
};

export const scoreTournois = async (socket: Socket, data: unknown, mapId: unknown) => {
    if (typeof mapId !== "number" || mapId < 1 || mapId > 4) {
        return;
    }
    const res = await checkData(data);

    if (!res.isValid) return;

    const user = getSocketUser(socket);
    const { jumps, password, time } = res.params;

    if (password === socket.id) {
        const score = Math.round((jumps + time) * 100);

        const result = await PlatformerResult.create({
            userId: user.id,
            jumps,
            time,
            score,
            mapId,
        });
        const scoresModels = await PlatformerResult.query()
            .where("mapId", mapId)
            .orderBy("score", "asc");

        const scores = scoresModels.map((model) => model.toJSON());

        Ws.io.to(CONNECTED_SOCKETS).emit("game.tournois.newResult", result.toJSON());
        Ws.io.to(CONNECTED_SOCKETS).emit("ladderTournois", scores);
    }
};
