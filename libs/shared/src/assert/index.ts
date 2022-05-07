export function _assert<T>(value: T, message?: string): asserts value is NonNullable<T> {
    if (value !== undefined && value !== null) {
        return
    }
    const defaultMessage = `assertion failed for value '${value}' : it should not be null nor undefined`
    throw new Error(message ?? defaultMessage)
}

export const _assertTrue = (value: boolean, message?: string): asserts value => {
    if (!value) {
        throw new Error(message ?? `assertion failed for value '${value}' : it should not be false`)
    }
}
