export const BOOLEAN_COLUMN = {
    prepare: (value: 0 | 1) => Boolean(value),
    serialize: (value: 0 | 1) => Boolean(value),
};
