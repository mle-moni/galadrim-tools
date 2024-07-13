import type { HttpContext } from '@adonisjs/core/http'
import Matrix from '#app/Models/Matrix'

export default class MatricesController {
    async index({}: HttpContext) {
        const matrices = await Matrix.all()

        return matrices
    }
}
