import CodeNamesGame from "#models/code_names_game";
import type { HttpContext } from "@adonisjs/core/http";

export const showCodeNamesGame = async ({ params }: HttpContext) => {
    return CodeNamesGame.query().where("id", params.id).preload("rounds").firstOrFail();
};
