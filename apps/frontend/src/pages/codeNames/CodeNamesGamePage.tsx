import { Visibility, VisibilityOff } from "@mui/icons-material";
import BackIcon from "@mui/icons-material/ChevronLeft";
import { Autocomplete, Box, IconButton, TextField } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { AppStore } from "../../globalStores/AppStore";
import { useCheckConnection } from "../../hooks/useCheckConnection";
import { GaladrimButton } from "../../reusableComponents/common/GaladrimButton";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import { CodeNamesStore } from "./CodeNamesStore";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const CodeNamesGamePage = observer(() => {
    const { id } = useParams();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const store = useMemo(() => new CodeNamesStore(), []);
    const codeNamesFormStore = store.codeNamesFormStore;

    useEffect(() => {
        if (id === undefined) return;
        const numberId = +id;
        if (Number.isNaN(numberId)) return;
        store.fetchGame(numberId);
    }, [id, store]);

    useEffect(() => {
        if (store._canvas !== null) return;
        if (!canvasRef.current) return;

        store.setCanvas(canvasRef.current);
    }, [store._canvas, store]);

    const { authStore } = AppStore;
    useCheckConnection(authStore);

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: "/" }]} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    store.submitNewRound();
                }}
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box sx={{ width: "80%", mt: 10 }}>
                    <Autocomplete
                        disablePortal
                        options={AppStore.userOptions}
                        value={codeNamesFormStore.blueSpyMasterOption}
                        renderInput={(params) => (
                            <TextField {...params} required label="Blue Spy Master" />
                        )}
                        onChange={(_e, option) => {
                            if (option) {
                                codeNamesFormStore.setBlueSpyMaster(option.value);
                            }
                        }}
                        isOptionEqualToValue={(a, b) => a.value === b.value}
                        filterSelectedOptions
                        disabled
                    />

                    <Autocomplete
                        sx={{ my: 2 }}
                        disablePortal
                        options={AppStore.userOptions}
                        value={codeNamesFormStore.redSpyMasterOption}
                        renderInput={(params) => (
                            <TextField {...params} required label="Red Spy Master" />
                        )}
                        onChange={(_e, option) => {
                            if (option) {
                                codeNamesFormStore.setRedSpyMaster(option.value);
                            }
                        }}
                        isOptionEqualToValue={(a, b) => a.value === b.value}
                        filterSelectedOptions
                        disabled
                    />

                    {codeNamesFormStore.imageStore.imageSrc !== null && (
                        <img
                            src={codeNamesFormStore.imageStore.imageSrc}
                            alt="code names"
                            style={{ width: "400px" }}
                        />
                    )}

                    <canvas
                        ref={canvasRef}
                        style={{ borderRadius: 4, cursor: "pointer", maxWidth: "80%" }}
                        id="canvas"
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        onClick={(e) =>
                            store?.onClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                        }
                    />

                    {store !== null && store.filteredMatrices.length === 1 && (
                        <IconButton
                            sx={{ opacity: 0 }}
                            onClick={() => {
                                store.setShowResult(!store.showResult);
                            }}
                        >
                            {store.showResult ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    )}

                    <br />

                    <Autocomplete
                        disablePortal
                        options={codeNamesFormStore.gameSpyMasterOptions}
                        value={codeNamesFormStore.roundSpyMasterOption}
                        renderInput={(params) => (
                            <TextField {...params} required label="Round Spy Master" />
                        )}
                        onChange={(_e, option) => {
                            if (option) {
                                codeNamesFormStore.setRoundSpyMaster(option.value);
                            }
                        }}
                        isOptionEqualToValue={(a, b) => a.value === b.value}
                        filterSelectedOptions
                        sx={{ my: 2 }}
                    />

                    <TextField
                        value={codeNamesFormStore.announce.text}
                        label="Announce (comma separated words)"
                        onChange={(e) => codeNamesFormStore.announce.setText(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        value={codeNamesFormStore.clueWord.text}
                        label="Clue word"
                        onChange={(e) => codeNamesFormStore.clueWord.setText(e.target.value)}
                        required
                        fullWidth
                        sx={{ my: 2 }}
                    />

                    <TextField
                        value={codeNamesFormStore.clueNumber.text}
                        label="Clue number"
                        type="number"
                        onChange={(e) => codeNamesFormStore.clueNumber.setText(e.target.value)}
                        required
                    />

                    <br />

                    <GaladrimButton sx={{ my: 2 }} isSubmit fullWidth={false}>
                        Ajouter un round
                    </GaladrimButton>
                </Box>
            </form>
        </>
    );
});

export default CodeNamesGamePage;
