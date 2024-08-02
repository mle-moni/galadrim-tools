import CodeNamesGame from "#models/code_names_game";
import User from "#models/user";
import { imageAttachmentFromFile } from "#services/attachment";
import type { HttpContext } from "@adonisjs/core/http";
import { schema } from "@adonisjs/validator";

const storeCodeNamesGameSchema = schema.create({
    redSpyMasterId: schema.number(),
    blueSpyMasterId: schema.number(),
    image: schema.file({ size: "2mb", extnames: ["jpg", "png", "jpeg"] }),
});

export const storeCodeNamesGame = async ({ request }: HttpContext) => {
    const { blueSpyMasterId, redSpyMasterId, image } = await request.validate({
        schema: storeCodeNamesGameSchema,
    });
    await User.findOrFail(blueSpyMasterId);
    await User.findOrFail(redSpyMasterId);

    const game = await CodeNamesGame.create({
        blueSpyMasterId,
        redSpyMasterId,
        image: await imageAttachmentFromFile(image, "codeNames"),
    });

    return { message: "Partie créée", game };
};
