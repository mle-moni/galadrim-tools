import ForbiddenException from '#exceptions/forbidden_exception'
import UnauthorizedException from '#exceptions/unauthorized_exception'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AllRights, hasRights } from '@galadrim-tools/shared'

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

  async handle(ctx: HttpContext, next: NextFn, rightsWanted: AllRights[]) {
    await this.hasRights(ctx.auth, rightsWanted)

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
