import { schema, validator } from "@adonisjs/validator";
import type { Socket } from "socket.io";
import { getSocketUser } from "../auth_restricted_events.js";

export const livePlayers: Record<string, unknown> = {};

const dataSchema = schema.create({
    x: schema.number(),
    y: schema.number(),
    skin: schema.string(),
    anim: schema.string(),
    map: schema.string(),
});

const checkData = async (dto: unknown) => {
    try {
        const params = await validator.validate({
            schema: dataSchema,
            data: dto,
        });
        return { isValid: true, params } as const;
    } catch (error) {
        return { isValid: false } as const;
    }
};

export const livePos = async (socket: Socket, data: unknown, passwd: unknown) => {
    const res = await checkData(data);
    const user = getSocketUser(socket);
    if (res.isValid && passwd === socket.id) {
        const { anim, map, skin, x, y } = res.params;
        livePlayers[user.username] = {
            psd: user.username,
            x,
            y,
            skin,
            map,
            anim,
        };
        socket.emit("livePos", livePlayers);
    }
};
