import { type AllRights, hasRights } from "@galadrim-tools/shared";
import {
    ChevronLeft,
    Dashboard,
    NotificationAdd,
    PersonAddAlt,
    Settings,
} from "@mui/icons-material";
import { styled, type SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { AppStore } from "../../globalStores/AppStore";
import { CustomLink } from "../../reusableComponents/Core/CustomLink";
import { GaladrimRoomsCard } from "../../reusableComponents/Core/GaladrimRoomsCard";
import MainLayout from "../../reusableComponents/layouts/MainLayout";

interface LinkFormat {
    to: string;
    text: string;
    icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">>;
    right: AllRights;
}

const allLinks: LinkFormat[] = [
    {
        to: "/admin/createUser",
        text: "Créer un utilisateur",
        icon: PersonAddAlt,
        right: "USER_ADMIN",
    },
    {
        to: "/admin/rights",
        text: "Gerer les droits des utilisateurs",
        icon: Settings,
        right: "RIGHTS_ADMIN",
    },
    {
        to: "/admin/dashboard",
        text: "Accéder au dashboard",
        icon: Dashboard,
        right: "DASHBOARD_ADMIN",
    },
    {
        to: "/admin/notifications",
        text: "Envoyer des notifications",
        icon: NotificationAdd,
        right: "NOTIFICATION_ADMIN",
    },
    { to: "/", text: `Retour à l'accueil`, icon: ChevronLeft, right: "DEFAULT" },
];

const StyledDiv = styled("div")({
    display: "flex",
    justifyContent: "center",
});

export const AdminPage = () => {
    const user = AppStore.authStore.user;
    const links = useMemo(
        () => allLinks.filter(({ right }) => hasRights(user.rights, [right])),
        [user.rights],
    );

    if (user.rights === 0) {
        return <Navigate to={"/"} />;
    }

    return (
        <MainLayout fullscreen>
            <StyledDiv>
                <GaladrimRoomsCard size="large" sx={{ width: "100%", maxWidth: 600 }}>
                    <h1 style={{ textAlign: "center" }}>Administration</h1>
                    {links.map((link) => (
                        <CustomLink key={link.to} to={link.to} p={1}>
                            <link.icon sx={{ mr: 1 }} />
                            {link.text}
                        </CustomLink>
                    ))}
                </GaladrimRoomsCard>
            </StyledDiv>
        </MainLayout>
    );
};

export default AdminPage;
