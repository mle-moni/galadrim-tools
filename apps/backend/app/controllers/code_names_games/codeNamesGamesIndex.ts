import CodeNamesGame from "#models/code_names_game";

export const codeNamesGamesIndex = async () => {
    const games = CodeNamesGame.query().preload("rounds");

    return games;
};
