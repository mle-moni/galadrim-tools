import { TypeofTypes, validateInputType } from './validateInputType'

type CaseTypeofTypes = `#${TypeofTypes}`

export type ObjectValidationEntry = {
    key: string
    cases: Array<string | number | boolean | CaseTypeofTypes>
}

export type ObjectValidationSchema = {
    keys: ObjectValidationEntry[]
}

export function validateInputs(inputs: unknown[], objectsSchemas: ObjectValidationSchema[]) {
    for (let i = 0; i < inputs.length && i < objectsSchemas.length; ++i) {
        if (!validateInput(inputs[i], objectsSchemas[i])) return false
    }
    return true
}

export function validateInput(input: unknown, objSchema: ObjectValidationSchema) {
    if (!input) return false
    return objSchema.keys.every((entry) =>
        checkPossibleValues((input as any)[entry.key], entry.cases)
    )
}

function checkPossibleValues(value: unknown, possibleValues: ObjectValidationEntry['cases']) {
    if (value === undefined) return false

    return possibleValues.some((possibleValue) => {
        if (value === possibleValue) return true
        const typeToCheck = getType(possibleValue)
        return typeToCheck && !validateInputType(value, typeToCheck).error
    })
}

function getType(possibleValue: ObjectValidationEntry['cases'][number]) {
    const types: ObjectValidationEntry['cases'] = [
        '#string',
        '#number',
        '#bigint',
        '#boolean',
        '#symbol',
        '#undefined',
        '#object',
        '#function',
    ]
    if (types.includes(possibleValue)) {
        const typeToParse = possibleValue as CaseTypeofTypes
        return typeToParse.slice(1) as TypeofTypes
    }
    return undefined
}
