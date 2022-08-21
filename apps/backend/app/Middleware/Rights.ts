import { AllRights, hasRights } from '@galadrim-tools/shared/src'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from '../Exceptions/ForbiddenException'
import UnauthorizedException from '../Exceptions/UnauthorizedException'

// check if users has rights, throw if not
export default class RightsMiddleware {
    protected async hasRights(auth: HttpContextContract['auth'], rightsWanted: AllRights[]) {
        if (auth.user === undefined) {
            throw new UnauthorizedException()
        }
        if (hasRights(auth.user.rights, rightsWanted)) {
            return true
        }
        throw new ForbiddenException()
    }

    public async handle(
        { auth }: HttpContextContract,
        next: () => Promise<void>,
        rightsWanted: AllRights[]
    ) {
        await this.hasRights(auth, rightsWanted)
        await next()
    }
}
