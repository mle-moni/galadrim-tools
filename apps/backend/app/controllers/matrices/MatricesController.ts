import Matrix from '#models/matrix'
import type { HttpContext } from '@adonisjs/core/http'

export default class MatricesController {
  async index({}: HttpContext) {
    const matrices = await Matrix.all()

    return matrices
  }
}
