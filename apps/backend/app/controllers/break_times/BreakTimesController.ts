import type { HttpContext } from '@adonisjs/core/http'
import { breakTimesIndex } from './breakTimesIndex.js'

export default class BreakTimesController {
  public async index(ctx: HttpContext) {
    return breakTimesIndex(ctx)
  }

  public async store(ctx: HttpContext) {
    return ctx.response.notImplemented({ error: 'not implemented' })
  }

  public async show(ctx: HttpContext) {
    return ctx.response.notImplemented({ error: 'not implemented' })
  }

  public async updat(ctx: HttpContext) {
    return ctx.response.notImplemented({ error: 'not implemented' })
  }

  public async destro(ctx: HttpContext) {
    return ctx.response.notImplemented({ error: 'not implemented' })
  }
}
