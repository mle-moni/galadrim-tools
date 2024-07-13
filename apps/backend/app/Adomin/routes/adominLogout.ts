import { HttpContext } from '@adonisjs/core/http'

export const adominLogout = async ({ auth }: HttpContext) => {
    await auth.use('api').logout()

    return { message: 'Au revoir !' }
}
