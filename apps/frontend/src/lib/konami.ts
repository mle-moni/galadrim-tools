export function createKeySequenceMatcher(sequence: readonly string[]) {
    const normalizedSequence = sequence.map((k) => k.toLowerCase());

    let index = 0;

    return {
        reset() {
            index = 0;
        },
        feed(key: string) {
            const normalizedKey = key.toLowerCase();

            if (normalizedKey === normalizedSequence[index]) {
                index += 1;
                if (index >= normalizedSequence.length) {
                    index = 0;
                    return true;
                }
                return false;
            }

            // Overlap: if the wrong key matches the start, keep progress.
            index = normalizedKey === normalizedSequence[0] ? 1 : 0;
            return false;
        },
    };
}

export const KONAMI_SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
] as const;
