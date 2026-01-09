import { type RefObject, useEffect, useState } from "react";

export function useElementSize<TElement extends HTMLElement>(ref: RefObject<TElement | null>) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            setSize({ width: el.clientWidth, height: el.clientHeight });
        };

        update();

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        return () => ro.disconnect();
    }, [ref]);

    return size;
}
