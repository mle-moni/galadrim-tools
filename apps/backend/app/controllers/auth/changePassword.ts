import type { HttpContext } from "@adonisjs/core/http";
import { rules, schema } from "@adonisjs/validator";

const changePasswordSchema = schema.create({
    password: schema.string([rules.trim()]),
});

export const changePasswordRoute = async ({ request, auth }: HttpContext) => {
    const { password } = await request.validate({
        schema: changePasswordSchema,
    });
    const user = auth.user!;
    user.password = password;
    await user.save();
    return { notification: "Le mot de passe à été modifié" };
};
