import { Assert } from '@japa/assert'
import { test } from '@japa/runner'
import {
    ObjectValidationSchema,
    validateInput,
    validateInputs,
} from '../../../../Models/User/Controllers/Socket/utils/validation/validateInput'

test.group('Object input validation', () => {
    const tests: TestValue<InputValidationTest, boolean>[] = [
        {
            input: {
                value: { pouet: true, tada: 'hehe' },
                schema: {
                    keys: [
                        { key: 'pouet', cases: [true, false] },
                        { key: 'tada', cases: ['hoho', 'hihi', 'hehe'] },
                    ],
                },
            },
            expected: true,
        },
        {
            input: {
                value: { pouet: true, tada: 'hehe' },
                schema: {
                    keys: [
                        { key: 'pouet', cases: [true, false] },
                        { key: 'tada', cases: ['hoho', 'hihi', 'hehe'] },
                        { key: 'rat', cases: ['champ', 'ville'] },
                    ],
                },
            },
            expected: false,
        },
        {
            input: {
                value: { pouet: true, tada: 'hehe', rat: 'ville' },
                schema: {
                    keys: [
                        { key: 'pouet', cases: [true, false] },
                        { key: 'tada', cases: ['hoho', 'hihi', 'hehe'] },
                        { key: 'rat', cases: ['champ', 'ville'] },
                    ],
                },
            },
            expected: true,
        },
    ]

    type TestValue<Input, Expected> = {
        input: Input
        expected: Expected
    }

    type InputValidationTest = {
        value: any
        schema: ObjectValidationSchema
    }

    test('validateInput', ({ assert }) => {
        for (const test of tests) {
            const result = validateInput(test.input.value, test.input.schema)
            assert.equal(result, test.expected)
        }
    })

    const testValidateInputs = (
        assert: Assert,
        tests: TestValue<InputValidationTest, boolean>[],
        expects: boolean
    ) => {
        const inputs = tests.map((test) => test.input.value)
        const schemas = tests.map((test) => test.input.schema)
        assert.equal(validateInputs(inputs, schemas), expects)
    }

    const goodTests = tests.filter((test) => test.expected === true)

    test('validateInputs', ({ assert }) => {
        testValidateInputs(assert, tests, false)
        testValidateInputs(assert, goodTests, true)
    })

    const typeTests: TestValue<InputValidationTest, boolean>[] = [
        {
            input: {
                value: { pouet: true, tada: 'hehe' },
                schema: {
                    keys: [
                        { key: 'pouet', cases: ['#boolean'] },
                        { key: 'tada', cases: ['#string'] },
                    ],
                },
            },
            expected: true,
        },
        {
            input: {
                value: { pouet: true },
                schema: {
                    keys: [{ key: 'pouet', cases: ['#string'] }],
                },
            },
            expected: false,
        },
        {
            input: {
                value: { pouet: true },
                schema: {
                    keys: [{ key: 'pouet', cases: ['#string', '#boolean'] }],
                },
            },
            expected: true,
        },
        {
            input: {
                value: { pouet: ['test'] },
                schema: {
                    keys: [{ key: 'pouet', cases: ['#string', '#boolean'] }],
                },
            },
            expected: false,
        },
        {
            input: {
                value: { pouet: ['test'] },
                schema: {
                    keys: [{ key: 'pouet', cases: ['#object'] }],
                },
            },
            expected: true,
        },
    ]

    test('validateInput types', ({ assert }) => {
        for (const test of typeTests) {
            const result = validateInput(test.input.value, test.input.schema)
            assert.equal(result, test.expected)
        }
    })
})
