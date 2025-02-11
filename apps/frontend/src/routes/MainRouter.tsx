import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppStore } from "../globalStores/AppStore";
import IdeaPage from "../pages/idea/IdeaPage";
import LoadingPage from "../pages/loading/LoadingPage";
import { RenouvArtWait } from "../reusableComponents/animations/RenouvArtWait/RenouvArtWait";

const OfficeRoomsPage = React.lazy(() => import("../pages/office-rooms/OfficeRoomsPage"));
const OfficeRoomsAdminPage = React.lazy(
    () => import("../pages/office-rooms/admin/OfficeRoomAdminPage"),
);
const GalakiPage = React.lazy(() => import("../pages/games/galaki/GalakiPage"));
const TournoisPage = React.lazy(() => import("../pages/games/tournois/TournoisPage"));
const StatisticsPage = React.lazy(() => import("../pages/statistics/StatisticsPage"));
const NotificationsSettingsPage = React.lazy(
    () => import("../pages/profile/notifications/NotificationsSettingsPage"),
);
const ThemePage = React.lazy(() => import("../pages/profile/theme/ThemePage"));
const CreateRestaurantPage = React.lazy(
    () => import("../pages/saveur/createRestaurant/CreateRestaurantPage"),
);
const EditRestaurantPage = React.lazy(
    () => import("../pages/saveur/editRestaurant/EditRestaurantPage"),
);
const SaveurPage = React.lazy(() => import("../pages/saveur/SaveurPage"));
const RestaurantsListPage = React.lazy(
    () => import("../pages/saveur/restaurantsLists/RestaurantsListPage"),
);
const RewindRecapPage = React.lazy(() => import("../pages/saveur/rewind/RewindRecapPage"));
const RewindPage = React.lazy(() => import("../pages/saveur/rewind/RewindPage"));
const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/login/LoginPage"));
const GetOtpPage = React.lazy(() => import("../pages/getOtp/GetOtpPage"));
const ChangePasswordPage = React.lazy(() => import("../pages/changePassword/ChangePasswordPage"));
const ChangeDefaultOfficePage = React.lazy(
    () => import("../pages/changeDefaultOffice/ChangeDefaultOfficePage"),
);
const CreateUserPage = React.lazy(() => import("../pages/admin/createUser/CreateUserPage"));
const AdminRightsPage = React.lazy(() => import("../pages/admin/rights/AdminRightsPage"));
const NotificationsAdminPage = React.lazy(
    () => import("../pages/admin/notifications/NotificationsAdminPage"),
);
const DashboardPage = React.lazy(() => import("../pages/admin/dashboard/DashboardPage"));
const AdminPage = React.lazy(() => import("../pages/admin/AdminPage"));
const NotFoundPage = React.lazy(() => import("../pages/errors/404/NotFoundPage"));
const ProfilePage = React.lazy(() => import("../pages/profile/ProfilePage"));
const MyRestaurantNotesPage = React.lazy(
    () => import("../pages/saveur/myRestaurantNotes/MyRestaurantNotesPage"),
);
const NewCodeNamesGamePage = React.lazy(() => import("../pages/codeNames/NewCodeNamesGamePage"));
const CodeNamesGamePage = React.lazy(() => import("../pages/codeNames/CodeNamesGamePage"));
const ScamWinnerPage = React.lazy(() => import("../pages/scam/ScamWinnerPage"));
const CaddyLogsPage = React.lazy(() => import("../pages/caddyLogs/CaddyLogsPage"));
const AtopLogsPage = React.lazy(() => import("../pages/atopLogs/AtopLogsPage"));

// ? this was the old cheat page
// const CodeNamesPage = React.lazy(() => import('../pages/codeNames/CodeNamesPage'))

const MainRouter = () => {
    return (
        <>
            {AppStore.appIsReady ? (
                <BrowserRouter>
                    <React.Suspense fallback={<LoadingPage />}>
                        <AppRoutes />
                    </React.Suspense>
                </BrowserRouter>
            ) : (
                <div
                    className="flex h-100vh justify-center align-center main-bg"
                    style={{ boxSizing: "border-box" }}
                >
                    <RenouvArtWait />
                </div>
            )}
        </>
    );
};

const AppRoutes = () => {
    const navigate = useNavigate();

    useEffect(() => {
        AppStore.setNavigation(navigate);
    }, [navigate]);

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/getOtp" element={<GetOtpPage />} />
                <Route path="/changePassword" element={<ChangePasswordPage />} />
                <Route path="/changeDefaultOffice" element={<ChangeDefaultOfficePage />} />
                <Route path="/admin/createUser" element={<CreateUserPage />} />
                <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
                <Route path="/admin/rights" element={<AdminRightsPage />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/office-rooms" element={<OfficeRoomsPage />} />
                <Route path="/office-rooms/:officeId" element={<OfficeRoomsPage />} />
                <Route
                    path="/office-rooms/:officeId/:officeFloorId"
                    element={<OfficeRoomsPage />}
                />
                <Route
                    path="/office-rooms/:officeId/:officeFloorId/:officeRoomId"
                    element={<OfficeRoomsPage />}
                />
                <Route path="/office-rooms/admin" element={<OfficeRoomsAdminPage />} />
                <Route path="/office-rooms/admin/:officeId" element={<OfficeRoomsAdminPage />} />
                <Route
                    path="/office-rooms/admin/:officeId/:officeFloorId"
                    element={<OfficeRoomsAdminPage />}
                />
                <Route
                    path="/office-rooms/admin/:officeId/:officeFloorId/:officeRoomId"
                    element={<OfficeRoomsAdminPage />}
                />
                <Route path="/rooms/statistics" element={<StatisticsPage />} />
                {/* <Route path="room" element={<RoomPage />}>
                    <Route path=":roomName" element={<RoomPage />} />
                </Route> */}
                <Route path="/saveur/myRestaurantNotes" element={<MyRestaurantNotesPage />} />
                <Route path="/saveur/restaurants/:id" element={<EditRestaurantPage />} />
                <Route path="/saveur/createRestaurant" element={<CreateRestaurantPage />} />
                <Route path="/saveur/restaurantsList/:listName" element={<RestaurantsListPage />} />
                <Route path="/saveur/rewind/recap" element={<RewindRecapPage />} />
                <Route path="/saveur/rewind" element={<RewindPage />} />
                <Route path="/saveur" element={<SaveurPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/games/tournois" element={<TournoisPage />} />
                <Route path="/games/galaki" element={<GalakiPage />} />
                <Route path="/codeNames" element={<Navigate to={"/codeNamesGame"} />} />
                <Route path="/codeNamesGame" element={<NewCodeNamesGamePage />} />
                <Route path="/codeNamesGame/:id" element={<CodeNamesGamePage />} />
                <Route
                    path="/profile/notificationsSettings"
                    element={<NotificationsSettingsPage />}
                />
                <Route path="/profile/theme" element={<ThemePage />} />
                <Route path="/ideas" element={<IdeaPage />} />
                <Route path="/galadrim/scam/winner/omg" element={<ScamWinnerPage />} />
                <Route path="/caddyLogs/:id" element={<CaddyLogsPage />} />
                <Route path="/atopLogs/:id" element={<AtopLogsPage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
};

export default observer(MainRouter);
