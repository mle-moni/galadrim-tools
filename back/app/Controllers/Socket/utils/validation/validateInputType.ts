type TypeofTypes =  // all types of typeof
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'

export function validateInputType(input: unknown, type: TypeofTypes) {
    // eslint-disable-next-line valid-typeof
    if (typeof input !== type) {
        return {
            error: true,
            msg: `validateInputType error: expected ${typeof type} but got ${typeof input}`,
        }
    }
    return { error: false, msg: undefined }
}
