import Tag from "#models/tag";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import { validateTagsParams } from "./storeTag.js";

export const updateRoute = async ({ params, request, response }: HttpContext) => {
    const tag = await Tag.findOrFail(params.id);
    const { name } = await validateTagsParams(request);
    const found = await Tag.query().whereILike("name", name).andWhereNot("id", tag.id).first();

    if (found) {
        return response.badRequest({ error: "Ce tag existe déjà" });
    }

    tag.name = name;
    await tag.save();
    Ws.io.to("connectedSockets").emit("updateTag", tag);
    return tag;
};
