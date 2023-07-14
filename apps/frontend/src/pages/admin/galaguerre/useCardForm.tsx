import { zodResolver } from '@hookform/resolvers/zod'
import { UseFormReturn, useForm } from 'react-hook-form'
import { CardForm, zCardForm } from './cardForm'

const DEFAULT_MINION_POWER = {
    hasCharge: false,
    hasTaunt: false,
    hasWindfury: false,
    isPoisonous: false,
}

export const useCardForm = () => {
    const res = useForm<CardForm>({
        resolver: zodResolver(zCardForm),
        defaultValues: {
            label: '',
            cost: 0,
            cardMode: 'CREATION',
            type: 'MINION',
            minion: {
                attack: 1,
                health: 1,
                minionPower: DEFAULT_MINION_POWER,
                battlecries: [],
            },
        },
        mode: 'onBlur',
    })

    return res
}

export interface WithCardFormData {
    formData: UseFormReturn<CardForm>
}
