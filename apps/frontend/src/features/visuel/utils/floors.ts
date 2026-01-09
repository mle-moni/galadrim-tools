export function formatFloorLabel(floor: number) {
    if (floor === 1) return "1er étage";
    return `${floor}ème étage`;
}

export function formatFloorShort(floor: number) {
    if (floor === 1) return "1er";
    return `${floor}ème`;
}
