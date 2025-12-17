import BackIcon from "@mui/icons-material/ChevronLeft";
import { Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { fetchBackendJson, getErrorMessage } from "../../api/fetch";
import { AppStore } from "../../globalStores/AppStore";
import { GaladrimLogo } from "../../reusableComponents/Branding/GaladrimLogo";
import { CustomLink } from "../../reusableComponents/Core/CustomLink";
import { GaladrimRoomsCard } from "../../reusableComponents/Core/GaladrimRoomsCard";
import { RenouvArtWait } from "../../reusableComponents/animations/RenouvArtWait/RenouvArtWait";
import { BasicSelect } from "../../reusableComponents/form/BasicSelect";
import { notifyError, notifySuccess } from "../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../idea/createIdea/CreateIdeaStore";
import { useOfficeSelect } from "../office-rooms/useOfficeSelect";

export const ChangeDefaultOffice = observer(() => {
    const { authStore } = AppStore;
    const { officesOptions } = useOfficeSelect();
    const changeOfficeMutation = useMutation({
        mutationFn: async (officeId: number) => {
            const res = await fetchBackendJson("/changeDefaultOffice", "POST", {
                body: JSON.stringify({ officeId }),
                headers: APPLICATION_JSON_HEADERS,
            });
            if (res.ok) {
                authStore.setOfficeId(officeId);
                notifySuccess("Paramètres sauvegardés");
            } else {
                notifyError(
                    getErrorMessage(res.json, "Impossible de changer de locaux par défaut"),
                );
            }
        },
    });
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | undefined>(
        authStore.userOrNull?.officeId ?? undefined,
    );

    return (
        <GaladrimRoomsCard size="large" sx={{ width: "100%", maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedOfficeId) return;
                    changeOfficeMutation.mutate(selectedOfficeId);
                }}
            >
                {officesOptions.length === 0 && <RenouvArtWait />}

                {officesOptions.length > 0 && (
                    <BasicSelect
                        label="Locaux par défaut"
                        options={officesOptions}
                        value={selectedOfficeId}
                        onChange={(value) => setSelectedOfficeId(value)}
                    />
                )}

                <Button
                    fullWidth
                    variant="contained"
                    disabled={changeOfficeMutation.isPending}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Changer de locaux par défaut
                </Button>
                <CustomLink to="/">
                    <BackIcon /> Retour à l'accueil
                </CustomLink>
            </form>
        </GaladrimRoomsCard>
    );
});
