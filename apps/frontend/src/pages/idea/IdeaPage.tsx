import { Lightbulb } from "@mui/icons-material";
import BackIcon from "@mui/icons-material/ChevronLeft";
import { Box, Chip, Tab, Tabs, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { useCheckConnection } from "../../hooks/useCheckConnection";
import { useIsMobile } from "../../hooks/useIsMobile";
import { CenteredDiv } from "../../reusableComponents/common/CenteredDiv";
import { GaladrimButton } from "../../reusableComponents/common/GaladrimButton";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import { SimpleModal } from "../../reusableComponents/modal/SimpleModal";
import { SimpleModalStore } from "../../reusableComponents/modal/SimpleModalStore";
import CreateIdeaModal from "./CreateIdeaModal";
import DisplayIdeas from "./DisplayIdeas";
import { SHOULD_NOT_PASS_ACTIVATED } from "./IdeasStore";

export type IdeaPageStateValue = "todo" | "doing" | "done" | "refused" | "you_should_not_pass";

export interface IdeaPageState {
    label: string;
    message: string;
    value: IdeaPageStateValue;
    isBad?: boolean;
}

const IDEA_PAGE_STATES: IdeaPageState[] = [
    { label: "A faire 👀", message: "à faire", value: "todo" },
    { label: "En cours 🚀", message: "en cours", value: "doing" },
    { label: "Terminées ✅", message: "terminée", value: "done" },
    { label: "Refusées 🚫", message: "refusée", value: "refused", isBad: true },
];

if (SHOULD_NOT_PASS_ACTIVATED) {
    IDEA_PAGE_STATES.push({
        label: "You shall not pass! 🧙‍♂️",
        message: "you shall not pass",
        value: "you_should_not_pass",
    });
}

interface TabTitleProps {
    label: string;
    badgeNumber: number;
}

const TabTitle = observer<TabTitleProps>(({ label, badgeNumber }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Typography>{label}</Typography>
            <Chip label={badgeNumber} color="secondary" />
        </Box>
    );
});

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = observer<TabPanelProps>(({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index} style={{ marginTop: 20 }}>
            {value === index && children}
        </div>
    );
});

const IdeaPage = observer(() => {
    const [tab, setTab] = useState<0 | 1 | 2 | 3>(0);
    const modalStore = useMemo(() => new SimpleModalStore(), []);
    const isMobile = useIsMobile();

    const { ideaStore, authStore } = AppStore;

    useEffect(() => {
        if (!ideaStore.loadingState.isLoading) {
            ideaStore.fetchIdeaList();
        }
    }, [ideaStore]);

    useCheckConnection(authStore);

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: "/" }]} />
            <Typography
                style={{ textAlign: "center", fontSize: 32 }}
                sx={{ paddingTop: [10, null, "30px"] }}
            >
                Proposer une idée pour améliorer Galadrim
            </Typography>

            <CenteredDiv>
                <GaladrimButton
                    sx={{ my: 2 }}
                    fullWidth={false}
                    startIcon={<Lightbulb />}
                    onClick={() => modalStore.setModalOpen(true)}
                >
                    J'ai une idée !
                </GaladrimButton>
            </CenteredDiv>
            <Tabs
                variant={isMobile ? "scrollable" : "fullWidth"}
                value={tab}
                onChange={(_event, tab) => setTab(tab)}
                scrollButtons={false}
            >
                {IDEA_PAGE_STATES.map(({ value, label }) => (
                    <Tab
                        key={value}
                        label={
                            <TabTitle
                                label={label}
                                badgeNumber={ideaStore.ideasByState[value].length}
                            />
                        }
                    />
                ))}
            </Tabs>
            {IDEA_PAGE_STATES.map((state, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <TabPanel index={index} value={tab} key={index}>
                    <DisplayIdeas state={state} />
                </TabPanel>
            ))}
            <SimpleModal
                open={modalStore.modalOpen}
                onClose={() => modalStore.setModalOpen(false)}
                width={isMobile ? "80%" : undefined}
            >
                <CreateIdeaModal
                    onPublish={() => {
                        modalStore.setModalOpen(false);
                    }}
                />
            </SimpleModal>
        </>
    );
});

export default IdeaPage;
