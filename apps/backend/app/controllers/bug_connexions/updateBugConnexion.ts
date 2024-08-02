import BugConnexion from "#models/bug_connexion";
import type { HttpContext } from "@adonisjs/core/http";
import { validateResourceId } from "../../helpers/validate_resource_id.js";
import { bugConnexionSchema } from "./bugConnexionSchema.js";

export const updateBugConnexion = async ({ params, request, bouncer }: HttpContext) => {
    const { id } = await validateResourceId(params);
    const { details, networkName, room } = await request.validate({ schema: bugConnexionSchema });
    const foundBugConnexion = await BugConnexion.findOrFail(id);

    await bouncer.with("ResourcePolicy").authorize("viewUpdateOrDelete", foundBugConnexion);

    const updatedBugConnexion = await BugConnexion.updateOrCreate(
        { id },
        { details, networkName, room },
    );

    return { message: "BugConnexion updated", updatedBugConnexion };
};
