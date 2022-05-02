import { Exception } from '@adonisjs/core/build/standalone'

export default class UnauthorizedException extends Exception {
    constructor(message?: string) {
        super(message ?? 'Vous devez être connecté', 401, 'E_UNAUTHORIZED_EXCEPTION')
    }
}
