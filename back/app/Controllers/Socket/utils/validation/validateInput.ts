export type ObjectValidationEntry = {
    key: string
    cases: Array<any>
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
    for (const entry of objSchema.keys) {
        if (!checkPossibleValues((input as any)[entry.key], entry.cases)) return false
    }
    return true
}

function checkPossibleValues(value: unknown, possibleValues: ObjectValidationEntry['cases']) {
    if (value === undefined) return false
    for (const possibleValue of possibleValues) {
        if (value === possibleValue) return true
    }
    return false
}
