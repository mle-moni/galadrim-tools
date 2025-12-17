import MailIcon from "@mui/icons-material/AlternateEmail";
import { Box, Button, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../api/fetch";
import { AppStore } from "../../globalStores/AppStore";
import { GaladrimLogo } from "../../reusableComponents/Branding/GaladrimLogo";
import { CustomLink } from "../../reusableComponents/Core/CustomLink";
import { GaladrimRoomsCard } from "../../reusableComponents/Core/GaladrimRoomsCard";
import { TextInputWithIcon } from "../../reusableComponents/form/TextInputWithIcon";
import { PasswordInput } from "./PasswordInput";

export const Login = observer(() => {
    const { authStore } = AppStore;

    const navigate = useNavigate();

    useEffect(() => {
        if (authStore.connected) {
            navigate("/");
        }
    }, [authStore, navigate]);

    const forestLogin = () => {
        location.replace(`${getApiUrl()}/forestLogin`);
    };

    return (
        <GaladrimRoomsCard size="large" sx={{ width: "100%", maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    authStore.login();
                }}
            >
                <TextInputWithIcon
                    value={authStore.email}
                    onChange={(value) => authStore.setEmail(value)}
                    placeholder="Adresse e-mail"
                    Icon={MailIcon}
                />
                <PasswordInput />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!authStore.canAuthenticate}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Se connecter
                </Button>

                <Box className="flex w-full justify-center">
                    <Typography className="text-center">ou</Typography>
                </Box>
                <Button
                    fullWidth
                    variant="contained"
                    type="button"
                    size="large"
                    sx={{ my: 2 }}
                    onClick={forestLogin}
                    color="info"
                >
                    Se connecter avec Forest
                </Button>
                <CustomLink to="/getOtp">Mot de passe oublié ?</CustomLink>
            </form>
        </GaladrimRoomsCard>
    );
});
