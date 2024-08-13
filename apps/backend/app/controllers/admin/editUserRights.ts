import User from "#models/user";
import { Ws } from "#services/ws";
import type { HttpContext } from "@adonisjs/core/http";
import { schema } from "@adonisjs/validator";

const editUserRightsSchema = schema.create({
    id: schema.number(),
    rights: schema.number(),
});

export const editUserRightsRoute = async ({ request, response }: HttpContext) => {
    const { id, rights } = await request.validate({
        schema: editUserRightsSchema,
        messages: {
            "id.required": `L'id de l'utilisateur est requis`,
            "id.number": `L'id doit être un nombre`,
            "rights.required": `Le champ 'droits' est requis`,
            "rights.number": `Le champ 'droits' doit être un entier`,
        },
    });
    const user = await User.find(id);
    if (!user) {
        return response.badRequest({
            error: `Impossible de trouver l'utilisateur avec l'id ${id}`,
        });
    }
    user.rights = rights;
    await user.save();

    Ws.io.to(user.personalSocket).emit("updateRights", rights);

    return { notification: "Les droits ont été mis à jour" };
};
