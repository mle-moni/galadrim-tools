import { Masonry } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { AppStore } from "../../globalStores/AppStore";
import { useIsMobile } from "../../hooks/useIsMobile";
import { RenouvArtWait } from "../../reusableComponents/animations/RenouvArtWait/RenouvArtWait";
import { CenteredDiv } from "../../reusableComponents/common/CenteredDiv";
import Idea from "./Idea";
import type { IdeaPageState } from "./IdeaPage";

interface DisplayIdeasProps {
    state: IdeaPageState;
}

const DisplayIdeas = observer<DisplayIdeasProps>(({ state }) => {
    const { authStore, ideaStore } = AppStore;
    const isMobile = useIsMobile();
    const [searchParams] = useSearchParams();

    const ideasByState = ideaStore.ideasByState;
    const { value, message, isBad = false } = state;
    const ideas = ideasByState[value];

    if (ideas.length > 0) {
        return (
            <CenteredDiv>
                <Masonry
                    sx={{
                        width: "80%",
                        marginBottom: 0,
                        alignContent: "center",
                    }}
                    columns={isMobile ? 1 : 5}
                    spacing={3}
                >
                    {ideas.map((idea) => (
                        <Idea
                            key={idea.id}
                            idea={idea}
                            user={authStore.user}
                            isBad={isBad}
                            areCommentsOpen={idea.id.toString() === searchParams.get("ideaId")}
                        />
                    ))}
                </Masonry>
            </CenteredDiv>
        );
    }
    if (ideaStore.loadingState.isLoading) {
        return (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <RenouvArtWait />
            </Box>
        );
    }
    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Typography>Il n'y a aucune idée {message} pour le moment.</Typography>
        </Box>
    );
});

export default DisplayIdeas;
