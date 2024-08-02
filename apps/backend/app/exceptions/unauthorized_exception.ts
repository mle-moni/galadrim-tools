import { Exception } from "@adonisjs/core/exceptions";

export default class UnauthorizedException extends Exception {
    constructor(message?: string) {
        super(message ?? "Vous devez être connecté", {
            status: 401,
            code: "E_UNAUTHORIZED_EXCEPTION",
        });
    }
}
