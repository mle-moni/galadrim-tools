export const mapGroupBy = <K, T>(
    iterable: Iterable<T>,
    callbackfn: (value: T, index: number) => K,
) => {
    const map = new Map();
    let i = 0;
    for (const value of iterable) {
        // biome-ignore lint/style/useSingleVarDeclarator: <explanation>
        const key = callbackfn(value, i++),
            list = map.get(key);
        list ? list.push(value) : map.set(key, [value]);
    }
    return map;
};
