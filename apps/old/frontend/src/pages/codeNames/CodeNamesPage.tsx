import { Visibility, VisibilityOff } from "@mui/icons-material";
import BackIcon from "@mui/icons-material/ChevronLeft";
import { Button, IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { useCheckConnection } from "../../hooks/useCheckConnection";
import { CenteredDiv } from "../../reusableComponents/common/CenteredDiv";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import { CodeNamesStore } from "./CodeNamesStore";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const CodeNamesPage = observer(() => {
    const { authStore } = AppStore;
    useCheckConnection(authStore);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const store = useMemo(() => new CodeNamesStore(), []);

    const draw = useCallback(() => {
        if (!canvasRef.current) return;

        store.setCanvas(canvasRef.current);
    }, [store]);

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: "/" }]} />

            <CenteredDiv style={{ height: "80vh", flexDirection: "column" }}>
                <canvas
                    ref={canvasRef}
                    style={{ borderRadius: 4, cursor: "pointer", maxWidth: "80%" }}
                    id="canvas"
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onClick={(e) => store?.onClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                />

                {store !== null && store._canvas !== null && <h1>{store.numberOfMatricesText}</h1>}

                {store !== null && store.filteredMatrices.length === 1 && (
                    <IconButton
                        onClick={() => {
                            store.setShowResult(!store.showResult);
                        }}
                    >
                        {store.showResult ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                )}

                {store._canvas === null && <Button onClick={draw}>Commencer</Button>}
            </CenteredDiv>
        </>
    );
});

export default CodeNamesPage;
