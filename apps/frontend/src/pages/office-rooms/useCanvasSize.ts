import { useMemo } from "react";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";

export const useCanvasSize = (numberOfFloors: number) => {
    const { width, height } = useWindowDimensions();
    const { canvasWidth, canvasHeight } = useMemo(
        () => getCanvasSize(width, height),
        [width, height],
    );

    return {
        canvasWidth: canvasWidth / numberOfFloors,
        canvasHeight: canvasHeight / numberOfFloors,
    };
};

/** get canvas size to keep 16:9 ratio */
const getCanvasSize = (windowWidth: number, windowHeight: number) => {
    const maxHeight = Math.floor(windowHeight - 450);

    const canvasWidth = Math.floor(windowWidth * 0.8);
    const canvasHeight = Math.floor(canvasWidth * (9 / 16));

    if (canvasHeight > maxHeight) {
        return {
            canvasWidth: maxHeight * (16 / 9),
            canvasHeight: maxHeight,
        };
    }

    return { canvasWidth, canvasHeight };
};
