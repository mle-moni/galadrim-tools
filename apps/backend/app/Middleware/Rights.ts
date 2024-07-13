import { AllRights, hasRights } from '@galadrim-tools/shared'
import { HttpContext } from '@adonisjs/core/http'
import ForbiddenException from '../Exceptions/ForbiddenException.js'
import UnauthorizedException from '../Exceptions/UnauthorizedException.js'

// check if users has rights, throw if not
export default class RightsMiddleware {
    protected async hasRights(auth: HttpContext['auth'], rightsWanted: AllRights[]) {
        if (auth.user === undefined) {
            throw new UnauthorizedException()
        }
        if (hasRights(auth.user.rights, rightsWanted)) {
            return true
        }
        throw new ForbiddenException()
    }

    public async handle(
        { auth }: HttpContext,
        next: () => Promise<void>,
        rightsWanted: AllRights[]
    ) {
        await this.hasRights(auth, rightsWanted)
        await next()
    }
}
