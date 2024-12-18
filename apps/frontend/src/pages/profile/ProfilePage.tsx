import {
    AlternateEmail,
    Business,
    ColorLens,
    Home,
    Key,
    Person,
    Settings,
} from "@mui/icons-material";
import { Avatar, Button, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { GaladrimLogo } from "../../reusableComponents/Branding/GaladrimLogo";
import { CustomLink } from "../../reusableComponents/Core/CustomLink";
import { GaladrimRoomsCard } from "../../reusableComponents/Core/GaladrimRoomsCard";
import { createApiToken } from "../../reusableComponents/auth/createApiToken";
import { CenteredDiv } from "../../reusableComponents/common/CenteredDiv";
import { GaladrimButton } from "../../reusableComponents/common/GaladrimButton";
import { RoundedLinks } from "../../reusableComponents/common/RoundedLinks";
import { TextFieldStore } from "../../reusableComponents/form/TextFieldStore";
import { TextInputWithIcon } from "../../reusableComponents/form/TextInputWithIcon";
import MainLayout from "../../reusableComponents/layouts/MainLayout";

export const ProfilePage = observer(() => {
    const { authStore } = AppStore;
    const userNameStore = useMemo(
        () => new TextFieldStore(authStore.user.username),
        [authStore.user.username],
    );
    const emailStore = useMemo(
        () => new TextFieldStore(authStore.user.email),
        [authStore.user.email],
    );

    const [createTokenLoading, setCreateTokenLoading] = useState(false);

    const handleCreateToken = async () => {
        setCreateTokenLoading(true);
        await createApiToken();
        setCreateTokenLoading(false);
    };

    return (
        <MainLayout fullscreen={false}>
            <CenteredDiv>
                <RoundedLinks linkInfos={[{ Icon: Home, link: "/" }]} />
                <GaladrimRoomsCard size="large" sx={{ width: "100%", maxWidth: 600, mt: 4 }}>
                    <GaladrimLogo align="center" sx={{ mb: 2 }} />
                    <Typography sx={{ fontSize: 26, textAlign: "center", m: 2 }}>
                        Modifier vos informations
                    </Typography>
                    <form
                        style={{ marginBottom: 20 }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            authStore.updateProfile(userNameStore.text, emailStore.text);
                        }}
                    >
                        <CenteredDiv style={{ flexDirection: "column" }}>
                            <TextInputWithIcon
                                value={userNameStore.text}
                                placeholder="Nom d'utilisateur"
                                onChange={(value) => userNameStore.setText(value)}
                                Icon={Person}
                            />
                            <TextInputWithIcon
                                value={emailStore.text}
                                placeholder="Adresse email"
                                onChange={(value) => emailStore.setText(value)}
                                Icon={AlternateEmail}
                            />
                        </CenteredDiv>

                        <div className="flex justify-center" style={{ marginTop: "24px" }}>
                            <Avatar
                                alt={authStore.user.username}
                                src={authStore.imageSrc ?? authStore.user.imageUrl}
                                sx={{ width: 256, height: 256, mb: 1 }}
                            />
                        </div>
                        <CenteredDiv>
                            <Button variant="contained" component="label" sx={{ my: 2 }}>
                                Changer l'image de profil
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    id="image"
                                    multiple
                                    onChange={(e) => authStore.setUploadedImage(e.target)}
                                />
                            </Button>
                            {authStore.image !== null && (
                                <span style={{ marginLeft: "12px" }}>({authStore.image.name})</span>
                            )}
                        </CenteredDiv>
                        <br />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            sx={{ my: 2 }}
                        >
                            Mettre à jour le profil
                        </Button>
                    </form>

                    <GaladrimButton onClick={handleCreateToken} isLoading={createTokenLoading}>
                        Generer un API token
                    </GaladrimButton>

                    <CustomLink
                        to="/changePassword"
                        style={{ marginBottom: "20px", marginTop: "40px" }}
                    >
                        <Key sx={{ mr: 1 }} /> Changer votre mot de passe
                    </CustomLink>

                    <CustomLink to="/profile/theme" style={{ marginBottom: "20px" }}>
                        <ColorLens sx={{ mr: 1 }} /> Thème
                    </CustomLink>

                    <CustomLink
                        to="/profile/notificationsSettings"
                        style={{ marginBottom: "20px" }}
                    >
                        <Settings sx={{ mr: 1 }} /> Paramètres de notifications
                    </CustomLink>

                    <CustomLink to="/changeDefaultOffice" style={{ marginBottom: "20px" }}>
                        <Business sx={{ mr: 1 }} /> Changer les locaux auxquels vous êtes rattaché
                    </CustomLink>

                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => authStore.logout()}
                    >
                        Déconnexion
                    </Button>
                </GaladrimRoomsCard>
            </CenteredDiv>
        </MainLayout>
    );
});

export default ProfilePage;
