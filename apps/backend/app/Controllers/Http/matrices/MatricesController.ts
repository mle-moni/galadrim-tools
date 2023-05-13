import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Matrix from 'App/Models/Matrix'

export default class MatricesController {
    async index({}: HttpContextContract) {
        const matrices = await Matrix.all()

        return matrices
    }
}
