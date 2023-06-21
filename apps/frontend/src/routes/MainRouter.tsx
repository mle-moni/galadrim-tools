import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppStore } from '../globalStores/AppStore'
import IdeaPage from '../pages/idea/IdeaPage'
import LoadingPage from '../pages/loading/LoadingPage'
import { RenouvArtWait } from '../reusableComponents/animations/RenouvArtWait/RenouvArtWait'

const TournoisPage = React.lazy(() => import('../pages/games/tournois/TournoisPage'))
const StatisticsPage = React.lazy(() => import('../pages/statistics/StatisticsPage'))
const NotificationsSettingsPage = React.lazy(
    () => import('../pages/profile/notifications/NotificationsSettingsPage')
)
const CreateRestaurantPage = React.lazy(
    () => import('../pages/saveur/createRestaurant/CreateRestaurantPage')
)
const EditRestaurantPage = React.lazy(
    () => import('../pages/saveur/editRestaurant/EditRestaurantPage')
)
const SaveurPage = React.lazy(() => import('../pages/saveur/SaveurPage'))
const RestaurantsListPage = React.lazy(
    () => import('../pages/saveur/restaurantsLists/RestaurantsListPage')
)
const HomePage = React.lazy(() => import('../pages/HomePage'))
const RoomsHomePage = React.lazy(() => import('../pages/room/RoomsHomePage'))
const LoginPage = React.lazy(() => import('../pages/login/LoginPage'))
const GetOtpPage = React.lazy(() => import('../pages/getOtp/GetOtpPage'))
const ChangePasswordPage = React.lazy(() => import('../pages/changePassword/ChangePasswordPage'))
const CreateUserPage = React.lazy(() => import('../pages/admin/createUser/CreateUserPage'))
const AdminRightsPage = React.lazy(() => import('../pages/admin/rights/AdminRightsPage'))
const NotificationsAdminPage = React.lazy(
    () => import('../pages/admin/notifications/NotificationsAdminPage')
)
const DashboardPage = React.lazy(() => import('../pages/admin/dashboard/DashboardPage'))
const AdminPage = React.lazy(() => import('../pages/admin/AdminPage'))
const RoomPage = React.lazy(() => import('../pages/room/RoomPage'))
const NotFoundPage = React.lazy(() => import('../pages/errors/404/NotFoundPage'))
const ProfilePage = React.lazy(() => import('../pages/profile/ProfilePage'))
const MyRestaurantNotesPage = React.lazy(
    () => import('../pages/saveur/myRestaurantNotes/MyRestaurantNotesPage')
)
const NewCodeNamesGamePage = React.lazy(() => import('../pages/codeNames/NewCodeNamesGamePage'))
const CodeNamesGamePage = React.lazy(() => import('../pages/codeNames/CodeNamesGamePage'))
const ScamWinnerPage = React.lazy(() => import('../pages/scam/ScamWinnerPage'))

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
                    style={{ boxSizing: 'border-box' }}
                >
                    <RenouvArtWait />
                </div>
            )}
        </>
    )
}

const AppRoutes = () => {
    const navigate = useNavigate()

    useEffect(() => {
        AppStore.setNavigation(navigate)
    }, [])

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/getOtp" element={<GetOtpPage />} />
                <Route path="/changePassword" element={<ChangePasswordPage />} />
                <Route path="/admin/createUser" element={<CreateUserPage />} />
                <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
                <Route path="/admin/rights" element={<AdminRightsPage />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/rooms" element={<RoomsHomePage />} />
                <Route path="/rooms/statistics" element={<StatisticsPage />} />
                <Route path="room" element={<RoomPage />}>
                    <Route path=":roomName" element={<RoomPage />} />
                </Route>
                <Route path="/saveur/myRestaurantNotes" element={<MyRestaurantNotesPage />} />
                <Route path="/saveur/restaurants/:id" element={<EditRestaurantPage />} />
                <Route path="/saveur/createRestaurant" element={<CreateRestaurantPage />} />
                <Route path="/saveur/restaurantsList/:listName" element={<RestaurantsListPage />} />
                <Route path="/saveur" element={<SaveurPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/games/tournois" element={<TournoisPage />} />
                <Route path="/codeNames" element={<Navigate to={'/codeNamesGame'} />} />
                <Route path="/codeNamesGame" element={<NewCodeNamesGamePage />} />
                <Route path="/codeNamesGame/:id" element={<CodeNamesGamePage />} />
                <Route
                    path="/profile/notificationsSettings"
                    element={<NotificationsSettingsPage />}
                />
                <Route path="/ideas" element={<IdeaPage />} />
                <Route path="/galadrim/scam/winner/omg" element={<ScamWinnerPage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    )
}

export default observer(MainRouter)
