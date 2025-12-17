import BackIcon from "@mui/icons-material/ChevronLeft";
import { Autocomplete, Box, TextField } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { useCheckConnection } from "../../hooks/useCheckConnection";
import { GaladrimButton } from "../../reusableComponents/common/GaladrimButton";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import { CodeNamesStore } from "./CodeNamesStore";

export const NewCodeNamesGamePage = observer(() => {
    const { codeNamesFormStore } = useMemo(() => new CodeNamesStore(), []);
    const { authStore } = AppStore;
    useCheckConnection(authStore);

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: "/" }]} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    codeNamesFormStore.submitNewGame();
                }}
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box sx={{ width: "80%", mt: 10 }}>
                    <h1>Nouvelle Partie de Code Names 😳</h1>
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
                    />
                    {codeNamesFormStore.imageStore.imageSrc !== null && (
                        <img
                            src={codeNamesFormStore.imageStore.imageSrc}
                            alt="code names"
                            style={{ width: "400px" }}
                        />
                    )}
                    <Box sx={{ my: 2 }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                codeNamesFormStore.imageStore.setUploadedImage(e.target)
                            }
                        />
                    </Box>

                    <GaladrimButton isSubmit fullWidth={false}>
                        Commencer la partie
                    </GaladrimButton>
                </Box>
            </form>
        </>
    );
});

export default NewCodeNamesGamePage;
