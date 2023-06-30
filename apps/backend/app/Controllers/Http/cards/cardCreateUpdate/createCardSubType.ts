import { createGalaguerreMinion } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreMinion'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { CardDto } from 'App/Controllers/Http/cards/cardDto'
import BadRequestException from 'App/Exceptions/BadRequestException'

interface RetType {
    minionId: number | null
    spellId: number | null
    weaponId: number | null
}

export const createCardSubType = async (
    cardType: CardDto['type'],
    params: GalaguerreCardCreationContext
): Promise<RetType> => {
    const RET = {
        minionId: null,
        spellId: null,
        weaponId: null,
    }
    switch (cardType) {
        case 'MINION':
            const minion = await createGalaguerreMinion(params)
            return { ...RET, minionId: minion.id }
        default:
            throw new BadRequestException(`Type '${cardType}' not implemented`)
    }
}
