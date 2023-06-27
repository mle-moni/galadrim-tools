import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GalaguerreCard from 'App/Models/GalaguerreCard'

export const cardsIndex = async ({}: HttpContextContract) => {
    const cards = await GalaguerreCard.query()
}
