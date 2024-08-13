import { useRights } from "../../../hooks/useRights";
import MainLayout from "../../../reusableComponents/layouts/MainLayout";
import { NotificationsAdmin } from "./NotificationsAdmin";

export const NotificationsAdminPage = () => {
    useRights("all", ["NOTIFICATION_ADMIN"], "/admin");

    return (
        <MainLayout fullscreen>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <NotificationsAdmin />
            </div>
        </MainLayout>
    );
};

export default NotificationsAdminPage;
