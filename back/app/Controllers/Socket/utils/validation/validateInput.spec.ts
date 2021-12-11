import test from 'japa'
import { Assert } from 'tests/japaTypes'
import { ObjectValidationSchema, validateInput, validateInputs } from './validateInput'

test.group('Socket input validation', () => {
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

    test('validateInput', (assert) => {
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

    test('validateInputs', (assert) => {
        testValidateInputs(assert, tests, false)
        testValidateInputs(assert, goodTests, true)
    })
})
