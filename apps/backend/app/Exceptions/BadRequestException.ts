import { Exception } from '@adonisjs/core/build/standalone'

export default class BadRequestException extends Exception {
    constructor(message: string) {
        super(message, 400, 'E_BAD_REQUEST_EXCEPTION')
    }
}
