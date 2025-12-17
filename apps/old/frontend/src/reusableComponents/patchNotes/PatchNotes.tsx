import { Box, Chip, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { SimpleModal } from "../../reusableComponents/modal/SimpleModal";
import { SimpleModalStore } from "../../reusableComponents/modal/SimpleModalStore";
import { PATCH_CONTRIBUTORS, PATCH_NOTES, PATCH_VERSION } from "../../utils/patchNotesInfos";

const PATCH_VERSION_KEY = "PATCH_VERSION";

export const PatchNotes = observer(() => {
    const modalStore = useMemo(() => new SimpleModalStore(), []);
    const isMobile = useIsMobile();

    useEffect(() => {
        const oldPatchVersion = localStorage.getItem(PATCH_VERSION_KEY);
        const shouldDisplay = oldPatchVersion !== PATCH_VERSION && PATCH_NOTES.length !== 0;
        if (shouldDisplay) {
            modalStore.setModalOpen(true);
        }
        localStorage.setItem(PATCH_VERSION_KEY, PATCH_VERSION);
    }, [modalStore]);

    return (
        <SimpleModal
            width={isMobile ? "80vw" : undefined}
            open={modalStore.modalOpen}
            onClose={() => modalStore.setModalOpen(false)}
        >
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontSize: 18 }}>Changements pour la version</Typography>
                <Chip sx={{ ml: 2 }} label={PATCH_VERSION} />
            </Box>

            <ul style={{ fontFamily: `"Roboto","Helvetica","Arial",sans-serif` }}>
                {PATCH_NOTES.map((note, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <li key={index}>{note}</li>
                ))}
            </ul>

            <Typography sx={{ mt: 2 }} variant="subtitle2">
                Merci à {PATCH_CONTRIBUTORS.join(", ")} ❤️
            </Typography>
        </SimpleModal>
    );
});
