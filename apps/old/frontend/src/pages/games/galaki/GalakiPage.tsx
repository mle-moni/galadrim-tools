import BackIcon from "@mui/icons-material/ChevronLeft";
import { Stack, Typography, useTheme } from "@mui/material";
import { observer } from "mobx-react-lite";
import { type FC, useMemo } from "react";
import { RenouvArtWait } from "../../../reusableComponents/animations/RenouvArtWait/RenouvArtWait";
import { CenteredDiv } from "../../../reusableComponents/common/CenteredDiv";
import {
    GaladrimButton,
    type GaladrimButtonProps,
} from "../../../reusableComponents/common/GaladrimButton";
import { RoundedLinks } from "../../../reusableComponents/common/RoundedLinks";
import { GalakiStore } from "./GalakiStore";

const GalakiPage = () => {
    const guessStore = useMemo(() => {
        const store = new GalakiStore();
        store.fetchGuesses();
        return store;
    }, []);

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: "/" }]} />
            <Typography
                style={{ textAlign: "center", fontSize: 32 }}
                sx={{ paddingTop: [10, null, "30px"] }}
            >
                Galaki ?!
            </Typography>

            <CenteredDiv>
                {guessStore.fetchingGuess ? (
                    <RenouvArtWait />
                ) : (
                    <GuessComponent galakiStore={guessStore} />
                )}
            </CenteredDiv>
        </>
    );
};

const grades = [1, 2, 3, 4] as const;
const textByGrade = {
    1: "Impossible",
    2: "Difficile",
    3: "Ok",
    4: "Facile",
} satisfies Record<(typeof grades)[number], string>;
const colorByGrade = {
    1: "error",
    2: "warning",
    3: "success",
    4: "info",
} satisfies Record<(typeof grades)[number], GaladrimButtonProps["color"]>;

const GuessComponent: FC<{ galakiStore: GalakiStore }> = observer(({ galakiStore }) => {
    const currentguess = galakiStore.currentGuess;
    const theme = useTheme();

    if (currentguess === undefined) {
        return <>Il n'y a aucun portrait à deviner pour l'instant. Revenez plus tard</>;
    }

    return (
        <Stack
            gap={2}
            width="100%"
            alignItems="center"
            sx={{
                [theme.breakpoints.down("sm")]: {
                    padding: 2,
                },
            }}
        >
            <img
                src={currentguess.portraitGuessable.pictureUrl}
                width={350}
                height={350}
                style={{
                    maxWidth: "100%",
                    height: "auto",
                    aspectRatio: "1/1",
                }}
            />

            <details key={currentguess.id}>
                <summary style={{ cursor: "pointer" }}>Réponse</summary>
                {currentguess.portraitGuessable.guess}
            </details>

            <Stack
                flexDirection="row"
                flexWrap="wrap"
                gap={2}
                sx={{
                    [theme.breakpoints.down("sm")]: {
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "100%",
                    },
                }}
            >
                {grades.map((g) => (
                    <GaladrimButton
                        key={g}
                        onClick={() => {
                            galakiStore.setGuess(g);
                            galakiStore.processNextGuess();
                        }}
                        fullWidth={false}
                        color={colorByGrade[g]}
                    >
                        {textByGrade[g]}
                    </GaladrimButton>
                ))}
            </Stack>
        </Stack>
    );
});

export default observer(GalakiPage);
