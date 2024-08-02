import { Exception } from "@adonisjs/core/exceptions";

export default class ForbiddenException extends Exception {
    constructor(message?: string) {
        super(message ?? "Vous ne pouvez pas accéder à cette ressource", {
            status: 403,
            code: "E_FORBIDDEN_EXCEPTION",
        });
    }
}
