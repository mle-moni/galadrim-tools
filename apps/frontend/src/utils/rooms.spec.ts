import { describe, expect, test } from 'vitest'
import { WorkplaceSvgRoom } from '../reusableComponents/WorkplaceSvg/WorkplaceSvg'
import { isReservableRoom } from './rooms'

describe('rooms', () => {
    test('isReservableRoom', () => {
        const samples: [WorkplaceSvgRoom, boolean][] = [
            ['Adier', true],
            ['Babyfoot', false],
            ['Coffre', true],
            ['Corridor', false],
            ['Debarras', false],
            ['Kitchen', true],
            ['Manguier', true],
            ['Other', false],
            ['PetitCouloir', false],
            ['Toilets', false],
            ['Turing', true],
            ['Vador', true],
            ['Work1', false],
            ['Work2', false],
            ['Work3', false],
            ['Work4', false],
        ]

        for (const [room, expected] of samples) {
            expect(isReservableRoom(room)).to.eq(expected)
        }
    })
})
