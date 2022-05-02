import { AllRights, hasRights, RIGHTS } from '../rights'

describe('rights', () => {
    it('hasRights', () => {
        type SampleType = { rights: number; rightsWanted: AllRights[]; expected: boolean }
        const samples = [
            { rights: RIGHTS.DEFAULT, rightsWanted: ['DEFAULT'], expected: true },
            { rights: RIGHTS.DEFAULT, rightsWanted: ['EVENT_ADMIN'], expected: false },
            { rights: RIGHTS.EVENT_ADMIN, rightsWanted: ['EVENT_ADMIN'], expected: true },
            {
                rights: RIGHTS.EVENT_ADMIN + RIGHTS.USER_ADMIN,
                rightsWanted: ['EVENT_ADMIN'],
                expected: true,
            },
            {
                rights: RIGHTS.EVENT_ADMIN + RIGHTS.USER_ADMIN,
                rightsWanted: ['EVENT_ADMIN', 'USER_ADMIN'],
                expected: true,
            },
            {
                rights: RIGHTS.USER_ADMIN + RIGHTS.RIGHTS_ADMIN,
                rightsWanted: ['RIGHTS_ADMIN'],
                expected: true,
            },
            {
                rights: RIGHTS.RIGHTS_ADMIN,
                rightsWanted: ['RIGHTS_ADMIN'],
                expected: true,
            },
            {
                rights: RIGHTS.EVENT_ADMIN + RIGHTS.USER_ADMIN + RIGHTS.RIGHTS_ADMIN,
                rightsWanted: ['EVENT_ADMIN', 'USER_ADMIN', 'RIGHTS_ADMIN', 'DEFAULT'],
                expected: true,
            },
        ] as SampleType[]

        for (const { rights, rightsWanted, expected } of samples) {
            expect(hasRights(rights, rightsWanted)).toEqual(expected)
        }
    })
})
