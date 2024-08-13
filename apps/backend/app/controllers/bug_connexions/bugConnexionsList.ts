import BugConnexion from "#models/bug_connexion";

export const bugConnexionsList = async () => {
    const bugConnexions = await BugConnexion.all();

    return bugConnexions;
};
