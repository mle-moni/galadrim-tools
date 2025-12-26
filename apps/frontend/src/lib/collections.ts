export function upsertById<T extends { id: number }>(
    items: readonly T[] | undefined,
    incoming: T,
    merge?: (previous: T, next: T) => T,
): T[] {
    const list = items ?? [];
    const existingIndex = list.findIndex((item) => item.id === incoming.id);
    if (existingIndex === -1) return [incoming, ...list];

    const previous = list[existingIndex];
    const nextItem = previous && merge ? merge(previous, incoming) : incoming;

    const next = list.slice();
    next[existingIndex] = nextItem;
    return next;
}

export function removeById<T extends { id: number }>(
    items: readonly T[] | undefined,
    id: number,
): T[] | undefined {
    if (!items) return items;
    return items.filter((item) => item.id !== id);
}
