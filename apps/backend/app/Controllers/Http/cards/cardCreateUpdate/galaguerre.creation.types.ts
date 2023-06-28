import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export interface GalaguerreCardCreationContext {
    cardId?: number
    trx: TransactionClientContract
    ctx: HttpContextContract
}
