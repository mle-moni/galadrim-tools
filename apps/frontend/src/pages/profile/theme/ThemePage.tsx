import { ArrowBack } from "@mui/icons-material";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { AppStore } from "../../../globalStores/AppStore";
import { THEME_FIELDS_TO_LABEL, THEME_KEYS_WITHOUT_NAME } from "../../../globalStores/ThemeStore";
import { CenteredDiv } from "../../../reusableComponents/common/CenteredDiv";
import { GaladrimButton } from "../../../reusableComponents/common/GaladrimButton";
import { RoundedLinks } from "../../../reusableComponents/common/RoundedLinks";
import MainLayout from "../../../reusableComponents/layouts/MainLayout";
import { THEME_OPTIONS, THEME_OPTIONS_KEYS, type ThemeName } from "../../../theme/galadrimThemes";
import { ThemeOfficeRoomCalendar } from "./ThemeOfficeRoomCalendar";

export const ThemePage = observer(() => {
    const {
        authStore: { themeStore },
    } = AppStore;

    return (
        <MainLayout fullscreen>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 800,
                    }}
                >
                    <Typography sx={{ fontSize: 20, mb: 2 }}>
                        Customiser le thème de l'application :
                    </Typography>

                    <FormControl fullWidth sx={{ my: 4 }}>
                        <InputLabel id="theme-select-label">Thème pré-configuré</InputLabel>
                        <Select
                            labelId="theme-select-label"
                            value={themeStore.themeKey ?? ""}
                            label="Theme pré-configuré"
                            onChange={(e) =>
                                themeStore.setThemeKey((e.target.value || null) as ThemeName | null)
                            }
                        >
                            {THEME_OPTIONS_KEYS.map((themeName) => (
                                <MenuItem key={themeName} value={themeName}>
                                    {THEME_OPTIONS[themeName].name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {THEME_KEYS_WITHOUT_NAME.map((themeKey) => (
                        <label
                            key={`theme_key_${themeKey}`}
                            htmlFor={`theme_key_${themeKey}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            <Typography>{THEME_FIELDS_TO_LABEL[themeKey]} :</Typography>
                            <input
                                id={`theme_key_${themeKey}`}
                                type="color"
                                value={themeStore.newTheme[themeKey]}
                                onChange={(e) => {
                                    themeStore.updateStringField(themeKey, e.target.value);
                                }}
                            />
                        </label>
                    ))}
                </Box>
            </Box>
            <CenteredDiv>
                <GaladrimButton
                    sx={{ mt: 4 }}
                    onClick={() => themeStore.save()}
                    isLoading={themeStore.loadingStore.isLoading}
                    fullWidth={false}
                >
                    Sauvegarder
                </GaladrimButton>
            </CenteredDiv>

            <CenteredDiv style={{ marginTop: 80 }}>
                <ThemeOfficeRoomCalendar />
            </CenteredDiv>
            <RoundedLinks linkInfos={[{ Icon: ArrowBack, link: "/profile" }]} />
        </MainLayout>
    );
});

export default ThemePage;
