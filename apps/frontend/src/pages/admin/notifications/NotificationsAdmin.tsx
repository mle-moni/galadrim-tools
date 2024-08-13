import { TextSnippet } from "@mui/icons-material";
import BackIcon from "@mui/icons-material/ChevronLeft";
import { Alert, Autocomplete, Button, TextField } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { GaladrimLogo } from "../../../reusableComponents/Branding/GaladrimLogo";
import { CustomLink } from "../../../reusableComponents/Core/CustomLink";
import { GaladrimRoomsCard } from "../../../reusableComponents/Core/GaladrimRoomsCard";
import { TextInputWithIcon } from "../../../reusableComponents/form/TextInputWithIcon";
import { NotificationsAdminStore } from "./NotificationsAdminStore";

export const NotificationsAdmin = observer(() => {
    const store = useMemo(() => new NotificationsAdminStore(), []);

    return (
        <GaladrimRoomsCard size="large" sx={{ width: "100%", maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    store.createNotification();
                }}
            >
                <Alert severity="info">
                    Si vous ne sélectionnez aucun utilisateur, la notification sera envoyée à tous
                    les utilisateurs
                </Alert>
                <br />
                <Autocomplete
                    disablePortal
                    options={store.userOptions}
                    multiple
                    fullWidth
                    value={store.usersValue}
                    renderInput={(params) => <TextField {...params} label="Utilisateurs" />}
                    onChange={(_e, value) => {
                        if (value) {
                            store.setUsersValue(value);
                        }
                    }}
                    isOptionEqualToValue={(a, b) => a.value === b.value}
                    filterSelectedOptions
                />

                <TextInputWithIcon
                    value={store.title.text}
                    placeholder="Titre"
                    onChange={(value) => store.title.setText(value)}
                    Icon={TextSnippet}
                    required
                />

                <TextInputWithIcon
                    value={store.text.text}
                    placeholder="Texte"
                    onChange={(value) => store.text.setText(value)}
                    Icon={TextSnippet}
                    required
                />
                <TextInputWithIcon
                    value={store.link.text}
                    placeholder="Lien (facultatif)"
                    onChange={(value) => store.link.setText(value)}
                    Icon={TextSnippet}
                />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!store.canCreateNotification}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Créer une notification
                </Button>
                <CustomLink to="/admin">
                    <BackIcon /> Retour à la page d'administration
                </CustomLink>
            </form>
        </GaladrimRoomsCard>
    );
});
